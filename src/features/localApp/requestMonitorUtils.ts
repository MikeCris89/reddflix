import { RequestMonitor } from "../../utils/types";

export interface RateLimit {
	ok: boolean;
	delayMs: number;
	reason: "ban" | "rateLimit" | undefined;
}

export const evaluateRateLimit = async (
	now: number,
	reqMonitor: RequestMonitor,
	prunePending: (newPending: number[]) => Promise<void>,
) => {
	const dev = import.meta.env.MODE === "development";
	const window = dev ? 15_000 : 63_000;
	const maxReq = dev ? 2 : 10;

	const { recent, pending: rawPending, bannedUntil } = reqMonitor;

	// if temporary ban, block all requests for certain amount of time
	if (bannedUntil && now < bannedUntil)
		return {
			ok: false,
			delayMs: bannedUntil - now,
			reason: "ban" as const,
		};

	const filteredRecent = recent.filter((t) => now - t < window);

	// if any requests in pending state, put this req in pending
	const pending = rawPending.filter((t) => t > now);
	if (pending.length !== rawPending.length) {
		await prunePending(pending);
	}

	// if num of reqs is less than 10 within window AND pending is empty, allow request to go through
	if (filteredRecent.length < maxReq && pending.length === 0)
		return { ok: true, delayMs: 0, reason: undefined };

	const allRequests = [...filteredRecent, ...pending].sort((a, b) => a - b);

	// calculate proper delay to ensure the 10 requests per window block
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
