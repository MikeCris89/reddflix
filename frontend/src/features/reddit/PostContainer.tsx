import { useEffect, useMemo, useRef, useState } from "react";
import { COOLDOWN_MS, isAppHandledError, Subreddit } from "../../utils/types";
import { useFetchSeenPostsQuery } from "../localApp/localAppApi";
import {
	useFetchPostsBySubredditQuery,
	useLazyFetchPostsBySubredditQuery,
} from "./redditApi";
import { RedditPost } from "./redditTypes";
import PostCard from "./PostCard";
import {
	getFallbackPosts,
	getMinutesLeft,
	hasPostFallback,
} from "../../utils/helpers";
import { FetchBaseQueryError, skipToken } from "@reduxjs/toolkit/query";
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
	const [pendingTime, setPendingTime] = useState<number>(0);
	const [fallbackPosts, setFallbackPosts] = useState<RedditPost[] | null>(null);
	const isFirstLoad = useRef(true);

	const hasFallback = hasPostFallback(subreddit.name);

	// NOTE: useQuery here (not in ScrollContainer) because of inView gating.
	// Refresh button in ScrollContainer uses useLazyQuery against same cache.

	const {
		data,
		isLoading: postLoading,
		isError,
		error,
	} = useFetchPostsBySubredditQuery(
		{ subreddit: subreddit.name },
		{
			refetchOnMountOrArgChange: false,
			refetchOnReconnect: false,
			refetchOnFocus: false,
		},
	);

	const [
		fetchPosts,
		{ isLoading: fetchLoading, error: fetchError, isError: fetchIsError },
	] = useLazyFetchPostsBySubredditQuery();

	const { data: seenPosts } = useFetchSeenPostsQuery(subreddit.name);

	const isLoading = isRefreshing || postLoading || fetchLoading;

	useEffect(() => {
		if (isLoading || data) return setFallbackPosts(null);
		getFallbackPosts(subreddit.name).then(setFallbackPosts);
	}, [subreddit, isLoading, data]);

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
			fetchPosts({ subreddit: subreddit.name, slotToken: pendingTime });
		}, pendingTime - Date.now());

		return () => clearTimeout(timeout);
	}, [pendingTime, fetchPosts, subreddit]);

	useEffect(() => {
		if (
			isError &&
			error &&
			isAppHandledError(error) &&
			error.data.pendingTimestamp > 0 &&
			error.data.reason === "rateLimit"
		) {
			console.warn(
				"(Post container) Pending request: ",
				subreddit.name,
				new Date(error.data.pendingTimestamp).toLocaleString(),
				error.data.message,
			);
			setPendingTime(error.data.pendingTimestamp);
		}
	}, [isError, error, subreddit]);

	useEffect(() => {
		const activeError = fetchIsError ? fetchError : isError ? error : undefined;
		onError?.(activeError);
	}, [isError, error, fetchIsError, fetchError, onError]);

	useEffect(() => {
		if (!data) return;
		if (!isFirstLoad.current) return onDataUpdated?.();

		// wait until seenPosts is also ready before consuming the first-load slot
		if (!seenPosts) return;

		isFirstLoad.current = false;
		const inCooldown = getMinutesLeft(COOLDOWN_MS, subreddit.lastUpdated) > 0;
		if (!inCooldown && data.posts.every((p) => !!seenPosts[p.id])) {
			fetchPosts({ subreddit: subreddit.name });
		}
	}, [data, onDataUpdated, seenPosts, subreddit, fetchPosts]);

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
