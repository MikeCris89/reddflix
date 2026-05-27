import { http } from "msw";

// Empty by default — each test sets its own with server.use()
export const handlers: ReturnType<typeof http.get>[] = [];
