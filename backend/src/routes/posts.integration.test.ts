import request from "supertest";
import { app } from "../app";
import { cache } from "../lib/cache";
import { vi } from "vitest";

const KEY_1 = "/r/pics";
const VALUE_1 = JSON.stringify({ value: "some payload" });
const KEY_2 = "uiop1389";
const VALUE_2 = "a second payload";

describe("posts route", () => {
	beforeEach(() => {
		cache.clear();
		vi.stubGlobal("fetch", vi.fn());
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("cache hit returns immediately without calling fetch", async () => {
		cache.set(KEY_1, VALUE_1);

		const resp = await request(app).get(KEY_1);

		expect(fetch).not.toHaveBeenCalled();
		expect(resp.status).toBe(200);
		expect(resp.text).toEqual(VALUE_1);
	});
});
