import { Request, Response, NextFunction } from "express";
import { cache } from "../lib/cache";

export const cacheCheck = (req: Request, res: Response, next: NextFunction) => {
	const key = req.originalUrl;

	const data = cache.get(key);

	if (!data) return next();

	res.type("application/json").send(data);
};
