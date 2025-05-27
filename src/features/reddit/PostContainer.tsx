import { useMemo } from "react";
import { isAppHandledError, Subreddit } from "../../utils/types";
import { useFetchSeenPostsQuery } from "../localApp/localAppApi";
import { useFetchPostsBySubredditQuery } from "./redditApi";
import { RedditPost } from "./redditTypes";
import { useLocation, useNavigate } from "react-router-dom";
import PostCard from "./PostCard";

export const PostSkeleton = () => (
	<div className="animate-pulse bg-zinc-800 rounded-md p-4 mb-4">
		{/* <div className="h-[400px] w-60 sm:w-72 md:w-80  bg-zinc-700 rounded mb-2"></div> */}
		<div className="h-[400px] w-60 sm:w-72 md:w-80  bg-zinc-700 rounded"></div>
	</div>
);

export const SkeletonContainer = () =>
	Array.from({ length: 10 }).map((_, i) => <PostSkeleton key={i} />);

const PostContainer = ({ subreddit }: { subreddit: Subreddit }) => {
	const navigate = useNavigate();
	const location = useLocation();
	const { data, isLoading, error, isError, refetch } =
		useFetchPostsBySubredditQuery(subreddit.name, {
			//skip: !inView,
			refetchOnMountOrArgChange: false,
			refetchOnReconnect: false,
			refetchOnFocus: false,
		});

	const { data: seenPosts } = useFetchSeenPostsQuery(subreddit.name);

	const { allSortedPosts, unseenPosts } = useMemo(() => {
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

	return (
		<>
			{isLoading && <SkeletonContainer />}
			{(!isLoading &&
				allSortedPosts.map((post) => (
					<div
						key={post.id}
						className="h-full cursor-pointer"
						onClick={() =>
							navigate(`/${subreddit.name}/${post.id}`, {
								state: { backgroundLocation: location },
							})
						}
					>
						<PostCard post={post} sub={subreddit.name} />
					</div>
				))) ||
				[]}
			{isError && error && (
				<p>{isAppHandledError(error) ? error.message : "Error occurred."}</p>
			)}
		</>
	);
};

export default PostContainer;
