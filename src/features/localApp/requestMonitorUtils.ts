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

	const allRequests = [...filteredRecent, ...pending].sort((a, b) => a - b);

	// calculate proper delay to ensure the maxReq requests per window block
	const N = allRequests.length;
	const anchor = allRequests[N - maxReq];

	const T = anchor + window;
	const delayMs = T - now;

	return {
		ok: false,
		delayMs,
		reason: "rateLimit" as const,
	};
};
