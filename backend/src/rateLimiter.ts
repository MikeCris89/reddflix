// rateLimit.ts
import { RateLimit } from "../../shared/types";

const dev = process.env.NODE_ENV !== "production";
const windowMs = dev ? 15_000 : 63_000;
const maxReqs = dev ? 2 : 10;

export const createRateLimiter = () => {
	let recent: number[] = [];
	let bannedUntil: number | undefined;

	const evaluate = (timestamp?: number): RateLimit => {
		const now = Date.now();

		if (bannedUntil && now < bannedUntil) {
			return { ok: false, delayMs: bannedUntil - now, reason: "ban" };
		}

		recent = recent.filter((t) => now - t < windowMs);

		if (timestamp !== undefined) {
			const idx = recent.findIndex((t) => t === timestamp);
			if (idx !== -1 && timestamp <= now) {
				recent.splice(idx, 1, now);
				return { ok: true, delayMs: 0, reason: undefined };
			}
		}

		if (recent.length < maxReqs) {
			recent.push(now);
			return { ok: true, delayMs: 0, reason: undefined };
		}

		const anchor = recent[recent.length - maxReqs];
		const slot = anchor + windowMs;
		recent.push(slot);
		return {
			ok: false,
			delayMs: slot - now,
			reason: "rateLimit",
			timestamp: slot,
		};
	};

	const recordBan = (durationMs: number): void => {
		bannedUntil = Date.now() + durationMs;
	};

	return { evaluate, recordBan };
};

// singleton for production use
export const rateLimiter = createRateLimiter();
