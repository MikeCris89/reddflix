import { evaluateRateLimit, RateLimit } from "./requestMonitorUtils";
import * as db from "../../utils/dbHelpers";

jest.mock("../../utils/dbHelpers");

const mockGetItem = db.getItem as jest.Mock;

describe("evaluateRateLimit with proper delays", () => {
	const timeLimit = 63_000;

	let recentArr: number[] = [];

	let pendingArr: number[] = [];

	const isRateSafe = () => {
		const fullArr = [...pendingArr, ...recentArr].sort((a, b) => a - b);
		for (let i = 0; i < fullArr.length; i++) {
			const windowStart = fullArr[i];
			const windowEnd = windowStart + timeLimit;
			let endIndex = fullArr.findIndex((el) => el > windowEnd);
			if (endIndex === -1) endIndex = fullArr.length;
			const diff = endIndex - i;
			if (diff > 10) {
				console.log(windowStart, windowEnd, endIndex, diff);
				return false;
			}
		}
		return true;
	};

	// const isRateSafe2 = (delayMs: number, pending: number[]) => {
	// 	const newTime = now + delayMs;
	// 	const newPendingArr = [...pending, newTime];
	// 	const newIndex = newPendingArr.length - 1;
	// 	const fullArr = [...recentArr, ...newPendingArr];
	// 	const startIndex = newIndex - 10;

	// 	if (timeLimit - (newTime - fullArr[startIndex]) < 0) return false;
	// 	return true;

	// 	const isRecentInPlay = recentArr.length > newPendingArr.length;
	// 	const newArr = [
	// 		...(isRecentInPlay ? recentArr.slice(newPendingArr.length) : []),
	// 		...newPendingArr,
	// 	];
	// 	console.log(newArr);
	// 	if (isRecentInPlay) {
	// 		if (newArr.length > 10) return false;
	// 		if (timeLimit - (newTime - newArr[0]) < 0) return false;
	// 	}

	// 	return true;
	// };

	const mockBaseQuery = async (numReqs: number) => {
		const now = Date.now();
		for (let i = 0; i < numReqs; i++) {
			const time = now + 5_000 * i;
			const rateLimit = await evaluateRateLimit(time);
			if (!rateLimit.ok) pendingArr.push(time + rateLimit.delayMs);
			else recentArr.push(time);
		}
		console.log(recentArr, pendingArr);
		return;
	};

	beforeEach(() => {
		jest.clearAllMocks();
		recentArr = [];
		pendingArr = [];

		mockGetItem.mockImplementation((_, key) => {
			if (key === "recent") return recentArr;
			if (key === "pending") return pendingArr;
			if (key === "bannedUntil") return undefined;
		});
	});

	it("returns ok=true if recent < 10", async () => {
		await mockBaseQuery(5);

		expect(isRateSafe()).toBe(true);
	});

	it("return proper delay for +10 requests", async () => {
		await mockBaseQuery(15);

		expect(isRateSafe()).toBe(true);
	});

	it("returns proper delay for +20 reqs", async () => {
		await mockBaseQuery(25);

		expect(isRateSafe()).toBe(true);
	});
});
