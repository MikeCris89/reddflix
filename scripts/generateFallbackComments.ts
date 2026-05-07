/**
 * generateFallbackComments.ts
 * Scrapes Reddit comments for posts previously scraped by generateFallbackPosts.ts.
 *
 * Run with: npx tsx scripts/generateFallbackComments.ts
 */

import { writeFileSync, mkdirSync, existsSync, readFileSync } from "fs";
import { resolve } from "path";

import {
	type RedditComment,
	type RedditCommentFormatted,
} from "../src/features/reddit/redditTypes";

// ── Configuration ─────────────────────────────────────────────────────────────

const DELAY_MS = 9_000;
const FETCHES_PER_SUB_PER_RUN = 1;
const MAX_DEPTH = 3;
const MAX_TOP_LEVEL = 30;
const USER_AGENT = "reddflix-fallback-generator/1.0 (portfolio project)";

// ── Refine ────────────────────────────────────────────────────────────────────

function refineComment(
	comment: RedditComment,
	depth: number,
): RedditCommentFormatted {
	let replies: RedditCommentFormatted[] = [];
	if (
		depth < MAX_DEPTH &&
		comment.replies &&
		typeof comment.replies !== "string"
	) {
		replies = comment.replies.data.children
			.filter((c) => c.kind === "t1")
			.map((c) => refineComment(c.data, depth + 1));
	}
	return {
		id: comment.id,
		author: comment.author,
		body: comment.body,
		body_html: comment.body_html,
		score: comment.score,
		is_submitter: comment.is_submitter,
		created_utc: comment.created_utc,
		distinguished: comment.distinguished,
		parent_id: comment.parent_id,
		permalink: comment.permalink,
		replies,
	};
}

// ── Fetch ─────────────────────────────────────────────────────────────────────

async function fetchComments(
	postId: string,
): Promise<RedditCommentFormatted[]> {
	const url = `https://www.reddit.com/comments/${postId}.json?limit=100&depth=${MAX_DEPTH}`;
	const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
	if (!res.ok) throw new Error(`HTTP ${res.status} for post ${postId}`);
	const json = (await res.json()) as [
		unknown,
		{
			kind: string;
			data: { children: { kind: string; data: RedditComment }[] };
		},
	];
	return json[1].data.children
		.filter((c) => c.kind === "t1")
		.slice(0, MAX_TOP_LEVEL)
		.map((c) => refineComment(c.data, 0));
}

function sleep(ms: number) {
	return new Promise((r) => setTimeout(r, ms));
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
	const postsDir = resolve(import.meta.dirname, "../src/data/fallback/posts");
	const commentsDir = resolve(
		import.meta.dirname,
		"../src/data/fallback/comments",
	);
	mkdirSync(commentsDir, { recursive: true });

	const subreddits: string[] = JSON.parse(
		readFileSync(resolve(postsDir, "_manifest.json"), "utf-8"),
	);
	console.log(
		`Processing ${subreddits.length} subreddits (up to ${FETCHES_PER_SUB_PER_RUN} new fetches each)...\n`,
	);

	let totalFetched = 0,
		totalSkipped = 0,
		totalFailed = 0;
	const perSub: Record<
		string,
		{ fetched: number; skipped: number; failed: number }
	> = {};

	let lastFetchAt = 0;

	for (const sub of subreddits) {
		const posts: { id: string }[] = JSON.parse(
			readFileSync(resolve(postsDir, `${sub}.json`), "utf-8"),
		);
		let fetched = 0,
			skipped = 0,
			failed = 0;

		for (const post of posts) {
			if (fetched >= FETCHES_PER_SUB_PER_RUN) break;

			const outPath = resolve(commentsDir, `${post.id}.json`);
			if (existsSync(outPath)) {
				skipped++;
				continue;
			}

			const elapsed = Date.now() - lastFetchAt;
			if (elapsed < DELAY_MS) {
				const wait = DELAY_MS - elapsed;
				process.stdout.write(`    waiting ${(wait / 1000).toFixed(1)}s...\n`);
				await sleep(wait);
			}

			process.stdout.write(`r/${sub} [${post.id}] ... `);
			try {
				const comments = await fetchComments(post.id);
				lastFetchAt = Date.now();
				writeFileSync(outPath, JSON.stringify(comments, null, 2));
				fetched++;
				console.log(`✓ ${comments.length} comments`);
			} catch (err) {
				lastFetchAt = Date.now();
				const msg = (err as Error).message;
				console.error(`✗ failed (${msg})`);
				failed++;
				if (msg.includes("HTTP 403") || msg.includes("HTTP 429")) {
					console.error(`\nFatal rate-limit/auth error — exiting.`);
					process.exit(1);
				}
			}
		}

		totalFetched += fetched;
		totalSkipped += skipped;
		totalFailed += failed;
		perSub[sub] = { fetched, skipped, failed };
	}

	console.log(
		`\nDone. fetched=${totalFetched} skipped=${totalSkipped} failed=${totalFailed}`,
	);
	console.log("\nPer-subreddit:");
	for (const [sub, s] of Object.entries(perSub)) {
		console.log(
			`  r/${sub}: fetched=${s.fetched} skipped=${s.skipped} failed=${s.failed}`,
		);
	}
}

main().catch((err) => {
	console.error("Fatal:", err);
	process.exit(1);
});
