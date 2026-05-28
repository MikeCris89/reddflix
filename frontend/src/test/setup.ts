import "fake-indexeddb/auto";
import { afterAll, afterEach, beforeAll, beforeEach } from "vitest";
import { server } from "./server";
import { IDBFactory } from "fake-indexeddb";
import "@testing-library/jest-dom/vitest";

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
beforeEach(() => {
	// fresh DB per test
	globalThis.indexedDB = new IDBFactory();
});
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
