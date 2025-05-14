import { useNavigate, useParams } from "react-router-dom";
import { useFetchPostsBySubredditQuery } from "../features/reddit/redditApi";
import { useEffect, useRef, useState } from "react";
import Post from "../features/reddit/Post";
import { getCreatedTime } from "../utils/helpers";
import clsx from "clsx";
import Comments from "../features/reddit/Comments";
import useDisplay from "../hooks/useDisplay";

const PostModal = () => {
	const navigate = useNavigate();
	const { subreddit, category, postId } = useParams();
	const [showComments, setShowComments] = useState(false);
	const modalRef = useRef<HTMLDivElement | null>(null);
	const { isPortrait } = useDisplay();

	const { data: post } = useFetchPostsBySubredditQuery(category, {
		selectFromResult: ({ data }) => {
			return { data: data?.posts.find((posts) => posts.id === postId) };
		},
	});

	useEffect(() => {
		// Pause preview videos when modal is open
		const videos = document.querySelectorAll("video");
		videos.forEach((vid) => {
			// Skip videos inside the modal
			if (!modalRef.current?.contains(vid)) {
				vid.pause();
			}
		});
	}, []);

	useEffect(() => {
		const clickEvent = (e: MouseEvent) => {
			if (modalRef.current && !modalRef.current.contains(e.target as Node))
				navigate(-1);
		};
		document.addEventListener("mousedown", clickEvent);

		return () => {
			document.removeEventListener("mousedown", clickEvent);
		};
	}, [navigate]);

	if (!post) return <p>Post Not Found - {postId}</p>;

	console.log("PostModal Render");

	return (
		<div className="fixed inset-0 z-40 bg-black/90 flex justify-center items-center p-2">
			<div
				ref={modalRef}
				className="flex flex-col h-full bg-[#121212] rounded-md p-3 box-shadow-thin overflow-hidden min-w-full lg:min-w-[900px]"
			>
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
				<div className="flex flex-1 overflow-hidden flex-col md:flex-row gap-2">
					{/* Left/Top: Post + Button */}
					<div className="flex flex-col overflow-hidden flex-1 min-h-[40%] min-w-[40%] ">
						<Post post={post} />
						<button
							className="w-full"
							onClick={() => setShowComments((prev) => !prev)}
						>
							{showComments ? "Hide Comments" : "Show Comments"}
						</button>
					</div>
					{/* Right/Bottom: Comments */}
					{showComments && (
						<div
							className={clsx(
								"overflow-y-auto overflow-x-hidden w-full md:min-w-[300px] max-h-full my-4"
							)}
						>
							<Comments />
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default PostModal;
