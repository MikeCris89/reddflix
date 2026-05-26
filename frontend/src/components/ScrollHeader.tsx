import { RefreshCw } from "lucide-react";
import useDisplay from "../hooks/useDisplay";
import { useMinuteClock } from "../hooks/useMinuteClock";
import MinutesLeft from "./MinutesLeft";
import { getMinutesLeft, relativeTime } from "../utils/helpers";
import { isAppHandledError, Subreddit } from "../utils/types";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { SerializedError } from "@reduxjs/toolkit";
import QueryErrorMessage from "./QueryErrorMessage";

const COOLDOWN_MS = 10 * 60 * 1000;

interface Props {
	subreddit: Subreddit;
	isRefreshing: boolean;
	onRefresh: () => void;
	error?: FetchBaseQueryError | SerializedError;
}

const ScrollHeader = ({ subreddit, isRefreshing, onRefresh, error }: Props) => {
	const { isMobile } = useDisplay();
	useMinuteClock();

	const isActiveBan =
		!!error &&
		isAppHandledError(error) &&
		error.data.reason === "ban" &&
		error.data.pendingTimestamp > Date.now();

	const mLeft = getMinutesLeft(COOLDOWN_MS, subreddit.lastUpdated);
	const inCooldown = mLeft > 0;

	const titleStyle3 = `text-white font-semibold pl-3 pt-2 pb-1 border-l-4 border-[#E50914] bg-[#212121] rounded-t-md ${
		isMobile ? "text-base" : "text-lg"
	}`;

	const errorEl = error && <QueryErrorMessage error={error} variant="inline" />;

	return (
		<>
			<div
				className={`flex items-center justify-start gap-[20px] pr-2 ${titleStyle3}`}
			>
				<span>r/{subreddit.name}</span>
				<button
					onClick={onRefresh}
					disabled={isRefreshing || inCooldown || isActiveBan}
					className="text-zinc-400 hover:text-white transition-colors flex gap-2 items-center text-[12px] disabled:opacity-40 disabled:cursor-not-allowed"
					title="Refresh"
				>
					<RefreshCw size={12} className={isRefreshing ? "animate-spin" : ""} />
					<MinutesLeft
						cooldownMs={COOLDOWN_MS}
						initTime={subreddit.lastUpdated}
					/>
				</button>
				{!error && subreddit.lastUpdated && (
					<span className="text-zinc-500 text-xs">
						{relativeTime(subreddit.lastUpdated / 1000)} ago
					</span>
				)}
				{!isMobile && errorEl}
			</div>
			{isMobile && errorEl && (
				<div className="flex flex-col sm:flex-row items-center justify-center gap-3 px-3 pb-1 bg-[#212121]">
					{errorEl}
				</div>
			)}
		</>
	);
};

export default ScrollHeader;
