import { useEffect, useState } from "react";

const useMinuteCountdown = (
	lastUpdated: number | undefined,
	cooldownMs: number
): number => {
	const getRemaining = () => {
		if (!lastUpdated) return 0;
		const elapsed = Date.now() - lastUpdated;
		return Math.max(0, cooldownMs - elapsed);
	};

	const [remaining, setRemaining] = useState(getRemaining);

	useEffect(() => {
		const r = getRemaining();
		setRemaining(r);
		if (r <= 0) return;

		const interval = setInterval(() => {
			const next = getRemaining();
			setRemaining(next);
			if (next <= 0) clearInterval(interval);
		}, 60_000);

		return () => clearInterval(interval);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [lastUpdated, cooldownMs]);

	return remaining;
};

export default useMinuteCountdown;
