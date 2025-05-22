import clsx from "clsx";
import PostCard from "../features/reddit/PostCard";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import useDisplay from "../hooks/useDisplay";
import { useEffect, useRef } from "react";
import {
	useFetchPostsBySubredditQuery,
	useLazyFetchPostsBySubredditQuery,
	useLazySearchPostsQuery,
} from "../features/reddit/redditApi";
import { Category, isAppHandledError, Subreddit } from "../utils/types";

interface Props {
	category?: Category;
	direction?: "row" | "col";
	subreddit: Subreddit;
}

const PostSkeleton = () => (
	<div className="animate-pulse bg-zinc-800 rounded-md p-4 mb-4">
		<div className="h-4 bg-zinc-700 rounded w-3/4 mb-2"></div>
		<div className="h-4 bg-zinc-700 rounded w-1/2"></div>
	</div>
);

const ScrollContainer = ({ category, direction = "row", subreddit }: Props) => {
	const navigate = useNavigate();
	const { isMobile } = useDisplay();
	const location = useLocation();

	const { data, isLoading, error, isError, refetch } =
		useFetchPostsBySubredditQuery(subreddit.name, {
			refetchOnMountOrArgChange: false,
			refetchOnReconnect: false,
			refetchOnFocus: false,
		});

	// const [
	// 	getPostsBySubreddits,
	// 	{ data, isLoading, error, isError, isFetching },
	// ] = useLazyFetchPostsBySubredditQuery();

	const scrollRef = useRef<HTMLDivElement>(null);
	const nav = category?.title || subreddit.name;
	const postWidth = 280;

	useEffect(() => {
		// getPostsBySubreddits(subreddit.name, {
		// 	refetchOnMountOrArgChange: false,
		// 	refetchOnReconnect: false,
		// 	refetchOnFocus: false,
		//   });
		// });
	}, []);

	const showCache = (storeName: string) => {
		const store_ = window.store;
		if (!store_) {
			console.warn(`Redux store ${storeName} not found on window`);
			return;
		}
		const state = store_.getState();
		const queries = state.redditApi?.queries;

		for (const [key, value] of Object.entries(queries || {})) {
			if (key.includes(`${storeName}`)) {
				console.log(`Found ${storeName} query:`);
				console.log(key, value);
			}
		}
	};

	const handleScroll = (dir: "left" | "right") => {
		scrollRef.current?.scrollBy({
			left: dir === "left" ? -postWidth * 3 : postWidth * 3,
			behavior: "smooth",
		});
	};

	return (
		<div className="flex flex-col p-1">
			<div className="flex gap-2">
				<button onClick={refetch}>Refetch</button>
				<button onClick={() => showCache(subreddit.title)}>Check Cache</button>
			</div>
			<h2 className="text-xl font-extrabold bg-red-600 text-black p-1 pl-2">
				{subreddit.title}
			</h2>

			<div className="relative">
				{/* Scroll Buttons (Desktop only) */}
				{direction === "row" && !isMobile && data && (
					<>
						<ScrollButton dir="left" onClick={handleScroll} />
						<ScrollButton dir="right" onClick={handleScroll} />
					</>
				)}

				<div
					ref={scrollRef}
					className="flex items-center gap-4 p-2 overflow-x-auto overflow-y-hidden hide-scrollbar"
				>
					{isLoading &&
						Array.from({ length: 5 }).map((_, i) => <PostSkeleton key={i} />)}
					{data?.posts?.map((post) => (
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
					)) || []}
					{isError && error && (
						<p>
							{isAppHandledError(error) ? error.message : "Error occurred."}
						</p>
					)}
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
