import clsx from "clsx";
import { ArrowLeft, ArrowRight, RefreshCw } from "lucide-react";
import useDisplay from "../hooks/useDisplay";
import { useEffect, useMemo, useRef, useState } from "react";
import useCountdown from "../hooks/useCountdown";
import Spinner from "./Spinner";

import { isAppHandledError, Subreddit } from "../utils/types";
import { useInView } from "react-intersection-observer";
import PostContainer, {
	SkeletonContainer,
} from "../features/reddit/PostContainer";
import { useLazyFetchPostsBySubredditQuery } from "../features/reddit/redditApi";
import MinutesLeft from "./MinutesLeft";
import { getMinutesLeft, relativeTime } from "../utils/helpers";

interface Props {
	direction?: "row" | "col";
	subreddit: Subreddit;
}

const ScrollContainer = ({ direction = "row", subreddit }: Props) => {
	const [index, setIndex] = useState(0);
	const postRefs = useRef<(HTMLDivElement | null)[]>([]);
	const { isMobile, isPortrait } = useDisplay();
	const { ref, inView } = useInView({
		triggerOnce: true,
		threshold: 0.7,
	});

	const [trigger, refreshResult] = useLazyFetchPostsBySubredditQuery();
	const isRefreshing = refreshResult.isFetching;

	const errorMessage = refreshResult.isError
		? isAppHandledError(refreshResult.error)
			? refreshResult.error.data.message
			: "Error loading posts"
		: null;

	const [pendingTime, setPendingTime] = useState(0);
	const [postError, setPostError] = useState<string | null>(null);
	const remaining = useCountdown(pendingTime);

	const handleRefresh = () => trigger(subreddit.name, false);

	const handleDataUpdated = () => {
		setIndex(0);
		scrollRef.current?.scrollTo({ left: 0, behavior: "smooth" });
	};

	// Cooldown between requests
	const COOLDOWN_MS = 10 * 60 * 1000;
	const mLeft = getMinutesLeft(COOLDOWN_MS, subreddit.lastUpdated);
	const inCooldown = mLeft > 0;

	const scrollRef = useRef<HTMLDivElement>(null);
	const scrollWidth = scrollRef.current?.clientWidth;
	const postWidth = isMobile ? 288 + 10 : 320 + 14;

	const postsPerPage = useMemo(() => {
		if (scrollWidth) {
			return Math.max(1, Math.floor(scrollWidth / postWidth));
		}
		return 1;
	}, [scrollWidth, postWidth]);

	const handleScroll = (dir: "left" | "right") => {
		const numPosts = postsPerPage;
		const nextIndex =
			dir === "left"
				? Math.max(index - numPosts, 0)
				: Math.min(index + numPosts, postRefs.current.length - 1);

		setIndex(nextIndex);

		postRefs.current[nextIndex]?.scrollIntoView({
			behavior: "smooth",
			inline: "start", // or "center"
			block: "nearest",
		});
	};

	const titleStyle3 = ` text-white font-semibold pl-3 pt-2 pb-1 border-l-4 border-[#E50914] bg-[#212121] rounded-t-md ${
		isMobile ? "text-base" : "text-lg"
	} `;

	return (
		<div className="flex flex-col bg-[#1a1a1a] rounded-md">
			{/* Title */}
			<div
				className={`flex items-center justify-start gap-[20px] pr-2 ${titleStyle3}`}
			>
				<span>r/{subreddit.name}</span>
				<button
					onClick={handleRefresh}
					disabled={isRefreshing || inCooldown}
					className="text-zinc-400 hover:text-white transition-colors flex gap-2 items-center text-[12px] disabled:opacity-40 disabled:cursor-not-allowed"
					title="Refresh"
				>
					<RefreshCw size={12} className={isRefreshing ? "animate-spin" : ""} />
					<MinutesLeft
						cooldownMs={COOLDOWN_MS}
						initTime={subreddit.lastUpdated}
					/>
					{/* {inCooldown ? `${minutesLeft}m` : "Refresh"} */}
				</button>
				{remaining > 0 && (
					<span className="flex items-center gap-1 text-[#E50914] text-xs">
						<Spinner size="sm" />
						Retrying in {Math.ceil(remaining / 1000)}s
					</span>
				)}
				{remaining <= 0 && (postError || errorMessage) && (
					<span className="text-[#E50914] text-xs truncate max-w-[200px]">
						{postError || errorMessage}
					</span>
				)}
				{remaining <= 0 && subreddit.lastUpdated && (
					<span className="text-zinc-500 text-xs">
						{relativeTime(subreddit.lastUpdated / 1000)} ago
					</span>
				)}
			</div>

			<div className="relative">
				{/* Scroll Buttons (Desktop only) */}
				{direction === "row" && !isMobile && (
					<>
						<ScrollButton dir="left" onClick={handleScroll} />
						<ScrollButton dir="right" onClick={handleScroll} />
					</>
				)}

				<div
					ref={ref}
					className={clsx(
						"min-h-[400px] px-1 rounded-b-md relative",
						isMobile && !isPortrait && "min-h-[300px]",
					)}
				>
					<div
						ref={scrollRef}
						className="flex items-center gap-5 md:gap-7 overflow-x-auto overflow-y-hidden snap-x snap-mandatory scroll-smooth scroll-px-5 md:scroll-px-10 lg:scroll-px-11 hide-scrollbar h-full w-full"
					>
						{/* Left Shadow  */}
						<div className="absolute left-0 top-0 bottom-0 w-6 md:8 bg-gradient-to-r from-[#242424] to-transparent pointer-events-none z-10 rounded-b-md" />

						{/* Right Shadow  */}
						<div className="absolute right-0 top-0 bottom-0 w-6 md:8 bg-gradient-to-l from-[#242424] to-transparent pointer-events-none z-10 rounded-b-md" />

						{!inView && <SkeletonContainer />}
						{inView && (
							<PostContainer
								subreddit={subreddit}
								postRefs={postRefs}
								onRateLimit={setPendingTime}
								onErrorMessage={setPostError}
							/>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

const ScrollButton = ({
	dir,
	onClick,
}: {
	dir: "left" | "right";
	onClick: (dir: "left" | "right") => void;
}) => {
	const Icon = dir === "left" ? ArrowLeft : ArrowRight;
	const position = dir === "left" ? "left-0" : "right-0";

	return (
		<div
			onClick={() => onClick(dir)}
			className={clsx(
				"absolute top-1/2 -translate-y-1/2 z-20 h-full rounded-1 bg-neutral-900/10 hover:bg-neutral-900/60 transition p-2 flex items-center hover:cursor-pointer group",
				position,
			)}
		>
			<div
				className={clsx(
					"bg-neutral-800/60 group-hover:bg-cyan-700/80 group-hover:bg-[#E50914] transition p-2 rounded-full shadow-md ring-1 ring-[#E5091470]",
				)}
			>
				<Icon size={20} className="text-neutral-100" />
			</div>
		</div>
	);
};

export default ScrollContainer;
