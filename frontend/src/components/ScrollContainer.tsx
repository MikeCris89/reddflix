import clsx from "clsx";
import { ArrowLeft, ArrowRight } from "lucide-react";
import useDisplay from "../hooks/useDisplay";
import { useCallback, useMemo, useRef, useState } from "react";

import { Subreddit } from "../utils/types";
import { useInView } from "react-intersection-observer";
import PostContainer, {
	SkeletonContainer,
} from "../features/reddit/PostContainer";
import { useLazyFetchPostsBySubredditQuery } from "../features/reddit/redditApi";
import ScrollHeader from "./ScrollHeader";

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
	const refreshError = refreshResult.isError ? refreshResult.error : undefined;

	const [pendingTime, setPendingTime] = useState(0);
	const [banExpiry, setBanExpiry] = useState(0);
	const handleBanExpiry = useCallback((timestamp: number) => {
		setBanExpiry((prev) => (prev === timestamp ? prev : timestamp));
	}, []);

	const handleRefresh = () => trigger({ subreddit: subreddit.name }, false);

	const scrollRef = useRef<HTMLDivElement>(null);

	const handleDataUpdated = useCallback(() => {
		setIndex(0);
		scrollRef.current?.scrollTo({ left: 0, behavior: "smooth" });
	}, []);

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
			inline: "start",
			block: "nearest",
		});
	};

	return (
		<div className="flex flex-col bg-[#1a1a1a] rounded-md">
			<ScrollHeader
				subreddit={subreddit}
				pendingTime={pendingTime}
				banExpiry={banExpiry}
				isRefreshing={isRefreshing}
				onRefresh={handleRefresh}
				refreshError={refreshError}
			/>

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
								onBanExpiry={handleBanExpiry}
								onDataUpdated={handleDataUpdated}
								isRefreshing={isRefreshing}
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
