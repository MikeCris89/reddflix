import "fake-indexeddb/auto";
import { afterAll, afterEach, beforeAll } from "vitest";
import { server } from "./server";
import { IDBFactory } from "fake-indexeddb";

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
beforeEach(() => {
	// fresh DB per test
	globalThis.indexedDB = new IDBFactory();
});
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
