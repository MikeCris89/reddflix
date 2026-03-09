import { useEffect, useMemo, useRef, useState } from "react";
import { isAppHandledError, Subreddit } from "../../utils/types";
import {
	useFetchSeenPostsQuery,
	useRemovePendingRequestMutation,
} from "../localApp/localAppApi";
import { useFetchPostsBySubredditQuery } from "./redditApi";
import { RedditPost } from "./redditTypes";
import PostCard from "./PostCard";

export const PostSkeleton = () => (
	<div className="animate-pulse h-[400px] bg-zinc-800 w-80 md:w-90 rounded-xl ">
		<div className="space-y-3 p-3">
			<div className="h-4 bg-zinc-700 rounded w-3/4" />
			<div className="h-[300px] bg-zinc-600 rounded-md" />
			<div className="h-4 bg-zinc-700 rounded w-1/2" />
		</div>
		{/* <div className="h-[100%] flex justify-center items-center bg-zinc-700 rounded-xl">
			<div className="h-[75%] w-[90%]  bg-zinc-600 rounded-xl"></div>
		</div> */}
	</div>
);

export const SkeletonContainer = () =>
	Array.from({ length: 10 }).map((_, i) => (
		<div className="py-6" key={i}>
			<PostSkeleton />
		</div>
	));

const PostContainer = ({
	subreddit,
	postRefs,
	onRateLimit,
	onErrorMessage,
	onBanExpiry,
	onDataUpdated,
}: {
	subreddit: Subreddit;
	postRefs: React.RefObject<(HTMLDivElement | null)[]>;
	onRateLimit?: (pendingTime: number) => void;
	onErrorMessage?: (msg: string | null) => void;
	onBanExpiry?: (timestamp: number) => void;
	onDataUpdated?: () => void;
}) => {
	const [pendingTime, setPendingTime] = useState<number>(0);
	const isFirstLoad = useRef(true);
	const [removePending] = useRemovePendingRequestMutation();
	const { data, isLoading, error, isError, refetch } =
		useFetchPostsBySubredditQuery(subreddit.name, {
			//skip: !inView,
			refetchOnMountOrArgChange: false,
			refetchOnReconnect: false,
			refetchOnFocus: false,
		});

	const { data: seenPosts } = useFetchSeenPostsQuery(subreddit.name);

	const { allSortedPosts, unseenPosts: _unseenPosts } = useMemo(() => {
		if (!data || !seenPosts) return { allSortedPosts: [], unseenPosts: [] };
		const unseen: RedditPost[] = [];
		const seen: RedditPost[] = [];
		data.posts.forEach((post) => {
			if (seenPosts[post.id]) seen.push(post);
			else unseen.push(post);
		});
		const byNewest = (a: RedditPost, b: RedditPost) =>
			b.created_utc - a.created_utc;
		return {
			allSortedPosts: [...unseen.sort(byNewest), ...seen.sort(byNewest)],
			unseenPosts: unseen,
		};
	}, [data, seenPosts]);

	useEffect(() => {
		if (!pendingTime || pendingTime < Date.now()) return;

		const timeout = setTimeout(() => {
			refetch();
			removePending(pendingTime);
		}, pendingTime - Date.now());

		return () => {
			clearTimeout(timeout);
		};
	}, [pendingTime, refetch, removePending]);

	useEffect(() => {
		if (
			isError &&
			error &&
			isAppHandledError(error) &&
			error.data.pendingTimestamp > 0 &&
			error.data.reason === "rateLimit"
		) {
			console.warn(
				"Pending request: ",
				subreddit.name,
				new Date(error.data.pendingTimestamp).toLocaleDateString(),
			);
			setPendingTime(error.data.pendingTimestamp);
			onRateLimit?.(error.data.pendingTimestamp);
		}
	}, [isError, error, subreddit, onRateLimit]);

	useEffect(() => {
		if (!isError || !error) {
			onErrorMessage?.(null);
			onBanExpiry?.(0);
			return;
		}
		if (!isAppHandledError(error)) {
			onErrorMessage?.("Error loading posts");
		} else if (error.data.reason === "ban") {
			onErrorMessage?.(error.data.message);
			onBanExpiry?.(error.data.pendingTimestamp);
		} else if (error.data.reason === "rateLimit") {
			onErrorMessage?.("Reddit's rate limit reached.");
		}
	}, [isError, error, onErrorMessage, onBanExpiry]);

	useEffect(() => {
		if (data) {
			if (!isFirstLoad.current) onDataUpdated?.();
			else isFirstLoad.current = false;
		}
	}, [data, onDataUpdated]);

	return (
		<>
			{isLoading && <SkeletonContainer />}
			{(!isLoading && (
				<>
					<div></div>
					{allSortedPosts.map((post, i) => (
						<PostCard
							ref={(el) => {
								postRefs.current[i] = el;
							}}
							key={post.id}
							post={post}
							sub={subreddit.name}
							isSeen={seenPosts && !!seenPosts[post.id]}
							// className={clsx(
							// 	i === 0 && "pl-2 lg:pl-4",
							// 	i === allSortedPosts.length - 1 && "pr-2 lg:pr-4"
							// )}
						/>
					))}
					<div></div>
				</>
			)) ||
				[]}
	
		</>
	);
};

export default PostContainer;
