import { useEffect, useMemo, useRef, useState } from "react";
import { isAppHandledError, Subreddit } from "../../utils/types";
import { useFetchSeenPostsQuery } from "../localApp/localAppApi";
import { useFetchPostsBySubredditQuery } from "./redditApi";
import { RedditPost } from "./redditTypes";
import PostCard from "./PostCard";
import { getFallbackPosts, hasPostFallback } from "../../utils/helpers";

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
	const [slotToken, setSlotToken] = useState<number | undefined>();
	const [pendingTime, setPendingTime] = useState<number>(0);
	const [fallbackPosts, setFallbackPosts] = useState<RedditPost[] | null>(null);
	const isFirstLoad = useRef(true);

	const hasFallback = hasPostFallback(subreddit.name);

	// NOTE: useQuery here (not in ScrollContainer) because of inView gating.
	// Refresh button in ScrollContainer uses useLazyQuery against same cache.
	// TODO: Refactor when proxy backend lands — lift state to ScrollContainer
	// and pass data down, since rate-limit/ban handling will be much simpler.

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
	}, [data]);

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
