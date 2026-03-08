import clsx from "clsx";
import { ArrowLeft, ArrowRight, RefreshCw } from "lucide-react";
import useDisplay from "../hooks/useDisplay";
import { useCallback, useMemo, useRef, useState } from "react";

import { Subreddit } from "../utils/types";
import { useInView } from "react-intersection-observer";
import PostContainer, {
	SkeletonContainer,
} from "../features/reddit/PostContainer";
import useMinuteCountdown from "../hooks/useMinuteCountdown";

const REFRESH_COOLDOWN_MS = 10 * 60 * 1000; // 10 minutes

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

	const scrollRef = useRef<HTMLDivElement>(null);
	const scrollWidth = scrollRef.current?.clientWidth;
	const postWidth = isMobile ? 288 + 10 : 320 + 14;

	const postsPerPage = useMemo(() => {
		if (scrollWidth) {
			return Math.max(1, Math.floor(scrollWidth / postWidth));
		}
		return 1;
	}, [scrollWidth, postWidth]);

	// Refresh state — button enabled when cooldown has elapsed
	const refetchFnRef = useRef<(() => void) | null>(null);
	const hasAutoRefreshed = useRef(false);
	const remainingMs = useMinuteCountdown(
		subreddit.lastUpdated,
		REFRESH_COOLDOWN_MS,
	);
	const canRefresh = remainingMs <= 0;
	// Capture canRefresh at mount time — auto-refresh is one-shot, doesn't need live value
	const mountCanRefresh = useRef(canRefresh && !!subreddit.lastUpdated);

	const handleRefresh = useCallback(() => {
		setIndex(0);
		scrollRef.current?.scrollTo({ left: 0 });
		refetchFnRef.current?.();
	}, [subreddit.name]);

	const onRefetchReady = useCallback(
		(refetch: () => void) => {
			refetchFnRef.current = refetch;
			// On first mount, auto-refresh if cooldown had already elapsed when component mounted.
			// Uses a ref so this callback stays stable across minute-tick re-renders.
			if (!hasAutoRefreshed.current && mountCanRefresh.current) {
				hasAutoRefreshed.current = true;
				handleRefresh();
			}
		},
		[handleRefresh],
	);

	const handleScroll = (dir: "left" | "right") => {
		const numPosts = postsPerPage;
		const nextIndex =
			dir === "left"
				? Math.max(index - numPosts, 0)
				: Math.min(index + numPosts, postRefs.current.length - 1);

		setIndex(nextIndex);

		postRefs.current[nextIndex]?.scrollIntoView({
			behavior: "smooth",
			inline: "start",
			block: "nearest",
		});
	};

	const minutesLeft = Math.ceil(remainingMs / 60_000);

	const titleStyle3 = ` text-white font-semibold pl-3 pt-2 pb-1 border-l-4 border-[#E50914] bg-[#212121] rounded-t-md ${
		isMobile ? "text-base" : "text-lg"
	} `;

	return (
		<div className="flex flex-col bg-[#1a1a1a] rounded-md">
			{/* Title + Refresh Button */}
			<div
				className={clsx(
					"flex items-end justify-start pr-3 gap-5 ",
					titleStyle3,
				)}
			>
				<h2>r/{subreddit.name}</h2>
				<button
					onClick={handleRefresh}
					disabled={!canRefresh}
					className={clsx(
						"flex items-center gap-1 text-xs font-medium px-2 py-1 rounded transition",
						canRefresh
							? "text-white hover:text-[#E50914] cursor-pointer"
							: "text-zinc-500 cursor-not-allowed",
					)}
					title={
						canRefresh
							? "Refresh posts"
							: `Refresh available in ${minutesLeft}m`
					}
				>
					<RefreshCw size={13} />
					<span>{canRefresh ? "Refresh" : `${minutesLeft}m`}</span>
				</button>
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
								onRefetchReady={onRefetchReady}
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
