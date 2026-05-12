import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import "dotenv/config";
import postRouter from "./routes/posts";

const PORT = process.env.PORT || 3001;

const app = express();

app.use(cors());

app.use("/r", postRouter);

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
	console.error(err);
	res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`);
});
