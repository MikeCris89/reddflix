import { Router } from "express";
import { REDDIT_BASE_URL } from "../config";
import { proxyFetch } from "../lib/proxyFetch";
import { cacheCheck } from "../middleware/cacheCheck";
import { rateLimitGuard } from "../middleware/rateLimitGuard";

const commentRouter = Router();

commentRouter.get("/:postId", cacheCheck, rateLimitGuard, async (req, res) => {
	const { postId } = req.params;

	const url = `${REDDIT_BASE_URL}/comments/${postId}.json`;

	await proxyFetch(url, res, req.originalUrl);
});

export default commentRouter;
