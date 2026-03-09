import DOMPurify from "dompurify";
import {
	isEmbedPost,
	isGalleryPost,
	isGifPost,
	isImagePost,
	isLinkPost,
	isSelfPost,
	isVideoPost,
	POST_TYPES,
	RawRedditPost,
	RedditPost,
} from "../features/reddit/redditTypes";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { SerializedError } from "@reduxjs/toolkit";
import { toast } from "sonner";

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
