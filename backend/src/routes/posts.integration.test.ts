import request from "supertest";
import { app } from "../app";
import { cache } from "../lib/cache";
import { vi } from "vitest";
import { BAN_DURATION_MS, RATE_DURATION_MS } from "../lib/proxyFetch";
import { rateLimiter } from "../lib/rateLimiter";

const KEY_1 = "/r/pics";
const KEY_2 = "/comments/uiop1389";
const KEY_3 = "/r/aww";
const KEY_4 = "/r/gaming";
const VALUE_1 = JSON.stringify({ value: "some payload" });

const res200 = {
	ok: true,
	status: 200,
	text: async () => VALUE_1,
	headers: new Headers(),
} as Response;

const res429 = {
	ok: false,
	status: 429,
	headers: new Headers(),
} as Response;

const res429WithHeader = {
	ok: false,
	status: 429,
	headers: new Headers({ "retry-after": "30" }),
} as Response;

const res403 = {
	ok: false,
	status: 403,
	headers: new Headers(),
} as Response;

const res500 = {
	ok: false,
	status: 500,
	headers: new Headers(),
} as Response;

describe("posts route", () => {
	let fetchMock: ReturnType<typeof vi.fn>;
	let now: number;

	beforeEach(() => {
		vi.useFakeTimers({ toFake: ["Date"] });
		vi.stubGlobal("fetch", fetchMock);
		now = Date.now();
		fetchMock = vi.fn();
		cache.clear();
		rateLimiter.reset();

		// Insurance for practice - Ensure reddit never gets hit
		fetchMock.mockImplementation(() => {
			throw new Error("Unmocked fetch call — test forgot to set up mock");
		});
	});

	afterEach(() => {
		vi.unstubAllGlobals();
		vi.useRealTimers();
	});

	describe("cache", () => {
		it("hits cache and returns immediately without calling fetch", async () => {
			cache.set(KEY_1, VALUE_1);

			const res = await request(app).get(KEY_1);

			expect(fetch).not.toHaveBeenCalled();
			expect(res.status).toBe(200);
			expect(res.text).toEqual(VALUE_1);
		});

		it("on cache miss, fetches from Reddit and caches response", async () => {
			fetchMock.mockResolvedValueOnce(res200);

			const res = await request(app).get(KEY_1);

			expect(res.status).toBe(200);
			expect(res.text).toBe(VALUE_1);
			expect(fetchMock).toHaveBeenCalledTimes(1);
			expect(cache.get(KEY_1)).toBe(VALUE_1);
		});
	});

	describe("rate limiter", () => {
		it("when Reddit returns 429, propagates rateLimit reason, slot token, and retry-after", async () => {
			fetchMock.mockResolvedValueOnce(res429);

			const res = await request(app).get(KEY_1);

			expect(res.status).toBe(429);
			expect(Number(res.headers["retry-after"])).toBe(RATE_DURATION_MS / 1000);
			expect(res.body.reason).toBe("rateLimit");
			expect(res.body.slotToken).toBeGreaterThan(now);
		});

		it("after 429, the limiter is saturated and subsequent requests short-circuit", async () => {
			fetchMock.mockResolvedValueOnce(res429);
			await request(app).get(KEY_1);

			const res = await request(app).get(KEY_2);

			expect(fetchMock).toHaveBeenCalledTimes(1);
			expect(res.status).toBe(429);
			expect(res.body.reason).toBe("rateLimit");
		});

		it("when Reddit returns 403, propagates ban reason and retry-after", async () => {
			fetchMock.mockResolvedValueOnce(res403);

			const res = await request(app).get(KEY_1);

			expect(fetchMock).toHaveBeenCalledTimes(1);
			expect(res.status).toBe(403);
			expect(res.body.reason).toBe("ban");
			expect(Number(res.headers["retry-after"])).toBe(BAN_DURATION_MS / 1000);
		});

		it("after 403, subsequent requests short-circuit", async () => {
			fetchMock.mockResolvedValueOnce(res403);
			await request(app).get(KEY_1);

			const res = await request(app).get(KEY_2);

			expect(fetchMock).toHaveBeenCalledTimes(1);
			expect(res.status).toBe(403);
			expect(res.body.reason).toBe("ban");
		});

		it("uses retry-after from Reddit when provided", async () => {
			fetchMock.mockResolvedValueOnce(res429WithHeader);
			const res = await request(app).get(KEY_1);
			expect(Number(res.headers["retry-after"])).toBe(30);
		});

		it("recovers from 429 by retrying with slot token", async () => {
			fetchMock.mockResolvedValueOnce(res429);
			fetchMock.mockResolvedValueOnce(res200);

			const res = await request(app).get(KEY_1);
			expect(res.status).toBe(429);

			vi.advanceTimersByTime(Number(res.headers["retry-after"]) * 1000);

			const res2 = await request(app)
				.get(KEY_1)
				.set("x-slot-token", String(res.body.slotToken));

			expect(res2.status).toBe(200);
		});

		// Note: this tests the GUARD-rejection path (organic saturation from
		// staggered requests). The slot-token priority property only holds here
		// because `recent` has staggered timestamps. The saturateRateLimit path
		// (when Reddit returns 429) fills `recent` at a single instant, so all
		// slots open simultaneously and the token grants no priority over new
		// requests in that scenario.
		// This test assumes dev config: maxReqs=2, windowMs=15s.
		// If you change those constants, update this test's timing and request count.
		it("token from guard rejection grants retry access", async () => {
			fetchMock.mockResolvedValue(res200); // always 200 for any call that makes it through

			await request(app).get(KEY_1); // capacity 1/2
			vi.advanceTimersByTime(5_000);
			await request(app).get(KEY_2); // capacity 2/2

			const rejected = await request(app).get(KEY_3); // guard rejects, issues token
			expect(rejected.status).toBe(429);
			expect(rejected.body.slotToken).toBeGreaterThan(now);
			expect(fetchMock).toHaveBeenCalledTimes(2); // 3rd never reached Reddit

			vi.advanceTimersByTime(rejected.body.slotToken - Date.now());

			const retried = await request(app)
				.get(KEY_3)
				.set("x-slot-token", String(rejected.body.slotToken));
			expect(retried.status).toBe(200);

			// Staggered window: KEY_1's slot has expired (advanced past 15s total),
			// but KEY_2's hasn't. So there's exactly one slot free, claimed by the retry.
			// A new request without a token should still be rejected.
			const newReq = await request(app).get(KEY_4);
			expect(newReq.status).toBe(429);
		});
	});

	describe("errors", () => {
		it("propagates unexpected Reddit errors as 500", async () => {
			fetchMock.mockResolvedValueOnce(res500);

			const res = await request(app).get(KEY_1);

			expect(res.status).toBe(500);
			expect(fetchMock).toHaveBeenCalledTimes(1);
			expect(cache.get(KEY_1)).toBeNull();
		});
	});

	describe("CORS", () => {
		it("allows requests from an allowed origin", async () => {
			fetchMock.mockResolvedValueOnce(res200);

			const allowed = (process.env.ALLOWED_ORIGINS ?? "")
				.split(",")
				.map((s) => s.trim())
				.filter(Boolean)[0];

			const res = await request(app).get(KEY_1).set("Origin", allowed);

			expect(res.status).toBe(200);
			expect(res.headers["access-control-allow-origin"]).toBe(allowed);
		});

		it("rejects requests from a disallowed origin", async () => {
			const res = await request(app)
				.get(KEY_1)
				.set("Origin", "https://evil.example.com");

			expect(res.status).toBe(403);
			expect(res.body.reason).toBe("originNotAllowed");
		});

		it("allows X-Slot-Token header in CORS preflight", async () => {
			const allowed = (process.env.ALLOWED_ORIGINS ?? "")
				.split(",")
				.map((s) => s.trim())
				.filter(Boolean)[0];

			const res = await request(app)
				.options(KEY_1)
				.set("Origin", allowed)
				.set("Access-Control-Request-Method", "GET")
				.set("Access-Control-Request-Headers", "x-slot-token");

			expect(res.status).toBe(204);
			expect(
				res.headers["access-control-allow-headers"]?.toLowerCase(),
			).toContain("x-slot-token");
		});
	});
});
