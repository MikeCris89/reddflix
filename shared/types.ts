export interface RateLimit {
	ok: boolean;
	delayMs: number;
	reason?: "ban" | "rateLimit";
	timestamp?: number;
}

export interface RateLimitedResponse {
	reason: "rateLimit";
	slotToken: number;
}

export interface BannedResponse {
	reason: "ban";
}

export type ProxyRejection = RateLimitedResponse | BannedResponse;
