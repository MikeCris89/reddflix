import { RedditPost } from "../features/reddit/redditTypes";

export const MODE = {
	preview: "preview",
	full: "full",
} as const;

export type ContentMode = keyof typeof MODE;

export const BUBBLE_ICON = {
	score: "score",
	chat: "chat",
	share: "share",
	link: "link",
} as const;

export type Categories = Record<string, Category>;

export interface Category {
	title: string;
	keywords?: string;
	active: boolean;
	subreddits?: string[];
	ttl: number;
}

export type Subreddits = Record<string, Subreddit>;

export interface Subreddit {
	title: string;
	name: string;
	active: boolean;
	ttl: number;
}

export type SeenPosts = {
	id: string;
	subreddit: string;
};

export interface RequestMonitor {
	recent: number[];
	pending: number[];
	bannedUntil?: number;
}

export const defaultMonitor: RequestMonitor = {
	recent: [],
	pending: [],
	bannedUntil: undefined,
};

export interface AppHandledError {
	message: string;
	delay: number;
	status?: number;
	reason?: "rateLimit" | "ban";
}

// ==== TYPEGUARDS ====
// =======================

export const isAppHandledError = (
	error: unknown
): error is Error & AppHandledError => {
	return (
		typeof error === "object" && error !== null && "isAppHandledError" in error
	);
};
