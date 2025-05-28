import clsx from "clsx";
import { ArrowLeft, ArrowRight } from "lucide-react";
import useDisplay from "../hooks/useDisplay";
import { useMemo, useRef, useState } from "react";

import { Subreddit } from "../utils/types";
import { useInView } from "react-intersection-observer";
import PostContainer, {
	SkeletonContainer,
} from "../features/reddit/PostContainer";

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

	// const handleScroll1 = (dir: "left" | "right") => {
	// 	scrollRef.current?.scrollBy({
	// 		left: dir === "left" ? -postWidth * 4 : postWidth * 4,
	// 		behavior: "smooth",
	// 	});
	// };

	const handleScroll = (dir: "left" | "right") => {
		const numPosts = postsPerPage;
		const nextIndex =
			dir === "left"
				? Math.max(index - numPosts, 0)
				: Math.min(index + numPosts, postRefs.current.length - 1);

		setIndex(nextIndex);

		postRefs.current[nextIndex]?.scrollIntoView({
			behavior: "smooth",
			inline: "start", // or "center" if you prefer
			block: "nearest",
		});
	};

	const refetchPosts = (refetch: () => void) => {
		if (refetch) refetch();
	};

	const titleStyle1 =
		"text-2xl md:text-3xl font-bold text-neutral-100 bg-gradient-to-r from-red-600 via-red-500 to-red-700 shadow-sm rounded-sm p-2 pl-2";

	const titleStyle2 =
		"flex items-center px-2 py-1 font-bold text-lg text-neutral-100 border-l-4 border-red-600 bg-[#1a1a1a] shadow-sm ";

	const titleStyle3 = ` text-white font-semibold pl-3 pt-2 pb-1 border-l-4 border-[#E50914] bg-[#212121] rounded-t-md ${
		isMobile ? "text-base" : "text-lg"
	} `;

	const redShadow = "shadow-[0_0_6px_#e5091440]";

	return (
		<div className="flex flex-col bg-[#1a1a1a] rounded-md">
			{/* <div className="flex gap-2">
				<button onClick={refetchPosts}>Refetch</button>
				<button onClick={() => showCache(subreddit.name)}>Check Cache</button>
			</div> */}
			{/* Title */}
			<h2 className={titleStyle3}>r/{subreddit.title}</h2>

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
						isMobile && !isPortrait && "min-h-[300px]"
					)}
				>
					<div
						ref={scrollRef}
						className="flex items-center space-x-5 md:space-x-7 overflow-x-auto overflow-y-hidden snap-x snap-mandatory scroll-smooth md:scroll-px-10 lg:scroll-px-11 hide-scrollbar "
					>
						{/* Left Shadow  */}
						<div className="absolute left-0 top-0 bottom-0 w-6 md:8 bg-gradient-to-r from-[#242424] to-transparent pointer-events-none z-10 rounded-b-md" />

						{/* Right Shadow  */}
						<div className="absolute right-0 top-0 bottom-0 w-6 md:8 bg-gradient-to-l from-[#242424] to-transparent pointer-events-none z-10 rounded-b-md" />

						{!inView && <SkeletonContainer />}
						{inView && (
							<PostContainer subreddit={subreddit} postRefs={postRefs} />
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
				position
			)}
		>
			<div
				className={clsx(
					"bg-neutral-800/60 group-hover:bg-cyan-700/80 group-hover:bg-[#E50914] transition p-2 rounded-full shadow-md ring-1 ring-[#E5091470]"
				)}
			>
				<Icon size={20} className="text-neutral-100" />
			</div>
		</div>
	);
};

export default ScrollContainer;
