export const createCache = () => {
	const store = new Map<string, { body: string; expiresAt: number }>();

	const get = (key: string): string | null => {
		const entry = store.get(key);
		if (!entry) return null;
		if (entry.expiresAt < Date.now()) {
			store.delete(key);
			return null;
		}
		return entry.body;
	};

	const set = (key: string, body: string, ttlMs: number = 1000 * 60 * 60) => {
		store.set(key, { body, expiresAt: Date.now() + ttlMs });
	};

	const clear = () => store.clear();

	return { get, set, clear };
};

export const cache = createCache();
