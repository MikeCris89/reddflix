// src/utils/idbHelpers.ts
import { dbPromise } from "./db";

export const setItem = async <T>(storeName: string, key: string, value: T) => {
	const db = await dbPromise;
	return db.put(storeName, value, key);
};

export const getItem = async <T>(
	storeName: string,
	key: string
): Promise<T | undefined> => {
	const db = await dbPromise;
	return db.get(storeName, key);
};

export const deleteItem = async (storeName: string, key: string) => {
	const db = await dbPromise;
	return db.delete(storeName, key);
};

export const getAllFromStore = async <T>(storeName: string): Promise<T[]> => {
	const db = await dbPromise;
	return db.getAll(storeName);
};

export const clearStore = async (storeName: string) => {
	const db = await dbPromise;
	return db.clear(storeName);
};
