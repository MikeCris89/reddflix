import { openDB } from "idb";

export const dbPromise = openDB("reddflix-db", 1, {
	upgrade(db) {
		if (!db.objectStoreNames.contains("settings"))
			db.createObjectStore("settings");
		if (!db.objectStoreNames.contains("categories"))
			db.createObjectStore("categories");
		if (!db.objectStoreNames.contains("seenPosts"))
			db.createObjectStore("seenPosts");
		if (!db.objectStoreNames.contains("requestMonitor"))
			db.createObjectStore("requestMonitor");
	},
});
