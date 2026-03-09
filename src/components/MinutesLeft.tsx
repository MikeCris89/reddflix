import { useMinuteClock } from "../hooks/useMinuteClock";
import { getMinutesLeft } from "../utils/helpers";

const MinutesLeft = ({
	cooldownMs,
	initTime,
}: {
	cooldownMs: number;
	initTime?: number | null;
}) => {
	useMinuteClock();

	const minutesLeft = getMinutesLeft(cooldownMs, initTime);

	const inCooldown = minutesLeft > 0;

	return <>{inCooldown ? `${minutesLeft}m` : "Refresh"} </>;
};

export default MinutesLeft;
