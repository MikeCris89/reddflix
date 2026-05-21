import { getItem } from "./dbHelpers";
import { hydrateBan, memoryBan } from "./memoryBan";
import { vi } from "vitest";

vi.mock("./dbHelpers", () => ({
	getItem: vi.fn(),
}));

describe("memoryBan", () => {
	beforeEach(() => {
		memoryBan.set(0);
		vi.clearAllMocks();
	});

	it("leaves memoryBan at 0 when getItem returns undefined", async () => {
		vi.mocked(getItem).mockResolvedValueOnce(undefined);
		await hydrateBan();
		expect(memoryBan.get()).toBe(0);
	});

	it("leaves memoryBan at 0 when persisted timestamp is in the past", async () => {
		vi.mocked(getItem).mockResolvedValue(Date.now() - 10_000);
		await hydrateBan();
		expect(memoryBan.get()).toBe(0);
	});

	it("sets memoryBan when persisted timestamp is in the future", async () => {
		const future = Date.now() + 10_000;
		vi.mocked(getItem).mockResolvedValue(future);
		await hydrateBan();
		expect(memoryBan.get()).toBe(future);
	});
});
