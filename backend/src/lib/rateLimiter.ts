// rateLimit.ts

export type RateLimit =
	| { ok: true }
	| { ok: false; delayMs: number; reason: "rateLimit"; timestamp: number }
	| { ok: false; delayMs: number; reason: "ban" };

const dev = process.env.NODE_ENV !== "production";

export const createRateLimiter = ({
	windowMs,
	maxReqs,
}: {
	windowMs: number;
	maxReqs: number;
}) => {
	let recent: number[] = [];
	let bannedUntil: number | undefined;

	const evaluate = (timestamp?: number, dateNow?: number): RateLimit => {
		const now = dateNow ?? Date.now();

		if (bannedUntil && now < bannedUntil) {
			return { ok: false, delayMs: bannedUntil - now, reason: "ban" };
		}

		recent = recent.filter((t) => now - t < windowMs);

		if (timestamp !== undefined) {
			const idx = recent.findIndex((t) => t === timestamp);
			if (idx !== -1 && timestamp <= now) {
				recent.splice(idx, 1, now);
				return { ok: true };
			}
		}

		if (recent.length < maxReqs) {
			recent.push(now);
			return { ok: true };
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

	const saturateRateLimit = (slot: number): void => {
		// Fill recent to capacity with current time. The reservation slot goes
		// on top, pushing recent into "over capacity" state so subsequent
		// requests reserve slots strictly after this one.
		recent = new Array(maxReqs).fill(Date.now());
		recent.push(slot);
	};

	const reset = () => {
		recent.length = 0;
		bannedUntil = undefined;
	};

	return { evaluate, recordBan, saturateRateLimit, reset };
};

// singleton for production use
// DEV MODE - prod: 10/63s
export const rateLimiter = createRateLimiter({
	windowMs: 15_000,
	maxReqs: 2,
});
