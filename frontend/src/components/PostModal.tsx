import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
	useFetchPostsBySubredditQuery,
	useLazyFetchPostAndCommentsQuery,
} from "../features/reddit/redditApi";
import { useFetchSeenPostsQuery } from "../features/localApp/localAppApi";
import { useEffect, useState } from "react";
import Post from "../features/reddit/Post";
import {
	getCreatedTime,
	getFallbackPosts,
	isFallbackPost,
} from "../utils/helpers";
import clsx from "clsx";
import Comments from "../features/reddit/Comments";
import useDisplay from "../hooks/useDisplay";
import { isTitleAsPost, RedditPost } from "../features/reddit/redditTypes";
import { AnimatePresence, motion } from "framer-motion";
import NoMatch from "../pages/NoMatch";
import { skipToken } from "@reduxjs/toolkit/query";
import Spinner from "./Spinner";
import QueryErrorMessage from "./QueryErrorMessage";
import { isAppHandledError } from "../utils/types";

const PostModal = ({
	setLayoutSize,
}: {
	setLayoutSize?: (size: "normal" | "wide") => void;
}) => {
	const navigate = useNavigate();
	const { subreddit, postId } = useParams();
	const [post, setPost] = useState<RedditPost | null>(null);
	const [pendingTime, setPendingTime] = useState(0);
	const [showComments, setShowComments] = useState(false);
	const { isPortrait } = useDisplay();
	const location = useLocation();
	const state = location.state as { backgroundLocation?: Location };
	const backgroundLocation = state?.backgroundLocation;
	const isFallback = !!(postId && isFallbackPost(postId));

	const { data, isLoading: loadingPosts } = useFetchPostsBySubredditQuery(
		subreddit && backgroundLocation && !isFallback ? { subreddit } : skipToken,
		{
			selectFromResult: ({ data, isLoading }) => {
				return {
					data: data?.posts.find((posts) => posts.id === postId),
					isLoading,
				};
			},
		},
	);

	const [fetchPost, { isLoading: fetchingPost, isError, error }] =
		useLazyFetchPostAndCommentsQuery();

	const { data: seenPosts } = useFetchSeenPostsQuery(
		(data as RedditPost | undefined)?.subreddit ?? "",
		{
			skip: !data?.subreddit,
		},
	);

	const isSeen = !!(postId && seenPosts?.[postId]);

	useEffect(() => {
		if (!subreddit) return;

		if (postId && isFallbackPost(postId)) {
			getFallbackPosts(subreddit).then((posts) =>
				setPost(posts.find((el) => el.id === postId) ?? null),
			);
			return;
		}

		if (data) return setPost(data);
		if (!backgroundLocation && postId) {
			fetchPost({ postId, shared: true })
				.unwrap()
				.then((resp) => setPost(resp.post ?? null))
				.catch((err) => {
					if (
						isAppHandledError(err) &&
						err.data.reason === "rateLimit" &&
						err.data.pendingTimestamp > 0
					) {
						setPendingTime(err.data.pendingTimestamp);
						return;
					}
				});
			return;
		}
	}, [data, backgroundLocation, subreddit, postId, fetchPost]);

	useEffect(() => {
		if (!pendingTime || pendingTime <= Date.now()) return;
		if (!postId) return;
		const timeout = setTimeout(() => {
			fetchPost({ postId, shared: true })
				.unwrap()
				.then((resp) => setPost(resp.post ?? null))
				.catch((err) => {
					if (
						isAppHandledError(err) &&
						err.data.reason === "rateLimit" &&
						err.data.pendingTimestamp > 0
					) {
						setPendingTime(err.data.pendingTimestamp);
					}
				});
		}, pendingTime - Date.now());
		return () => clearTimeout(timeout);
	}, [pendingTime, postId, fetchPost]);

	useEffect(() => {
		if (backgroundLocation && setLayoutSize) {
			setLayoutSize(showComments ? "wide" : "normal");
		}
	}, [showComments, backgroundLocation, setLayoutSize]);

	if (!subreddit || !postId) {
		return <NoMatch />;
	}

	const toggleComments = () => {
		setShowComments((prev) => !prev);
	};

	const postContainerClass = clsx("overflow-hidden ", {
		"min-w-full min-h-full":
			!isPortrait && !showComments && !backgroundLocation,
		"min-w-[40%] min-h-full":
			!isPortrait && showComments && !backgroundLocation,
		"min-h-full min-w-full": isPortrait && !showComments && !backgroundLocation,
		"min-w-full min-h-[40%]": isPortrait && showComments && !backgroundLocation,
		"min-w-full": !isPortrait && !showComments && backgroundLocation,
		"min-w-[40%]": !isPortrait && showComments && backgroundLocation,
		"min-h-full": isPortrait && !showComments && backgroundLocation,
		"min-h-[40%]": isPortrait && showComments && backgroundLocation,
	});

	if (loadingPosts || fetchingPost)
		return (
			<div className="w-full h-full flex justify-center">
				<Spinner />
			</div>
		);

	if (!post && isError && error) {
		return (
			<div className="w-full h-full flex justify-center items-center p-3">
				<QueryErrorMessage error={error} variant="panel" />
			</div>
		);
	}

	if (!post) {
		return <p>Post Not Found - {postId}</p>;
	}

	return (
		<div
			className={clsx("flex flex-col justify-center h-full", {
				"p-3 ": !backgroundLocation,
				"min-w-full min-h-full": !backgroundLocation && isPortrait,
				"w-[700px]": !isPortrait && !backgroundLocation && !showComments,
				"w-full": !isPortrait && !backgroundLocation && showComments,
			})}
		>
			{/* Header - r/ u/ close btn */}
			<div className="flex justify-between items-center p-1">
				<div>
					<p className="text-sm text-[#E50914] font-semibold">
						r/{post.subreddit}
					</p>
					<div className="flex justify-start items-center gap-1">
						<p className="text-xs">u/{post.author}</p>
						<p>&#8226;</p>
						<p className="text-xs">{getCreatedTime(post.created_utc)}</p>
						{isSeen && (
							<span className="text-[10px] font-medium text-green-400 leading-none">
								seen
							</span>
						)}
					</div>
				</div>
				{backgroundLocation && <button onClick={() => navigate(-1)}>x</button>}
			</div>
			{/* Title */}
			{!isTitleAsPost(post) && (
				<h2 className="pl-1 text-base font-semibold w-full max-w-[700px] justify-self-start">
					{post.title}
				</h2>
			)}
			{/* Main content: Post + Comments layout */}
			<div
				className={clsx("flex flex-1 overflow-hidden", {
					"flex-row": !isPortrait,
					"flex-col": isPortrait,
				})}
			>
				{/* Post */}
				<motion.div
					layout
					className={postContainerClass}
					transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
				>
					<Post post={post} toggleComments={toggleComments} />
				</motion.div>

				{/* Comments */}
				<AnimatePresence mode="wait">
					{showComments && (
						<motion.div
							layout
							key="comments"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
							className={clsx("overflow-hidden", {
								"min-w-[60%]": !isPortrait,
								"min-h-[60%]": isPortrait,
							})}
						>
							{post.num_comments > 0 ? (
								<Comments hideComments={toggleComments} />
							) : (
								<div className="flex justify-center items-center h-full">
									<p>No Comments</p>
								</div>
							)}
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</div>
	);
};

export default PostModal;
