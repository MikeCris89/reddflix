import clsx from "clsx";
import { RedditPost } from "../features/reddit/redditTypes";
import PostCard from "../features/reddit/PostCard";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import useDisplay from "../hooks/useDisplay";
import { useRef } from "react";
import { useLazySearchPostsQuery } from "../features/reddit/redditApi";

interface Props {
	data: RedditPost[] | undefined;
	title: string;
	direction?: "row" | "col";
	category?: string;
	subreddit?: string;
}

const ScrollContainer = ({
	title,
	direction = "row",
	category,
	subreddit,
}: Props) => {
	const navigate = useNavigate();
	const { isMobile } = useDisplay();
	const location = useLocation();

	const [getCategoryPosts, { data, isLoading, error, isError, isFetching }] =
		useLazySearchPostsQuery();

	const scrollRef = useRef<HTMLDivElement>(null);
	const nav = category || subreddit;

	const postWidth = 280;

	const handleScroll = (dir: "left" | "right") => {
		scrollRef.current?.scrollBy({
			left: dir === "left" ? -postWidth * 3 : postWidth * 3,
			behavior: "smooth",
		});
	};

	return (
		<div className="flex flex-col p-1">
			<h2 className="text-xl font-extrabold bg-red-600 text-black p-1 pl-2">
				{title}
			</h2>

			<div className="relative">
				{/* Scroll Buttons (Desktop only) */}
				{direction === "row" && !isMobile && (
					<>
						<ScrollButton dir="left" onClick={handleScroll} />
						<ScrollButton dir="right" onClick={handleScroll} />
					</>
				)}

				<div
					ref={scrollRef}
					className="flex items-center gap-4 p-2 overflow-x-auto overflow-y-hidden hide-scrollbar"
				>
					{data &&
						data.posts.map((post) => (
							<div
								key={post.id}
								className="h-full cursor-pointer"
								onClick={() =>
									navigate(`/${nav ? nav + "/" : ""}${post.id}`, {
										state: { backgroundLocation: location },
									})
								}
							>
								<PostCard post={post} />
							</div>
						))}
					{isError && error && <p>Error getting data from Reddit.</p>}
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
				"absolute top-1/2 -translate-y-1/2 z-10 h-full rounded-1 bg-neutral-900/60 p-2 flex items-center hover:cursor-pointer group",
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
