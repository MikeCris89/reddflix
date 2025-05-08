import { useNavigate, useParams } from "react-router-dom";
import PostMedia from "../features/reddit/PostMedia";
import { MODE } from "../utils/types";
import { useFetchPostsBySubredditQuery } from "../features/reddit/redditApi";
import { useEffect, useRef } from "react";
import Post from "../features/reddit/Post";
import { getCreatedTime } from "../utils/helpers";

const PostModal = () => {
	const navigate = useNavigate();
	const { subreddit, category, postId } = useParams();
	const modalRef = useRef<HTMLDivElement | null>(null);

	const { data: post } = useFetchPostsBySubredditQuery(category, {
		selectFromResult: ({ data }) => {
			return { data: data?.posts.find((posts) => posts.id === postId) };
		},
	});

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

	return (
		<div className="fixed inset-0 z-40 bg-black/90 flex justify-center items-center p-2">
			<div
				ref={modalRef}
				className="bg-[#121212] rounded-md max-w-2xl w-full h-full flex flex-col items-center p-3 box-shadow-thin overflow-hidden"
				//style={{ boxShadow: "0 0 1px #fff" }}
			>
				<div className="flex justify-end items-center w-full">
					<button onClick={() => navigate(-1)}>x</button>
				</div>

				<Post post={post} />
			</div>
		</div>
	);
};

export default PostModal;
