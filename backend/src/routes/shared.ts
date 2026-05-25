import { Router } from "express";
import { proxyFetch } from "../lib/proxyFetch";
import { REDDIT_BASE_URL } from "../config";
import { rateLimitGuard } from "../middleware/rateLimitGuard";
import { cacheCheck } from "../middleware/cacheCheck";

const sharedRouter = Router();

sharedRouter.get("/:postId", cacheCheck, rateLimitGuard, async (req, res) => {
	const { postId } = req.params;

	const url = `${REDDIT_BASE_URL}/comments/${postId}.json`;

	await proxyFetch(url, res, req.originalUrl, 1000 * 60 * 60 * 12);
});

export default sharedRouter;
