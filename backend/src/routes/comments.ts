import { Router } from "express";
import { REDDIT_BASE_URL, USER_AGENT } from "../config";

const commentRouter = Router();

commentRouter.get("/:postId", async (req, res) => {
	const { postId } = req.params;

	const resp = await fetch(`${REDDIT_BASE_URL}/comments/${postId}.json`, {
		headers: { "User-Agent": USER_AGENT },
	});

	if (!resp.ok) {
		throw new Error(`Reddit returned ${resp.status} for comments/${postId}`);
	}

	const body = await resp.text();

	res.type("application/json").send(body);
});

export default commentRouter;
