export type RateLimit =
	| { ok: true }
	| { ok: false; delayMs: number; reason: "rateLimit"; timestamp: number }
	| { ok: false; delayMs: number; reason: "ban" };

export interface RateLimitedResponse {
	reason: "rateLimit";
	slotToken: number;
}

export interface BannedResponse {
	reason: "ban";
}

export type ProxyRejection = RateLimitedResponse | BannedResponse;
