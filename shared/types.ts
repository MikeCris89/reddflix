export interface RateLimit {
	ok: boolean;
	delayMs: number;
	reason?: "ban" | "rateLimit";
	timestamp?: number;
}
