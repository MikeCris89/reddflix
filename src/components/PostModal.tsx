import { useNavigate, useParams } from "react-router-dom";
import PostMedia from "../features/reddit/PostMedia";
import { MODE } from "../utils/types";
import { useFetchPostsBySubredditQuery } from "../features/reddit/redditApi";
import { useEffect, useRef } from "react";

const Info = ({ children }: { children: React.ReactNode }) => {
	return <div className="rounded-3xl bg-neutral-600 px-3 py-1">{children}</div>;
};

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
		<div className="fixed inset-0 z-40 bg-black/60 flex justify-center items-center">
			<div
				ref={modalRef}
				className="bg-neutral-800 rounded-md max-w-3xl w-full max-h-[90%] h-full flex flex-col items-center p-2"
				style={{ boxShadow: "0 0 8px 1px #fff" }}
			>
				<div className="flex justify-between items-center w-full p-2 pl-10">
					<h6 className="text-xl">r/{post.subreddit}</h6>
					<button
						onClick={() => navigate(-1)}
						className="self-end text-white bg-black bg-opacity-70 rounded px-2 py-1 hover:bg-opacity-90"
					>
						X
					</button>
				</div>
				<h2 className="text-2xl font-bold">{post.title}</h2>
				<div className="flex-1 w-full flex justify-center items-center overflow-hidden py-3 px-2">
					<PostMedia post={post} mode={MODE.full} />
				</div>
				<div className="flex">
					<Info>
						<div>{post.score}</div>
					</Info>
					<Info>
						<div>{post.num_comments}</div>
					</Info>
				</div>
			</div>
		</div>
	);
};

export default PostModal;
