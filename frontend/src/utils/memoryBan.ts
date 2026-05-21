const createMemoryBan = () => {
	let inMemoryBannedUntil: number = 0;

	const get = () => inMemoryBannedUntil;

	const set = (timestamp: number) => (inMemoryBannedUntil = timestamp);

	return {
		get,
		set,
	};
};

export const memoryBan = createMemoryBan();
