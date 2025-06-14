import { useEffect, useMemo, useState } from "react";
import { isAppHandledError, Subreddit } from "../../utils/types";
import {
	useFetchSeenPostsQuery,
	useRemovePendingRequestMutation,
} from "../localApp/localAppApi";
import { useFetchPostsBySubredditQuery } from "./redditApi";
import { RedditPost } from "./redditTypes";
import PostCard from "./PostCard";
import useCountdown from "../../hooks/useCountdown";

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
}: {
	subreddit: Subreddit;
	postRefs: React.RefObject<(HTMLDivElement | null)[]>;
}) => {
	const [pendingTime, setPendingTime] = useState<number>(0);
	const remaining = useCountdown(pendingTime);
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
		return {
			allSortedPosts: [...unseen, ...seen],
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
		if (isError && error) {
			console.log(`isError for sub ${subreddit.name}: `, isError);
			console.log(`error: ${error}`);
			console.log(`data: ${data}`);
		}
		if (
			isError &&
			error &&
			isAppHandledError(error) &&
			error.data.pendingTimestamp > 0 &&
			error.data.reason === "rateLimit"
		) {
			console.log(
				"Pending request: ",
				subreddit.name,
				new Date(error.data.pendingTimestamp).toLocaleDateString()
			);
			setPendingTime(error.data.pendingTimestamp);
		}
	}, [isError, error, subreddit]);

	if (subreddit.name === "gaming") {
		console.log(allSortedPosts);
	}

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
			{isError && error && (
				<div className="flex flex-col gap-2 items-center justify-center w-full h-full">
					{!isAppHandledError(error) && (
						<p>{"Error occurred. Please try again later."}</p>
					)}
					{isAppHandledError(error) && error.data.reason === "ban" && (
						<p>{error.data.message}</p>
					)}
					{isAppHandledError(error) &&
						error.data.reason === "rateLimit" &&
						remaining > 0 && (
							<>
								<p className="text-sm text-[#E50914]">
									Reddit's Rate limit reached.
								</p>
								<p className="text-lg text-[#E50914]">
									Retrying in {Math.ceil(remaining / 1000)}s
								</p>
							</>
						)}
				</div>
			)}
		</>
	);
};

export default PostContainer;
