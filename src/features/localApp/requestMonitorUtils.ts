import { getItem } from "../../utils/dbHelpers";

export interface RateLimit {
	ok: boolean;
	delayMs: number;
	reason: "ban" | "rateLimit" | undefined;
}

export const evaluateRateLimit = async (now: number) => {
	const bannedUntil = await getItem<number>("requestMonitor", "bannedUntil");

	if (bannedUntil && now < bannedUntil)
		return {
			ok: false,
			delayMs: bannedUntil - now,
			reason: "ban" as const,
		};

	const recent = (await getItem<number[]>("requestMonitor", "recent")) || [];

	const filteredRecent = recent.filter((t) => now - t < 63_000);

	if (filteredRecent.length < 10)
		return { ok: true, delayMs: 0, reason: undefined };

	const pending = (await getItem<number[]>("requestMonitor", "pending")) || [];

	let delayMs = 0;

	// get delay time. if # of pending exceeds # of recent, calc delay from pending list.
	if (pending.length < 10)
		delayMs = 63_000 - (now - filteredRecent[pending.length]);
	else {
		delayMs = 63_000 - (now - pending[pending.length - 10]);
	}
	return { ok: false, delayMs, reason: "rateLimit" as const };
};
