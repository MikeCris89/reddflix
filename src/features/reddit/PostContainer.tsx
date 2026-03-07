import { useEffect, useMemo, useRef, useState } from "react";
import { isAppHandledError, Subreddit } from "../../utils/types";
import {
	useFetchSeenPostsQuery,
	usePruneSeenPostsForSubredditMutation,
	useRemovePendingRequestMutation,
	useSetSubredditLastUpdatedMutation,
} from "../localApp/localAppApi";
import { useFetchPostsBySubredditQuery } from "./redditApi";
import { RedditPost } from "./redditTypes";
import PostCard from "./PostCard";
import useCountdown from "../../hooks/useCountdown";
import Spinner from "../../components/Spinner";

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
	onRefetchReady,
}: {
	subreddit: Subreddit;
	postRefs: React.RefObject<(HTMLDivElement | null)[]>;
	onRefetchReady: (refetch: () => void) => void;
}) => {
	const [pendingTime, setPendingTime] = useState<number>(0);
	const remaining = useCountdown(pendingTime);
	const [removePending] = useRemovePendingRequestMutation();
	const [setSubredditLastUpdated] = useSetSubredditLastUpdatedMutation();
	const [pruneSeenPosts] = usePruneSeenPostsForSubredditMutation();
	// Tracks whether a real network fetch was in-flight (vs cache rehydration)
	const wasFetchingRef = useRef(false);
	const fetchCountRef = useRef(0);

	const { data, isLoading, isFetching, error, isError, refetch } =
		useFetchPostsBySubredditQuery(subreddit.name, {
			refetchOnMountOrArgChange: false,
			refetchOnReconnect: false,
			refetchOnFocus: false,
		});

	const { data: seenPosts } = useFetchSeenPostsQuery(subreddit.name);

	const allSortedPosts = useMemo(() => {
		if (!data || !seenPosts) return [];
		const unseen: RedditPost[] = [];
		const seen: RedditPost[] = [];
		data.posts.forEach((post) => {
			if (seenPosts[post.id]) seen.push(post);
			else unseen.push(post);
		});
		const byDateDesc = (a: RedditPost, b: RedditPost) =>
			b.created_utc - a.created_utc;
		return [...unseen.sort(byDateDesc), ...seen.sort(byDateDesc)];
	}, [data, seenPosts]);

	// Only update lastUpdated when a real network fetch completes (not cache rehydration).
	// We detect this by tracking isFetching transitions: true→false means a request finished.
	useEffect(() => {
		if (isFetching) {
			wasFetchingRef.current = true;
			return;
		}
		if (!wasFetchingRef.current || !data) return;
		wasFetchingRef.current = false;
		fetchCountRef.current += 1;
		setSubredditLastUpdated(subreddit.name);
		if (fetchCountRef.current > 1) {
			pruneSeenPosts({
				subreddit: subreddit.name,
				keepIds: data.posts.map((p) => p.id),
			});
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isFetching, data]);

	// Pass refetch fn up to ScrollContainer for the refresh button
	useEffect(() => {
		onRefetchReady(refetch);
	}, [refetch, onRefetchReady]);

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
				new Date(error.data.pendingTimestamp).toLocaleDateString()
			);
			setPendingTime(error.data.pendingTimestamp);
		}
	}, [isError, error, subreddit]);

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
						/>
					))}
					<div></div>
				</>
			)) ||
				[]}
			{isError && error && (
				<>
					<div className="w-full h-[300px] flex justify-center items-center">
						{!isAppHandledError(error) && (
							<p>{"Error occurred. Please try again later."}</p>
						)}
						{isAppHandledError(error) && error.data.reason === "ban" && (
							<p>{error.data.message}</p>
						)}
						{isAppHandledError(error) &&
							error.data.reason === "rateLimit" &&
							remaining > 0 && (
								<div className="flex flex-col flex-1 w-full h-full justify-center items-center gap-2">
									<p className="text-md text-[#E50914] font-semibold">
										Reddit's Rate limit reached.
									</p>
									<p className="text-lg text-[#E50914] font-semibold">
										Retrying in {Math.ceil(remaining / 1000)}s
									</p>
									<Spinner size="sm" />
								</div>
							)}
					</div>
					<div></div>
					<div></div>
				</>
			)}
		</>
	);
};

export default PostContainer;
