import { Router } from "express";
import { REDDIT_BASE_URL, USER_AGENT } from "../config";

const postRouter = Router();

postRouter.get("/:subreddit", async (req, res) => {
	const { subreddit } = req.params;

	// TODO create reddit account
	const resp = await fetch(`${REDDIT_BASE_URL}/r/${subreddit}.json?limit=50`, {
		headers: { "User-Agent": USER_AGENT },
	});

	if (!resp.ok) {
		throw new Error(`Reddit returned ${resp.status}`);
	}

	const body = await resp.text();

	res.type("application/json").send(body);
});

export default postRouter;
