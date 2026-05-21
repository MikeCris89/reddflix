/**
 * generateFallbackPosts.ts
 * Fetches top 15 hot posts for each default subreddit and saves them to
 * src/data/fallback/posts, processed through refinePost logic.
 *
 * Run with: npx tsx scripts/generateFallbackPosts.ts
 */

import { writeFileSync, mkdirSync } from "fs";
import { resolve } from "path";

import { defaultSubreddits } from "../src/data/defaultSubreddits";
import {
	type RawRedditPost,
	type RedditPost,
	type RedditListing,
	POST_TYPES,
	isVideoPost,
	isEmbedPost,
	isGifPost,
	isImagePost,
	isGalleryPost,
	isSelfPost,
	isLinkPost,
} from "../src/features/reddit/redditTypes";

// ── Node-compatible re-implementation of helpers used by refinePost ──────────

/** Decodes common HTML entities found in Reddit titles (no DOM needed). */
function decodeHtmlTitle(str: string): string {
	return str
		.replace(/&amp;/g, "&")
		.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">")
		.replace(/&quot;/g, '"')
		.replace(/&#039;/g, "'")
		.replace(/&#x27;/g, "'")
		.replace(/&apos;/g, "'")
		.replace(/&nbsp;/g, " ");
}

function getPostType(post: RawRedditPost): keyof typeof POST_TYPES {
	const types: (keyof typeof POST_TYPES)[] = [];

	if (isVideoPost(post)) types.push(POST_TYPES.video);
	if (isEmbedPost(post)) types.push(POST_TYPES.embed);
	if (isGifPost(post)) types.push(POST_TYPES.gif);
	if (isImagePost(post)) types.push(POST_TYPES.image);
	if (isGalleryPost(post)) types.push(POST_TYPES.gallery);
	if (isSelfPost(post)) types.push(POST_TYPES.self);
	if (isLinkPost(post)) types.push(POST_TYPES.link);

	if (types.length > 1) {
		console.warn("⚠️  Post matched multiple types:", types, post.id);
	}

	return types[0] ?? POST_TYPES.unknown;
}

/** Mirror of refinePost from src/utils/helpers.ts (browser-dep-free). */
function refinePost(data: RawRedditPost): RedditPost {
	const parent = data.crosspost_parent_list?.[0];

	const base: RawRedditPost =
		!data.gallery_data &&
		!data.media_metadata &&
		parent?.gallery_data &&
		parent?.media_metadata
			? {
					...data,
					gallery_data: parent.gallery_data,
					media_metadata: parent.media_metadata,
				}
			: data;

	return {
		id: base.id,
		title: decodeHtmlTitle(base.title),
		subreddit: base.subreddit,
		thumbnail: base.thumbnail,
		url: base.url,
		permalink: base.permalink,
		author: base.author,
		created_utc: base.created_utc,
		score: base.score,
		num_comments: base.num_comments,
		post_hint: base.post_hint,
		media: base.media,
		media_metadata: base.media_metadata,
		gallery_data: base.gallery_data,
		secure_media: base.secure_media,
		preview: base.preview,
		is_video: base.is_video,
		is_self: base.is_self,
		selftext: base.selftext,
		selftext_html: base.selftext_html,
		url_overridden_by_dest: base.url_overridden_by_dest,
		type: getPostType(base),
		sample: true,
	};
}

// ── Fetch helpers ─────────────────────────────────────────────────────────────

const DELAY_MS = 10_000;
const LIMIT = 20;

async function fetchHotPosts(subreddit: string): Promise<RedditPost[]> {
	const url = `https://www.reddit.com/r/${subreddit}/hot.json?limit=${LIMIT}`;
	const res = await fetch(url, {
		headers: {
			"User-Agent": "reddflix-fallback-generator/1.0 (portfolio project)",
		},
	});

	if (!res.ok) {
		throw new Error(`HTTP ${res.status} for r/${subreddit}`);
	}

	const json = (await res.json()) as RedditListing<RawRedditPost>;
	return json.data.children
		.map((child) => child.data)
		.filter((post) => !post.stickied)
		.map(refinePost);
}

function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
	const subreddits = defaultSubreddits
		.map((s) => s.name)
		.sort((a, b) => a.localeCompare(b));

	console.log(
		`Fetching ${subreddits.length} subreddits (${DELAY_MS / 1000}s delay between each)...\n`,
	);

	const outDir = resolve(import.meta.dirname, "../src/data/fallback/posts");
	mkdirSync(outDir, { recursive: true });
	const manifest: string[] = [];

	for (let i = 0; i < subreddits.length; i++) {
		const name = subreddits[i];
		process.stdout.write(`[${i + 1}/${subreddits.length}] r/${name} ... `);

		try {
			const posts = await fetchHotPosts(name);
			writeFileSync(
				resolve(outDir, `${name}.json`),
				JSON.stringify(posts, null, 2),
			);
			if (posts.length > 0) manifest.push(name);
			console.log(`✓ ${posts.length} posts`);
		} catch (err) {
			const msg = (err as Error).message;
			console.error(`✗ failed (${msg})`);
			if (msg.includes("HTTP 403") || msg.includes("HTTP 429")) {
				writeFileSync(
					resolve(outDir, "_manifest.json"),
					JSON.stringify(manifest, null, 2),
				);
				console.error(
					`\nFatal rate-limit/auth error — wrote partial manifest and exiting.`,
				);
				process.exit(1);
			}
		}

		if (i < subreddits.length - 1) {
			process.stdout.write(`    waiting ${DELAY_MS / 1000}s...\n`);
			await sleep(DELAY_MS);
		}
	}

	writeFileSync(
		resolve(outDir, "_manifest.json"),
		JSON.stringify(manifest, null, 2),
	);
	console.log(
		`\nWrote ${subreddits.length} subreddit files + manifest to ${outDir}`,
	);
}

main().catch((err) => {
	console.error("Fatal:", err);
	process.exit(1);
});
