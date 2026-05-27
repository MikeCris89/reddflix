import { Response } from "express";
import { rateLimiter } from "./rateLimiter";
import { BannedResponse, RateLimitedResponse } from "../types";
import { USER_AGENT } from "../config";
import { cache } from "./cache";
import { log } from "./logger";

export const BAN_DURATION_MS = 1000 * 60 * 5;
export const RATE_DURATION_MS = 1000 * 63;

export const proxyFetch = async (
	url: string,
	res: Response,
	originalUrl: string,
	ttlMs?: number,
) => {
	log.info("📡 Network request started.", { url: originalUrl });

	const resp = await fetch(url, {
		headers: { "User-Agent": USER_AGENT },
	});
	const { body: _body, ...restResp } = resp;
	console.log("Reddit Raw resp: ", restResp);
	if (!resp.ok) console.log("Reddit resp - ok false: ", resp);

	if (resp.status === 429) {
		console.error("429 Rate limit - Reddit Error: ", resp);
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
		console.error("403 Ban - Reddit Error: ", resp);
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

	cache.set(originalUrl, body, ttlMs);

	res.type("application/json").send(body);
};
