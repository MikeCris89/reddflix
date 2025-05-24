import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useFetchPostsBySubredditQuery } from "../features/reddit/redditApi";
import { useState } from "react";
import Post from "../features/reddit/Post";
import { getCreatedTime } from "../utils/helpers";
import clsx from "clsx";
import Comments from "../features/reddit/Comments";
import useDisplay from "../hooks/useDisplay";
import { isSelfPost } from "../features/reddit/redditTypes";

const PostModal = () => {
	const navigate = useNavigate();
	const { category, postId } = useParams();
	const [showComments, setShowComments] = useState(false);
	const { isPortrait } = useDisplay();
	const location = useLocation();
	const state = location.state as { backgroundLocation?: Location };
	const backgroundLocation = state?.backgroundLocation;

	const toggleComments = () => {
		setShowComments((prev) => !prev);
	};

	const { data: post } = useFetchPostsBySubredditQuery(category, {
		selectFromResult: ({ data }) => {
			return { data: data?.posts.find((posts) => posts.id === postId) };
		},
	});

	if (!post) return <p>Post Not Found - {postId}</p>;

	const titleAsPost = isSelfPost(post) && !post.selftext_html;

	console.log("PostModal Render");

	return (
		<>
			{/* Header - r/ u/ close btn */}
			<div className="flex justify-between items-center w-full p-1">
				<div>
					<p className="text-sm">r/{post.subreddit}</p>
					<div className="flex justify-start items-center gap-1">
						<p className="text-xs">u/{post.author}</p>
						<p>&#8226;</p>
						<p className="text-xs">{getCreatedTime(post.created_utc)}</p>
					</div>
				</div>
				{backgroundLocation && <button onClick={() => navigate(-1)}>x</button>}
			</div>
			{/* Title */}
			{!titleAsPost && (
				<div className="w-full pl-1">
					<h2 className="text-lg font-semibold">{post.title}</h2>
				</div>
			)}
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
					<Post titleAsPost={titleAsPost} post={post} toggleComments={toggleComments} />
				</div>
				{!isSelfPost(post) && <div className="">{post.selftext}</div>}

				{/* Right/Bottom: Comments */}
				{showComments && post.num_comments > 0 && (
					<div className={clsx("flex-1 min-h-0 w-full h-full")}>
						<Comments hideComments={toggleComments} />
					</div>
				)}
				{showComments && post.num_comments === 0 && (
					<div className=" text-center flex-1 my-10 max-h-[75px]">
						<p className="text-lg w-full text-center">No Comments</p>
					</div>
				)}
			</div>
		</>
	);
};

export default PostModal;
