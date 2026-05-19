import request from "supertest";
import { app } from "../app";
import { cache } from "../lib/cache";
import { vi } from "vitest";

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

describe("posts route", () => {
	let fetchMock: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		fetchMock = vi.fn();
		cache.clear();
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

	it("misses the cache and runs fetch - cache is updated", async () => {
		fetchMock.mockResolvedValueOnce(res200);

		const res = await request(app).get(KEY_1);

		expect(res.status).toBe(200);
		expect(res.text).toBe(VALUE_1);
		expect(fetchMock).toHaveBeenCalled();
		expect(fetchMock).toHaveBeenCalledTimes(1);
		expect(cache.get(KEY_1)).toBe(VALUE_1);
	});
});
