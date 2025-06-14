import { useEffect, useState } from "react";

const useCountdown = (timestamp: number) => {
	const [remaining, setRemaining] = useState(() =>
		timestamp > 0 ? timestamp - Date.now() : 0
	);

	useEffect(() => {
		if (!timestamp || timestamp <= Date.now()) return;
		const interval = setInterval(() => {
			const timeleft = timestamp - Date.now();
			if (timeleft <= 0) {
				setRemaining(0);
				clearInterval(interval);
			} else {
				setRemaining(timeleft);
			}
		}, 1000);

		return () => clearInterval(interval);
	}, [timestamp]);

	return remaining;
};

export default useCountdown;
