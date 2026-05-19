import request from "supertest";
import { app } from "../app";
import { cache } from "../lib/cache";
import { vi } from "vitest";
import { BAN_DURATION_MS, RATE_DURATION_MS } from "../lib/proxyFetch";
import { rateLimiter } from "../lib/rateLimiter";

const KEY_1 = "/r/pics";
const VALUE_1 = JSON.stringify({ value: "some payload" });
const KEY_2 = "/comments/uiop1389";
const VALUE_2 = JSON.stringify({ value: "some other payload" });

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

const res403 = {
	ok: false,
	status: 403,
	headers: new Headers(),
} as Response;

describe("posts route", () => {
	let fetchMock: ReturnType<typeof vi.fn>;
	let now: number;

	beforeEach(() => {
		now = Date.now();
		fetchMock = vi.fn();
		cache.clear();
		rateLimiter.clear();
		vi.stubGlobal("fetch", fetchMock);

		// Insurance for practice - Ensure reddit never gets hit
		fetchMock.mockImplementation(() => {
			throw new Error("Unmocked fetch call — test forgot to set up mock");
		});
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("hits cache and returns immediately without calling fetch", async () => {
		cache.set(KEY_1, VALUE_1);

		const res = await request(app).get(KEY_1);

		expect(fetch).not.toHaveBeenCalled();
		expect(res.status).toBe(200);
		expect(res.text).toEqual(VALUE_1);
	});

	it("on cache miss, fetches from Reddit and cashes response", async () => {
		fetchMock.mockResolvedValueOnce(res200);

		const res = await request(app).get(KEY_1);

		expect(res.status).toBe(200);
		expect(res.text).toBe(VALUE_1);
		expect(fetchMock).toHaveBeenCalledTimes(1);
		expect(cache.get(KEY_1)).toBe(VALUE_1);
	});

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
});
