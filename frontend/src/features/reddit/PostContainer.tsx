import { useEffect, useMemo, useRef, useState } from "react";
import { isAppHandledError, Subreddit } from "../../utils/types";
import { useFetchSeenPostsQuery } from "../localApp/localAppApi";
import { useFetchPostsBySubredditQuery } from "./redditApi";
import { RedditPost } from "./redditTypes";
import PostCard from "./PostCard";
import { getFallbackPosts, hasPostFallback } from "../../utils/helpers";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { SerializedError } from "@reduxjs/toolkit";

export const PostSkeleton = () => (
	<div className="animate-pulse h-[400px] bg-zinc-800 w-80 md:w-90 rounded-xl ">
		<div className="space-y-3 p-3">
			<div className="h-4 bg-zinc-700 rounded w-3/4" />
			<div className="h-[300px] bg-zinc-600 rounded-md" />
			<div className="h-4 bg-zinc-700 rounded w-1/2" />
		</div>
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
	onError,
	onDataUpdated,
	isRefreshing = false,
}: {
	subreddit: Subreddit;
	postRefs: React.RefObject<(HTMLDivElement | null)[]>;
	onError?: (error: FetchBaseQueryError | SerializedError | undefined) => void;
	onDataUpdated?: () => void;
	isRefreshing?: boolean;
}) => {
	const [slotToken, setSlotToken] = useState<number | undefined>();
	const [pendingTime, setPendingTime] = useState<number>(0);
	const [fallbackPosts, setFallbackPosts] = useState<RedditPost[] | null>(null);
	const isFirstLoad = useRef(true);

	const hasFallback = hasPostFallback(subreddit.name);

	// NOTE: useQuery here (not in ScrollContainer) because of inView gating.
	// Refresh button in ScrollContainer uses useLazyQuery against same cache.

	const { data, isLoading, error, isError } = useFetchPostsBySubredditQuery(
		{ subreddit: subreddit.name, slotToken },
		{
			refetchOnMountOrArgChange: false,
			refetchOnReconnect: false,
			refetchOnFocus: false,
		},
	);

	const { data: seenPosts } = useFetchSeenPostsQuery(subreddit.name);

	useEffect(() => {
		getFallbackPosts(subreddit.name).then(setFallbackPosts);
	}, [subreddit]);

	const resolvedData = useMemo(() => {
		if (data) return data;
		if (hasFallback && fallbackPosts && fallbackPosts.length > 0) {
			return { posts: fallbackPosts, after: null };
		}
		return null;
	}, [data, fallbackPosts, hasFallback]);

	const { allSortedPosts, unseenPosts: _unseenPosts } = useMemo(() => {
		if (!resolvedData || !seenPosts)
			return { allSortedPosts: [], unseenPosts: [] };
		const unseen: RedditPost[] = [];
		const seen: RedditPost[] = [];
		resolvedData.posts.forEach((post) => {
			if (seenPosts[post.id]) seen.push(post);
			else unseen.push(post);
		});
		const byNewest = (a: RedditPost, b: RedditPost) =>
			b.created_utc - a.created_utc;
		return {
			allSortedPosts: [...unseen.sort(byNewest), ...seen.sort(byNewest)],
			unseenPosts: unseen,
		};
	}, [resolvedData, seenPosts]);

	useEffect(() => {
		if (!pendingTime || pendingTime < Date.now()) return;

		const timeout = setTimeout(() => {
			setSlotToken(pendingTime);
		}, pendingTime - Date.now());

		return () => clearTimeout(timeout);
	}, [pendingTime]);

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
		}
	}, [isError, error, subreddit]);

	useEffect(() => {
		onError?.(isError ? error : undefined);
	}, [isError, error, onError]);

	useEffect(() => {
		if (data) {
			if (!isFirstLoad.current) onDataUpdated?.();
			else isFirstLoad.current = false;
		}
	}, [data, onDataUpdated]);

	return (
		<>
			{(isLoading || isRefreshing) && <SkeletonContainer />}
			{(!isLoading && !isRefreshing && (
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
