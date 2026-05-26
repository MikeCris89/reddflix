import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { SerializedError } from "@reduxjs/toolkit";
import { isAppHandledError } from "../utils/types";
import useCountdown from "../hooks/useCountdown";
import { useMinuteClock } from "../hooks/useMinuteClock";
import RetryLabel from "./RetryLabel";

interface Props {
	error: FetchBaseQueryError | SerializedError;
	variant?: "inline" | "panel";
}

const QueryErrorMessage = ({ error, variant = "panel" }: Props) => {
	const appHandled = isAppHandledError(error);
	const pendingTimestamp =
		appHandled && error.data.reason === "rateLimit"
			? error.data.pendingTimestamp
			: 0;
	const banExpiry =
		appHandled && error.data.reason === "ban"
			? error.data.pendingTimestamp
			: 0;

	const remaining = useCountdown(pendingTimestamp);
	useMinuteClock();
	const banMinutesLeft =
		banExpiry > 0 ? Math.max(0, Math.ceil((banExpiry - Date.now()) / 60000)) : 0;

	if (appHandled && error.data.reason === "rateLimit" && remaining > 0) {
		if (variant === "inline") return <RetryLabel remainingMs={remaining} />;
		return (
			<div className="flex flex-col gap-2 items-center justify-center w-full h-full">
				<p className="text-sm text-[#E50914]">Reddit's Rate limit reached.</p>
				<p className="text-lg text-[#E50914]">
					Retrying in {Math.ceil(remaining / 1000)}s
				</p>
			</div>
		);
	}

	if (appHandled && error.data.reason === "ban" && banMinutesLeft > 0) {
		if (variant === "inline") {
			return (
				<span className="flex items-center gap-1 text-blue-400 text-xs">
					Temp banned · {banMinutesLeft}m left
				</span>
			);
		}
		return (
			<div className="flex flex-col gap-2 items-center justify-center w-full h-full">
				<p className="text-blue-400">{error.data.message}</p>
			</div>
		);
	}

	if (variant === "inline") {
		return (
			<span className="flex items-center gap-1 text-[#E50914] text-xs">
				Something went wrong.
			</span>
		);
	}
	return (
		<div className="flex flex-col gap-2 items-center justify-center w-full h-full">
			<p>Error occurred. Please try again later.</p>
		</div>
	);
};

export default QueryErrorMessage;
