import { Router } from "express";
import { REDDIT_BASE_URL } from "../config";
import { proxyFetch } from "../lib/proxyFetch";

const postRouter = Router();

postRouter.get("/:subreddit", async (req, res) => {
	const { subreddit } = req.params;

	const url = `${REDDIT_BASE_URL}/r/${subreddit}.json?limit=50`;

	await proxyFetch(url, res);
});

export default postRouter;
