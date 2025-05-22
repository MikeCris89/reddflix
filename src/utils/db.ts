import { openDB } from "idb";

export const dbPromise = openDB("reddflix-db", 2, {
	upgrade(db) {
		if (!db.objectStoreNames.contains("settings"))
			db.createObjectStore("settings");
		if (!db.objectStoreNames.contains("categories"))
			db.createObjectStore("categories");
		if (!db.objectStoreNames.contains("seenPosts"))
			db.createObjectStore("seenPosts");
		if (!db.objectStoreNames.contains("requestMonitor"))
			db.createObjectStore("requestMonitor");
		if (!db.objectStoreNames.contains("subreddits"))
			db.createObjectStore("subreddits");
	},
});
