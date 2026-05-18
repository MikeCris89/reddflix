import { Request, Response, NextFunction } from "express";
import { cache } from "../lib/cache";
import { log } from "../lib/logger";

export const cacheCheck = (req: Request, res: Response, next: NextFunction) => {
	const key = req.originalUrl;

	const data = cache.get(key);

	if (data) {
		log.info("Cache HIT", { url: req.originalUrl });
		res.type("application/json").send(data);
		return;
	}
	log.info("Cache MISS", { url: req.originalUrl });
	next();
};
