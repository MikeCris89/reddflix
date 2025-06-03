import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useFetchPostsBySubredditQuery } from "../features/reddit/redditApi";
import { useEffect, useState } from "react";
import Post from "../features/reddit/Post";
import { getCreatedTime } from "../utils/helpers";
import clsx from "clsx";
import Comments from "../features/reddit/Comments";
import useDisplay from "../hooks/useDisplay";
import { isTitleAsPost } from "../features/reddit/redditTypes";
import { AnimatePresence, motion } from "framer-motion";
import NoMatch from "../pages/NoMatch";

const PostModal = ({
	setLayoutSize,
}: {
	setLayoutSize?: (size: "normal" | "wide") => void;
}) => {
	const navigate = useNavigate();
	const { category, postId } = useParams();
	const [showComments, setShowComments] = useState(false);
	const { isPortrait, isMobile } = useDisplay();
	const location = useLocation();
	const state = location.state as { backgroundLocation?: Location };
	const backgroundLocation = state?.backgroundLocation;

	const { data: post } = useFetchPostsBySubredditQuery(category, {
		selectFromResult: ({ data }) => {
			return { data: data?.posts.find((posts) => posts.id === postId) };
		},
	});

	useEffect(() => {
		if (backgroundLocation && setLayoutSize) {
			setLayoutSize(showComments ? "wide" : "normal");
		}
	}, [showComments, backgroundLocation, setLayoutSize]);

	if (!category || !postId) return <NoMatch />;

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

	if (!post) return <p>Post Not Found - {postId}</p>;

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
