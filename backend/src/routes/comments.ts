import { Router } from "express";
import { REDDIT_BASE_URL } from "../config";
import { proxyFetch } from "../lib/proxyFetch";

const commentRouter = Router();

commentRouter.get("/:postId", async (req, res) => {
	const { postId } = req.params;

	const url = `${REDDIT_BASE_URL}/comments/${postId}.json`;

	await proxyFetch(url, res);
});

export default commentRouter;
