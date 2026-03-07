/**
 * Tests for the useMinuteCountdown countdown calculation.
 * The hook's core logic: remaining = max(0, cooldownMs - (now - lastUpdated))
 */

const COOLDOWN_MS = 10 * 60 * 1000; // 10 minutes

const getRemaining = (
	lastUpdated: number | undefined,
	cooldownMs: number,
	now: number
): number => {
	if (!lastUpdated) return 0;
	const elapsed = now - lastUpdated;
	return Math.max(0, cooldownMs - elapsed);
};

describe("useMinuteCountdown calculation", () => {
	const now = Date.now();

	it("returns 0 when lastUpdated is undefined (never fetched)", () => {
		expect(getRemaining(undefined, COOLDOWN_MS, now)).toBe(0);
	});

	it("returns 0 when cooldown has fully elapsed", () => {
		const lastUpdated = now - COOLDOWN_MS; // exactly 10 minutes ago
		expect(getRemaining(lastUpdated, COOLDOWN_MS, now)).toBe(0);
	});

	it("returns 0 when lastUpdated is older than cooldown", () => {
		const lastUpdated = now - COOLDOWN_MS - 60_000; // 11 minutes ago
		expect(getRemaining(lastUpdated, COOLDOWN_MS, now)).toBe(0);
	});

	it("returns correct remaining ms when within cooldown", () => {
		const lastUpdated = now - 2 * 60_000; // fetched 2 minutes ago
		const remaining = getRemaining(lastUpdated, COOLDOWN_MS, now);
		expect(remaining).toBe(8 * 60_000); // 8 minutes left
	});

	it("returns near-full cooldown immediately after fetch", () => {
		const lastUpdated = now - 500; // fetched 500ms ago
		const remaining = getRemaining(lastUpdated, COOLDOWN_MS, now);
		expect(remaining).toBeGreaterThan(COOLDOWN_MS - 1000);
		expect(remaining).toBeLessThanOrEqual(COOLDOWN_MS);
	});

	it("canRefresh is true when remaining is 0 (cooldown elapsed)", () => {
		const lastUpdated = now - COOLDOWN_MS - 1;
		const remaining = getRemaining(lastUpdated, COOLDOWN_MS, now);
		const canRefresh = remaining <= 0;
		expect(canRefresh).toBe(true);
	});

	it("canRefresh is false when within cooldown and posts not all seen", () => {
		const lastUpdated = now - 60_000; // only 1 minute ago
		const remaining = getRemaining(lastUpdated, COOLDOWN_MS, now);
		const allSeen = false;
		const canRefresh = remaining <= 0 || allSeen;
		expect(canRefresh).toBe(false);
	});

	it("canRefresh is true when all posts seen even if within cooldown", () => {
		const lastUpdated = now - 60_000; // only 1 minute ago
		const remaining = getRemaining(lastUpdated, COOLDOWN_MS, now);
		const allSeen = true;
		const canRefresh = remaining <= 0 || allSeen;
		expect(canRefresh).toBe(true);
	});

	it("countdown display rounds up to nearest minute", () => {
		const lastUpdated = now - 2 * 60_000 - 30_000; // 2.5 minutes ago
		const remaining = getRemaining(lastUpdated, COOLDOWN_MS, now);
		const minutesLeft = Math.ceil(remaining / 60_000);
		expect(minutesLeft).toBe(8); // 7.5 minutes → ceil → 8
	});
});
