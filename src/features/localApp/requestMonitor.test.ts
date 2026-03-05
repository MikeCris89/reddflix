import { evaluateRateLimit } from "./requestMonitorUtils";

describe("evaluateRateLimit with proper delays", () => {
	const now = Date.now();
	const timeLimit = 63_000;

	const isRateSafe = (arrs: Record<string, number[]>) => {
		const { recentArr, pendingArr } = arrs;
		const fullArr = [...pendingArr, ...recentArr].sort((a, b) => a - b);
		for (let i = 0; i < fullArr.length; i++) {
			const windowStart = fullArr[i];
			const windowEnd = windowStart + timeLimit;
			let endIndex = fullArr.findIndex((el) => el >= windowEnd);
			if (endIndex === -1) endIndex = fullArr.length;
			const diff = endIndex - i;
			if (diff > 10) {
				console.log(
					`windowStart: ${windowStart}, windowEnd: ${windowEnd}, index at error: ${i}, endIndex: ${endIndex}, diff: ${diff}`
				);
				return false;
			}
		}
		return true;
	};

	const mockBaseQuery = async (numReqs: number) => {
		const recentArr: number[] = [];
		let pendingArr: number[] = [];
		const mockPrune = jest.fn(async (arr: number[]) => {
			pendingArr = [...arr];
		});

		for (let i = 0; i < numReqs; i++) {
			const reqMonitor = {
				recent: recentArr,
				pending: pendingArr,
			};
			const time = now + 5_000 * i;
			const rateLimit = await evaluateRateLimit(time, reqMonitor, mockPrune);
			if (!rateLimit.ok) pendingArr.push(time + rateLimit.delayMs);
			else recentArr.push(time);
		}
		console.log(
			`Num Reqs: ${numReqs}, Recent Array: (${recentArr.length})`,
			recentArr,
			`Pending Array: (${pendingArr.length})`,
			pendingArr
		);
		return { recentArr, pendingArr };
	};

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("returns ok=true if recent < 10", async () => {
		const arrs = await mockBaseQuery(5);

		expect(isRateSafe(arrs)).toBe(true);
	});

	it("return proper delay for +10 requests", async () => {
		const arrs = await mockBaseQuery(15);

		expect(isRateSafe(arrs)).toBe(true);
	});

	it("returns proper delay for +20 reqs", async () => {
		const arrs = await mockBaseQuery(25);

		expect(isRateSafe(arrs)).toBe(true);
	});

	it("enforces minimum gap between consecutive requests", async () => {
		const mockPrune = jest.fn(async (_arr: number[]) => {});
		const recent = [now - 500]; // last request was 500ms ago (within 2s prod minGap)
		const result = await evaluateRateLimit(
			now,
			{ recent, pending: [] },
			mockPrune
		);
		expect(result.ok).toBe(false);
		expect(result.reason).toBe("rateLimit");
		expect(result.delayMs).toBeGreaterThan(0);
		expect(result.delayMs).toBeLessThanOrEqual(2_000); // prod minGap is 2s
	});

	it("allows request when gap is sufficient", async () => {
		const mockPrune = jest.fn(async (_arr: number[]) => {});
		const recent = [now - 2_000]; // last request was 2s ago (beyond 1s dev minGap)
		const result = await evaluateRateLimit(
			now,
			{ recent, pending: [] },
			mockPrune
		);
		expect(result.ok).toBe(true);
	});
});
