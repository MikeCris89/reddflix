import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import "dotenv/config";
import postRouter from "./routes/posts";
import commentRouter from "./routes/comments";
import sharedRouter from "./routes/shared";
import morgan from "morgan";

const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? "")
	.split(",")
	.map((s) => s.trim())
	.filter(Boolean);

export const app = express();

app.use(
	cors({
		origin: (origin, callback) => {
			// Allow requests with no origin (curl, server-to-server, Postman)
			if (!origin) return callback(null, true);
			if (allowedOrigins.includes(origin)) return callback(null, true);
			callback(new Error(`CORS: origin ${origin} not allowed`));
		},
		allowedHeaders: ["Content-Type", "X-Slot-Token"],
		exposedHeaders: ["Retry-After", "X-Cache"],
	}),
);

app.use(morgan("dev"));

app.use("/r", postRouter);
app.use("/comments", commentRouter);
app.use("/shared", sharedRouter);

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
	console.error(err);
	if (err.message?.startsWith("CORS:")) {
		return res.status(403).json({ reason: "originNotAllowed" });
	}
	res.status(500).json({ error: "Internal server error" });
});
