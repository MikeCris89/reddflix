// Constants
export const COOLDOWN_MS = 10 * 60 * 1000;

// Types
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
	bannedUntil?: number;
}

export const defaultMonitor: RequestMonitor = {
	bannedUntil: undefined,
};

export interface AppHandledError {
	message: string;
	pendingTimestamp: number;
	reason?: "rateLimit" | "ban";
	isAppHandledError: boolean;
	blockedLocally?: boolean;
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

// ==== HTTP RESPONSE ====
// =======================

export interface RateLimitedResponse {
	reason: "rateLimit";
	slotToken: number;
}

export interface BannedResponse {
	reason: "ban";
}

export type ProxyRejection = RateLimitedResponse | BannedResponse;

// HTTP Rejection typeguard
export const isRateLimitedResponse = (v: unknown): v is RateLimitedResponse => {
	if (!v || typeof v !== "object") return false;
	const obj = v as Record<string, unknown>;
	return obj.reason === "rateLimit" && typeof obj.slotToken === "number";
};

export const isBannedResponse = (v: unknown): v is BannedResponse => {
	if (!v || typeof v !== "object") return false;
	const obj = v as Record<string, unknown>;
	return obj.reason === "ban";
};
