import { Response } from "express";
import { rateLimiter } from "./rateLimiter";
import { BannedResponse, RateLimitedResponse } from "../types";
import { USER_AGENT } from "../config";
import { cache } from "./cache";
import { log } from "./logger";

export const BAN_DURATION_MS = 1000 * 60 * 20;
export const RATE_DURATION_MS = 1000 * 15;

const logRedditError = (resp: globalThis.Response) => {
	return {
		status: resp.status,
		statusText: resp.statusText,
		retryAfter: resp.headers.get("retry-after"),
		contentType: resp.headers.get("content-type"),
		url: resp.url,
	};
};

export const proxyFetch = async (
	url: string,
	res: Response,
	originalUrl: string,
	ttlMs?: number,
) => {
	log.info("📡 Network request started with Reddit.", { url: originalUrl });

	const resp = await fetch(url, {
		headers: { "User-Agent": USER_AGENT },
	});

	if (resp.status === 429) {
		log.warn("Reddit 429 - rate limit", logRedditError(resp));
		const slot = Date.now() + RATE_DURATION_MS;
		const delaySec = Math.ceil(RATE_DURATION_MS / 1000);
		const retryAfterHeader = resp.headers.get("retry-after");
		const parsed = Number(retryAfterHeader);
		const retryAfterSec =
			retryAfterHeader && !isNaN(parsed) && parsed > 0 ? parsed : delaySec;
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
		log.warn("Reddit 403 - ban", logRedditError(resp));
		const delaySec = Math.ceil(BAN_DURATION_MS / 1000);
		const retryAfterHeader = resp.headers.get("retry-after");
		const parsed = Number(retryAfterHeader);
		const retryAfterSec =
			retryAfterHeader && !isNaN(parsed) && parsed > 0 ? parsed : delaySec;

		rateLimiter.recordBan(retryAfterSec * 1000);

		res
			.status(403)
			.set("Retry-After", String(retryAfterSec))
			.json({ reason: "ban" } satisfies BannedResponse);
		return;
	}

	if (!resp.ok) {
		log.error("Reddit unexpected error", logRedditError(resp));
		throw new Error(`Reddit responded with ${resp.status}`);
	}

	const body = await resp.text();

	cache.set(originalUrl, body, ttlMs);

	res.type("application/json").send(body);
};
