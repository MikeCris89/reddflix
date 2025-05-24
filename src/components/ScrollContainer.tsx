import clsx from "clsx";
import { ArrowLeft, ArrowRight } from "lucide-react";
import useDisplay from "../hooks/useDisplay";
import { useRef } from "react";

import { Subreddit } from "../utils/types";
import { useInView } from "react-intersection-observer";
import { showCache } from "../utils/helpers";
import PostContainer, {
	SkeletonContainer,
} from "../features/reddit/PostContainer";

interface Props {
	direction?: "row" | "col";
	subreddit: Subreddit;
}

const ScrollContainer = ({ direction = "row", subreddit }: Props) => {
	const { isMobile } = useDisplay();
	const { ref, inView } = useInView({
		triggerOnce: true,
		threshold: 0.7,
	});

	const scrollRef = useRef<HTMLDivElement>(null);
	const postWidth = 280;

	const handleScroll = (dir: "left" | "right") => {
		scrollRef.current?.scrollBy({
			left: dir === "left" ? -postWidth * 3 : postWidth * 3,
			behavior: "smooth",
		});
	};

	const refetchPosts = (refetch: () => void) => {
		if (refetch) refetch();
	};

	console.log("scrollcontainer rendered", subreddit.title);

	return (
		<div className="flex flex-col p-1">
			<div className="flex gap-2">
				{/* <button onClick={refetchPosts}>Refetch</button> */}
				<button onClick={() => showCache(subreddit.name)}>Check Cache</button>
			</div>
			<h2 className="text-xl font-extrabold bg-red-600 text-black p-1 pl-2">
				{subreddit.title}
			</h2>

			<div className="relative">
				{/* Scroll Buttons (Desktop only) */}
				{direction === "row" && !isMobile && (
					<>
						<ScrollButton dir="left" onClick={handleScroll} />
						<ScrollButton dir="right" onClick={handleScroll} />
					</>
				)}

				<div ref={ref} className="min-h-[400px] p-2">
					<div
						ref={scrollRef}
						className="flex items-center gap-4 overflow-x-auto overflow-y-hidden hide-scrollbar px-[50px]"
					>
						{!inView && <SkeletonContainer />}
						{inView && <PostContainer subreddit={subreddit} />}
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
				"absolute top-1/2 -translate-y-1/2 z-10 h-full rounded-1 bg-neutral-900/20 hover:bg-neutral-900/60 transition p-2 flex items-center hover:cursor-pointer group",
				position
			)}
		>
			<div
				className={clsx(
					"bg-neutral-800/60 group-hover:bg-cyan-700/80 transition p-2 rounded-full shadow-md ring-1 ring-cyan-700"
				)}
			>
				<Icon size={20} className="text-white" />
			</div>
		</div>
	);
};

export default ScrollContainer;
