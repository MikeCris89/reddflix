import { NextFunction, Request, Response } from "express";
import { rateLimiter } from "../rateLimiter";

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
		next();
		return;
	}

	const retryAfterSec = Math.ceil(verdict.delayMs / 1000);
	res.set("Retry-After", String(retryAfterSec));

	if (verdict.reason === "ban") {
		res.status(503).json({ reason: "ban" });
		return;
	}

	// rateLimit
	res.status(429).json({
		reason: "rateLimit",
		slotToken: verdict.timestamp, // absolute ms, frontend sends back on retry
	});
};
