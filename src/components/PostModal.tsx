import { useNavigate, useParams } from "react-router-dom";
import { useFetchPostsBySubredditQuery } from "../features/reddit/redditApi";
import { useEffect, useRef } from "react";
import Post from "../features/reddit/Post";

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
				className="bg-[#121212] rounded-md max-w-2xl w-full h-full h-full flex flex-col items-center p-3 box-shadow-thin overflow-y-auto overflow-x-hidden"
			>
				<div className="flex justify-end items-center w-full">
					<button onClick={() => navigate(-1)}>x</button>
				</div>

				{/* <div className="flex-1 h-full"> */}
				<Post post={post} />
				{/* </div> */}
			</div>
		</div>
	);
};

export default PostModal;
