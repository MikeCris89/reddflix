import { useNavigate, useParams } from "react-router-dom";
import PostMedia from "../features/reddit/PostMedia";
import { MODE } from "../utils/types";
import { useFetchPostsBySubredditQuery } from "../features/reddit/redditApi";
import { useEffect, useRef } from "react";

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
		<div className="fixed inset-0 z-40 bg-black/60 flex justify-center items-center h-full overflow-hidden">
			<div
				ref={modalRef}
				className="flex flex-col justify-center items-center bg-black rounded-md max-w-3xl w-full h-[90%]"
				style={{ boxShadow: "0 0 8px 1px #fff" }}
			>
				<button
					onClick={() => navigate(-1)}
					className="self-end text-white bg-black bg-opacity-70 rounded px-2 py-1 hover:bg-opacity-90"
				>
					X
				</button>
				<div className="flex-1 h-full overflow-hidden">
					<PostMedia post={post} mode={MODE.full} />
				</div>
			</div>
		</div>
	);
};

export default PostModal;
