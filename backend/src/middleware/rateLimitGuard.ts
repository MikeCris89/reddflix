import { NextFunction, Request, Response } from "express";
import { rateLimiter } from "../lib/rateLimiter";
import { BannedResponse, RateLimitedResponse } from "../types";
import { log } from "../lib/logger";

export const rateLimitGuard = (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	const raw = req.headers["x-slot-token"];
	const slotToken =
		typeof raw === "string" && !isNaN(Number(raw)) ? Number(raw) : undefined;

	const verdict = rateLimiter.evaluate(slotToken);

	if (verdict.ok) {
		log.info("RateLimit Guard - OK");
		next();
		return;
	}

	if (verdict.reason === "ban") {
		const retryAfterSec = Math.ceil(verdict.delayMs / 1000);
		log.warn("RateLimit Guard - Ban in effect, skipping network request.", {
			retryAfterSec,
		});
		res.set("Retry-After", String(retryAfterSec));
		res.status(403).json({ reason: "ban" } satisfies BannedResponse);
		return;
	}

	log.warn(
		"RateLimit Guard - Rate Limit in effect, skipping network request.",
		{
			slotToken: verdict.timestamp,
		},
	);
	// rateLimit
	res.status(429).json({
		reason: "rateLimit",
		slotToken: verdict.timestamp!, // absolute ms, frontend sends back on retry
	} satisfies RateLimitedResponse);
};
