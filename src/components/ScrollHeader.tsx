import { RefreshCw } from "lucide-react";
import useDisplay from "../hooks/useDisplay";
import useCountdown from "../hooks/useCountdown";
import { useMinuteClock } from "../hooks/useMinuteClock";
import Spinner from "./Spinner";
import MinutesLeft from "./MinutesLeft";
import { getMinutesLeft, relativeTime } from "../utils/helpers";
import { Subreddit } from "../utils/types";

const COOLDOWN_MS = 10 * 60 * 1000;

interface Props {
	subreddit: Subreddit;
	pendingTime: number;
	banExpiry: number;
	isRefreshing: boolean;
	onRefresh: () => void;
}

const ScrollHeader = ({
	subreddit,
	pendingTime,
	banExpiry,
	isRefreshing,
	onRefresh,
}: Props) => {
	const { isMobile } = useDisplay();
	const remaining = useCountdown(pendingTime);
	useMinuteClock();
	const banMinutesLeft =
		banExpiry > 0
			? Math.max(0, Math.ceil((banExpiry - Date.now()) / 60000))
			: 0;

	const mLeft = getMinutesLeft(COOLDOWN_MS, subreddit.lastUpdated);
	const inCooldown = mLeft > 0;

	const titleStyle3 = `text-white font-semibold pl-3 pt-2 pb-1 border-l-4 border-[#E50914] bg-[#212121] rounded-t-md ${
		isMobile ? "text-base" : "text-lg"
	}`;

	const rateLimitEl = remaining > 0 && (
		<span className="flex items-center gap-1 text-[#E50914] text-xs">
			<Spinner size="sm" />
			Retrying in {Math.ceil(remaining / 1000)}s
		</span>
	);

	const banEl = remaining <= 0 && banMinutesLeft > 0 && (
		<span className="flex items-center gap-1 text-blue-400 text-xs">
			Temp banned · {banMinutesLeft}m left
		</span>
	);

	return (
		<>
			<div
				className={`flex items-center justify-start gap-[20px] pr-2 ${titleStyle3}`}
			>
				<span>r/{subreddit.name}</span>
				<button
					onClick={onRefresh}
					disabled={isRefreshing || inCooldown || !!banEl}
					className="text-zinc-400 hover:text-white transition-colors flex gap-2 items-center text-[12px] disabled:opacity-40 disabled:cursor-not-allowed"
					title="Refresh"
				>
					<RefreshCw size={12} className={isRefreshing ? "animate-spin" : ""} />
					<MinutesLeft
						cooldownMs={COOLDOWN_MS}
						initTime={subreddit.lastUpdated}
					/>
				</button>
				{remaining <= 0 && subreddit.lastUpdated && (
					<span className="text-zinc-500 text-xs">
						{relativeTime(subreddit.lastUpdated / 1000)} ago
					</span>
				)}
				{!isMobile && (rateLimitEl || banEl)}
			</div>
			{isMobile && (rateLimitEl || banEl) && (
				<div className="flex items-center gap-3 px-3 pb-1 bg-[#212121]">
					{rateLimitEl || banEl}
				</div>
			)}
		</>
	);
};

export default ScrollHeader;
