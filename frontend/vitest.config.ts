import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
	plugins: [react()],
	test: {
		globals: true,
		environment: "jsdom", // RTK Query needs a DOM-ish env
		setupFiles: ["./src/test/setup.ts"],
	},
});
