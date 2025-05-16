import { useNavigate, useParams } from "react-router-dom";
import { useFetchPostsBySubredditQuery } from "../features/reddit/redditApi";
import { useState } from "react";
import Post from "../features/reddit/Post";
import { decodeHtml, getCreatedTime } from "../utils/helpers";
import clsx from "clsx";
import Comments from "../features/reddit/Comments";
import useDisplay from "../hooks/useDisplay";

const PostModal = () => {
	const navigate = useNavigate();
	const { subreddit, category, postId } = useParams();
	const [showComments, setShowComments] = useState(false);
	const { isPortrait } = useDisplay();

	const { data: post } = useFetchPostsBySubredditQuery(category, {
		selectFromResult: ({ data }) => {
			return { data: data?.posts.find((posts) => posts.id === postId) };
		},
	});

	if (!post) return <p>Post Not Found - {postId}</p>;

	const selfText = decodeHtml(post.selftext_html);

	console.log("PostModal Render");
	console.log("SelfText", selfText);

	return (
		<>
			{/* Header - r/ u/ close btn */}
			<div className="flex justify-between items-center w-full">
				<div>
					<p className="text-sm">r/{post.subreddit}</p>
					<div className="flex justify-start items-center gap-1">
						<p className="text-xs">u/{post.author}</p>
						<p>&#8226;</p>
						<p className="text-xs">{getCreatedTime(post.created_utc)}</p>
					</div>
				</div>
				<button onClick={() => navigate(-1)}>x</button>
			</div>
			{/* Main content: Post + Comments layout */}
			<div
				className={clsx(
					"flex flex-1 overflow-hidden flex-col md:flex-row gap-2"
				)}
			>
				{/* Left/Top: Post + Button */}
				<div
					className={clsx("flex flex-col overflow-hidden flex-1 min-h-[40%] ", {
						"max-w-[40%]": !isPortrait && showComments,
					})}
				>
					<Post post={post} />
					<button
						className="w-full"
						onClick={() => setShowComments((prev) => !prev)}
					>
						{showComments ? "Hide Comments" : "Show Comments"}
					</button>
				</div>
				<div className="">{post.selftext}</div>
				{/* Right/Bottom: Comments */}
				{showComments && (
					<div className={clsx("flex-1 min-h-0 w-full")}>
						<Comments />
					</div>
				)}
			</div>
		</>
	);
};

export default PostModal;
