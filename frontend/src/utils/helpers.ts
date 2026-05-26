import DOMPurify from "dompurify";
import {
	GifPost,
	ImagePost,
	isEmbedPost,
	isGalleryPost,
	isGifPost,
	isImagePost,
	isLinkPost,
	isSelfPost,
	isVideoPost,
	POST_TYPES,
	RawRedditPost,
	RedditCommentFormatted,
	RedditPost,
	VideoPost,
} from "../features/reddit/redditTypes";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { SerializedError } from "@reduxjs/toolkit";
import { toast } from "sonner";
import postsManifest from "../data/fallback/posts/_manifest.json";
import commentsManifest from "../data/fallback/comments/_manifest.json";

export const getPostType = (
	post: RawRedditPost | RedditPost,
): keyof typeof POST_TYPES => {
	const types: (keyof typeof POST_TYPES)[] = [];

	if (isVideoPost(post)) types.push(POST_TYPES.video);
	if (isEmbedPost(post)) types.push(POST_TYPES.embed);
	if (isGifPost(post)) types.push(POST_TYPES.gif);
	if (isImagePost(post)) types.push(POST_TYPES.image);
	if (isGalleryPost(post)) types.push(POST_TYPES.gallery);
	if (isSelfPost(post)) types.push(POST_TYPES.self);
	if (isLinkPost(post)) types.push(POST_TYPES.link);

	if (types.length > 1) {
		console.warn("⚠️ Post matched multiple types:", types, post);
	}

	return types[0] ?? POST_TYPES.unknown;
};

export const getCreatedTime = (time: number): string => {
	const today = new Date().getTime() / 1000;
	const diffS = today - time;
	const diffM = diffS / 60;
	const diffH = diffM / 60;
	const diffD = diffH / 24;
	if (diffH < 1) return Math.floor(diffM).toString() + "m";
	if (diffH > 23) return Math.floor(diffD).toString() + "d";
	return Math.floor(diffH).toString() + "h";
};

export const formatCounts = (num: number = 0): string => {
	if (num < 1000) return num.toString();
	if (num >= 1_000_000)
		return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "m";
	return (num / 1000).toFixed(1).replace(/\.0$/, "") + "k";
};

export const decodeHtml = (html: string) => {
	// Decode HTML entities (like &lt; &gt; etc.)
	const txt = document.createElement("textarea");
	txt.innerHTML = html;

	// Sanitize decoded HTML
	const clean = DOMPurify.sanitize(txt.value);

	// Add safe link behavior
	const parser = new DOMParser();
	const doc = parser.parseFromString(clean, "text/html");
	doc.querySelectorAll("a").forEach((a) => {
		a.setAttribute("data-clickable", "true");
		a.setAttribute("target", "_blank");
		a.setAttribute("rel", "noopener noreferrer");
	});

	const safeHtml = doc.body.innerHTML;

	// Remove outer wrapper div if present
	const match = safeHtml.match(/^<div[^>]*>([\s\S]*)<\/div>$/);
	return match ? match[1] : safeHtml;
};

export const getErrorMessage = (
	error: FetchBaseQueryError | SerializedError,
): string => {
	if ("status" in error) {
		if (typeof error.data === "string") return error.data;
		if (typeof error.data === "object") return JSON.stringify(error.data);
		return "Unknown fetch error";
	} else {
		return error.message || "Unknown client error";
	}
};

export const showCache = (storeName: string) => {
	const store_ = window.store;
	if (!store_) {
		console.warn(`Redux store ${storeName} not found on window`);
		return;
	}
	const state = store_.getState();
	const queries = state.redditApi?.queries;

	for (const [key, value] of Object.entries(queries || {})) {
		if (key.includes(`${storeName}`)) {
			console.log(`Found ${storeName} query:`);
			console.log(key, value);
		}
	}
};

export const handleNativeShare = async (
	url: string,
	text: string = "Check out this post from ReddFlix!",
) => {
	if (navigator.share) {
		try {
			await navigator.share({
				title: "ReddFlix",
				text,
				url,
			});
		} catch (err) {
			console.warn("Share cancelled or failed", err);
		}
	} else {
		navigator.clipboard.writeText(url);
		toast.success("Link copied!");
	}
};

export const getMinutesLeft = (
	cooldownMs: number,
	initTime?: number | null,
) => {
	return initTime
		? Math.max(0, Math.ceil((initTime + cooldownMs - Date.now()) / 60000))
		: 0;
};

export function relativeTime(utcSeconds: number): string {
	const diff = Date.now() / 1000 - utcSeconds;
	if (diff < 3600) return `${Math.max(1, Math.floor(diff / 60))}m`;
	if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
	if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
	if (diff < 2592000) return `${Math.floor(diff / 604800)}w`;
	if (diff < 31536000) return `${Math.floor(diff / 2592000)}mo`;
	return `${Math.floor(diff / 31536000)}y`;
}

export function decodeHtmlTitle(str: string): string {
	const txt = document.createElement("textarea");
	txt.innerHTML = str;
	return txt.value;
}

export const refinePost = (data: RawRedditPost): RedditPost => {
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
	};
};

export const hasPostFallback = (sub: string): boolean => {
	return (postsManifest as string[]).includes(sub);
};
export const hasCommentFallback = (sub: string): boolean => {
	return (commentsManifest as string[]).includes(sub);
};

export const isFallbackPost = (postId: string): boolean => {
	return (commentsManifest as string[]).includes(postId);
};

export const getFallbackPosts = async (sub: string): Promise<RedditPost[]> => {
	if (!hasPostFallback(sub)) return [];
	const module = await import(`../data/fallback/posts/${sub}.json`);
	return (module.default as RedditPost[]).map((post) => ({
		...post,
		type: getPostType(post),
	}));
};

export const getFallbackComments = async (
	postId: string,
): Promise<RedditCommentFormatted[]> => {
	if (!hasCommentFallback(postId)) return [];
	const module = await import(`../data/fallback/comments/${postId}.json`);
	return module.default as RedditCommentFormatted[];
};

export const getDecodedPreviewImage = (
	post: ImagePost | VideoPost | GifPost,
) => {
	const previewImg =
		post.preview?.images?.[0]?.resolutions?.find((r) => r.width >= 640)?.url ||
		post.preview?.images?.[0]?.source?.url ||
		post.thumbnail;

	return previewImg?.replace(/&amp;/g, "&") ?? null;
};

export const getGifMp4Url = (
	post: RedditPost | RawRedditPost,
): string | null => {
	const mp4 = post.preview?.images?.[0]?.variants?.mp4;
	if (!mp4) return null;
	// prefer a 320-wide version for previews; fall back to source
	const res = mp4.resolutions?.find((r) => r.width >= 320) ?? mp4.source;
	return res?.url?.replace(/&amp;/g, "&") ?? null;
};
