import { describe, it, expect } from "vitest";
import { sanitizeQueries } from "../app/sanitizeQueries"; // adjust path

describe("sanitizeQueries transform", () => {
	// Helper to call the inbound transform on a queries object
	const sanitize = (queries: Record<string, unknown>) =>
		sanitizeQueries.in(queries, "queries", {} as any);

	it("drops rejected entries with no data", () => {
		const input = {
			aww: {
				status: "rejected",
				endpointName: "fetchPostsBySubreddit",
				error: { status: 403, data: { reason: "ban" } },
				// no `data` field — failed first fetch, nothing usable cached
			},
		};

		const output = sanitize(input);

		expect(output).toEqual({});
	});

	it("preserves fulfilled entries untouched", () => {
		const entry = {
			status: "fulfilled",
			endpointName: "fetchPostsBySubreddit",
			data: { posts: [{ id: "1", title: "x" }], after: "t3_x" },
		};
		const input = { aww: entry };

		const output = sanitize(input);

		expect(output.aww).toEqual(entry);
	});

	it("preserves live rate-limit errors (future timestamp)", () => {
		const future = Date.now() + 60_000;
		const entry = {
			status: "rejected",
			endpointName: "fetchPostsBySubreddit",
			error: {
				status: 429,
				data: {
					reason: "rateLimit",
					pendingTimestamp: future,
					isAppHandledError: true,
				},
			},
		};
		const input = { aww: entry };

		const output = sanitize(input);

		// Live rate-limit error survives intact so countdown can resume on reload
		expect(output.aww).toEqual(entry);
	});

	it("flips rejected-with-data to fulfilled, strips error", () => {
		const data = { posts: [{ id: "1", title: "x" }], after: "t3_x" };
		const input = {
			aww: {
				status: "rejected",
				endpointName: "fetchPostsBySubreddit",
				error: { status: 403, data: { reason: "ban" } },
				data,
			},
		};

		const output = sanitize(input) as Record<string, any>;

		expect(output.aww.status).toBe("fulfilled");
		expect(output.aww.error).toBeUndefined();
		expect(output.aww.data).toEqual(data); // posts preserved
	});
});
