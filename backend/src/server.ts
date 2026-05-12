import express from "express";
import cors from "cors";
import "dotenv/config";

const PORT = process.env.PORT || 3001;

const app = express();

app.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`);
});

app.use(cors());
