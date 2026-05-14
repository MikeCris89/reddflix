import { Response } from "express";
import { rateLimiter } from "../rateLimiter";
import { BannedResponse, RateLimitedResponse } from "../../../shared/types";

const BAN_DURATION_MS = 1000 * 60 * 5;
const RATE_DURATION_MS = 1000 * 60;

export const proxyFetch = async (url: string, res: Response) => {
	const resp = await fetch(url);

	if (resp.status === 429) {
		const slot = Date.now() + RATE_DURATION_MS;
		const delaySec = Math.ceil(RATE_DURATION_MS / 1000);
		const retryAfterHeader = resp.headers.get("retry-after");
		const retryAfterSec =
			retryAfterHeader && !isNaN(Number(retryAfterHeader))
				? Number(retryAfterHeader)
				: delaySec;
		rateLimiter.saturateRateLimit(slot);
		res
			.status(429)
			.set("Retry-After", String(retryAfterSec))
			.json({
				reason: "rateLimit",
				slotToken: slot,
			} satisfies RateLimitedResponse);
		return;
	}

	if (resp.status === 403) {
		const delaySec = Math.ceil(BAN_DURATION_MS / 1000);
		const retryAfterHeader = resp.headers.get("retry-after");
		const retryAfterSec =
			retryAfterHeader && !isNaN(Number(retryAfterHeader))
				? Number(retryAfterHeader)
				: delaySec;

		rateLimiter.recordBan(retryAfterSec * 1000);

		res
			.status(403)
			.set("Retry-After", String(retryAfterSec))
			.json({ reason: "ban" } satisfies BannedResponse);
		return;
	}

	if (!resp.ok) {
		throw new Error(`Reddit responded with ${resp.status}`);
	}

	const body = await resp.text();
	res.type("application/json").send(body);
};
