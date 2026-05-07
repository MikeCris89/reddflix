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
	// title: string;
	name: string;
	active: boolean;
	ttl: number;
	lastUpdated?: number;
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

export const BAN_DURATION_MS = import.meta.env.DEV
	? 1000 * 60 * 30
	: 1000 * 60 * 25; // 25 minutes

export const defaultMonitor: RequestMonitor = {
	recent: [],
	pending: [],
	bannedUntil: undefined,
};

export interface AppHandledError {
	message: string;
	//delay: number;
	pendingTimestamp: number;
	status?: number;
	reason?: "rateLimit" | "ban";
	isAppHandledError: boolean;
}

// ==== TYPEGUARDS ====
// =======================

export const isAppHandledError = (
	error: unknown,
): error is { data: AppHandledError } => {
	return (
		typeof error === "object" &&
		error !== null &&
		"data" in error &&
		typeof error.data === "object" &&
		error.data != null &&
		"isAppHandledError" in error.data
	);
};
