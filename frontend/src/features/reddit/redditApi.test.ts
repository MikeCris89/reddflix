import { describe, it, expect, beforeEach } from "vitest";
import { http, HttpResponse } from "msw";
import { renderHook, waitFor } from "@testing-library/react";
import { server } from "../../test/server";
import { wrapper } from "../../test/renderWithStore";
import { BAN_DURATION_MS, useFetchPostsBySubredditQuery } from "./redditApi";
import { memoryBan } from "../../utils/memoryBan"; // adjust path if different

const URL = "*/r/aww";
const subreddit = "aww";

describe("redditApi — ban handling", () => {
	let now = 0;
	beforeEach(() => {
		now = Date.now();
		memoryBan.set(0); // reset between tests
	});

	it("sets memoryBan when backend returns 403 with Retry-After", async () => {
		server.use(
			http.get(URL, () => {
				return HttpResponse.json(
					{ reason: "ban" },
					{
						status: 403,
						headers: { "Retry-After": "300" },
					},
				);
			}),
		);

		const { result } = renderHook(
			() => useFetchPostsBySubredditQuery({ subreddit }),
			{ wrapper },
		);

		// Wait for the query to resolve into an error state
		await waitFor(() => {
			expect(result.current.isError).toBe(true);
		});

		// Assert: customBaseQuery processed the ban
		expect(memoryBan.get()).toBeGreaterThan(Date.now());
		expect(memoryBan.get()).toBeLessThanOrEqual(Date.now() + 300_000 + 1000);

		// Assert: error shape is what QueryErrorMessage expects
		const error = result.current.error as any;
		expect(error?.status).toBe(403);
		expect(error?.data?.reason).toBe("ban");
	});

	it("sets pendingTime and slot token when backend returns 429 with Retry-After", async () => {
		const slotToken = now + 15_000;
		server.use(
			http.get(URL, () => {
				return HttpResponse.json(
					{ reason: "rateLimit", slotToken },
					{
						status: 429,
						headers: { "Retry-After": "15" },
					},
				);
			}),
		);

		const { result } = renderHook(
			() => useFetchPostsBySubredditQuery({ subreddit }),
			{ wrapper },
		);

		await waitFor(() => {
			expect(result.current.isError).toBe(true);
		});

		const error = result.current.error as any;

		expect(error?.status).toBe(429);
		expect(error?.data.reason).toBe("rateLimit");
		expect(error?.data.isAppHandledError).toBe(true);
		expect(error?.data.pendingTimestamp).toBe(slotToken);
		expect(error?.data.message).toEqual(expect.any(String));
		expect(error?.data.message.length).toBeGreaterThan(0);

		// 429 should not touch the ban
		expect(memoryBan.get()).toBe(0);
	});

	it("falls back to default delay on 403 if Retry-After: 0", async () => {
		server.use(
			http.get(URL, () => {
				return HttpResponse.json(
					{
						reason: "ban",
					},
					{
						status: 403,
						headers: { "Retry-After": "0" },
					},
				);
			}),
		);

		const { result } = renderHook(
			() => useFetchPostsBySubredditQuery({ subreddit }),
			{ wrapper },
		);

		await waitFor(() => {
			expect(result.current.isError).toBe(true);
		});

		expect(memoryBan.get()).toBeGreaterThan(now + BAN_DURATION_MS - 1000);
		expect(memoryBan.get()).toBeLessThan(now + BAN_DURATION_MS + 1000);

		const error = result.current.error as any;
		expect(error.data.pendingTimestamp).toBeGreaterThan(
			now + BAN_DURATION_MS - 1000,
		);
	});

	it("blocks requests requests when in ban cooldown", async () => {
		server.use(
			http.get(
				URL,
				() => {
					return HttpResponse.json(
						{ reason: "ban" },
						{
							status: 403,
							headers: { "Retry-After": `${BAN_DURATION_MS / 1000}` },
						},
					);
				},
				{ once: true },
			),
		);

		const { result } = renderHook(
			() => useFetchPostsBySubredditQuery({ subreddit }),
			{ wrapper },
		);

		await waitFor(() => {
			expect(result.current.isError).toBe(true);
		});

		const { result: result2 } = renderHook(
			() => useFetchPostsBySubredditQuery({ subreddit }),
			{ wrapper },
		);

		await waitFor(() => {
			expect(result2.current.isError).toBe(true);
		});

		const error = result2.current.error as any;
		expect(error.status).toBe(403);
		expect(error.data.pendingTimestamp).toBeGreaterThan(
			now + BAN_DURATION_MS - 1000,
		);
		expect(error.data.pendingTimestamp).toBeLessThan(
			now + BAN_DURATION_MS + 1000,
		);
		expect(error.data.pendingTimestamp).toBe(memoryBan.get());
		expect(error.data.blockedLocally).toBe(true);
	});
});
