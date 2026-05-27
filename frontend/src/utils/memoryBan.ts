import { getItem, setItem } from "./dbHelpers";

const createMemoryBan = () => {
	let inMemoryBannedUntil: number = 0;

	const get = () => inMemoryBannedUntil;

	const set = (timestamp: number) => {
		inMemoryBannedUntil = timestamp;
		setItem("requestMonitor", "bannedUntil", timestamp);
	};

	return {
		get,
		set,
	};
};

export const memoryBan = createMemoryBan();

export const hydrateBan = async () => {
	const persisted = await getItem<number>("requestMonitor", "bannedUntil");
	if (persisted && persisted > Date.now()) {
		memoryBan.set(persisted);
	}
};
