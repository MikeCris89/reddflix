import { RequestMonitor } from "../../utils/types";

export interface RateLimit {
	ok: boolean;
	delayMs: number;
	reason: "ban" | "rateLimit" | undefined;
}

export const evaluateRateLimit = async (
	now: number,
	reqMonitor: RequestMonitor,
	prunePending: (newPending: number[]) => Promise<void>
) => {
	const dev = process.env.NODE_ENV === "development";
	const window = dev ? 15_000 : 63_000;
	const maxReq = dev ? 2 : 10;
	const minGap = dev ? 1_000 : 2_000;

	const { recent, pending: rawPending } = reqMonitor;

	const filteredRecent = recent.filter((t) => now - t < window);

	// if any requests in pending state, put this req in pending
	const pending = rawPending.filter((t) => t > now);
	if (pending.length !== rawPending.length) {
		await prunePending(pending);
	}

	// if num of reqs is less than maxReq within window AND pending is empty, check gap
	if (filteredRecent.length < maxReq && pending.length === 0) {
		// enforce minimum gap between requests to avoid looking like a scraper
		if (filteredRecent.length > 0) {
			const mostRecent = Math.max(...filteredRecent);
			const timeSinceLast = now - mostRecent;
			if (timeSinceLast < minGap) {
				return {
					ok: false,
					delayMs: minGap - timeSinceLast,
					reason: "rateLimit" as const,
				};
			}
		}
		return { ok: true, delayMs: 0, reason: undefined };
	}

	// Rolling window is full — delay until the oldest request falls outside the window
	if (filteredRecent.length >= maxReq) {
		const sorted = [...filteredRecent].sort((a, b) => a - b);
		const anchor = sorted[sorted.length - maxReq];
		return {
			ok: false,
			delayMs: Math.max(1, anchor + window - now),
			reason: "rateLimit" as const,
		};
	}

	// A request is already queued (pending.length > 0) — wait for the earliest one to clear
	const earliest = Math.min(...pending);
	return {
		ok: false,
		delayMs: Math.max(1, earliest - now),
		reason: "rateLimit" as const,
	};
};
