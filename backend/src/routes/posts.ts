import { Router } from "express";
import { REDDIT_BASE_URL } from "../config";
import { proxyFetch } from "../lib/proxyFetch";
import { cacheCheck } from "../middleware/cacheCheck";
import { rateLimitGuard } from "../middleware/rateLimitGuard";

const postRouter = Router();

postRouter.get("/:subreddit", cacheCheck, rateLimitGuard, async (req, res) => {
	const { subreddit } = req.params;

	const url = `${REDDIT_BASE_URL}/r/${subreddit}.json?limit=50`;

	await proxyFetch(url, res, req.originalUrl);
});

export default postRouter;
