import { createCache } from "./cache";

const KEY_1 = "/r/pics";
const VALUE_1 = "some payload";
const KEY_2 = "uiop1389";
const VALUE_2 = "a second payload";

const TTL = 1000 * 60;

describe("cache", () => {
	let cache: ReturnType<typeof createCache>;

	beforeEach(() => {
		vi.useFakeTimers();
		cache = createCache();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("sets data to cache and returns it", () => {
		cache.set(KEY_1, VALUE_1, TTL);

		const data = cache.get(KEY_1);

		expect(data).toEqual(VALUE_1);
	});

	it("uses default TTL when none is passed in", () => {
		cache.set(KEY_1, VALUE_1);

		vi.advanceTimersByTime(1000 * 60 * 40);

		const data = cache.get(KEY_1);
		expect(data).toEqual(VALUE_1);

		vi.advanceTimersByTime(1000 * 60 * 62);

		const data2 = cache.get(KEY_1);
		expect(data2).toBeNull();
	});

	it("returns null after TTL expires", () => {
		cache.set(KEY_1, VALUE_1, TTL);

		vi.advanceTimersByTime(TTL + 1000);

		const data = cache.get(KEY_1);
		expect(data).toBeNull();
	});

	it("returns null for a key that was never set", () => {
		cache.set(KEY_1, VALUE_1, TTL);

		const data = cache.get(KEY_2);
		expect(data).toBeNull();
	});

	it("overwrites existing value and ttl", () => {
		cache.set(KEY_1, VALUE_1, TTL);

		vi.advanceTimersByTime(TTL + 1000);

		cache.set(KEY_1, VALUE_2, TTL);

		const data = cache.get(KEY_1);
		expect(data).toEqual(VALUE_2);

		vi.advanceTimersByTime(TTL + 1000);

		const data2 = cache.get(KEY_1);
		expect(data2).toBeNull();
	});

	it("clears cache", () => {
		cache.set(KEY_1, VALUE_1, TTL);

		cache.clear();

		const data = cache.get(KEY_1);
		expect(data).toBeNull();
	});
});
