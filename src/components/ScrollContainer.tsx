import clsx from "clsx";
import { RedditPost } from "../features/reddit/redditTypes";
import PostCard from "../features/reddit/PostCard";
import { useLocation, useNavigate } from "react-router-dom";

interface Props {
	data: RedditPost[] | undefined;
	title: string;
	direction?: "row" | "col";
	category?: string;
	subreddit?: string;
}

const ScrollContainer = ({
	data,
	title,
	direction = "row",
	category,
	subreddit,
}: Props) => {
	const navigate = useNavigate();
	const location = useLocation();
	const nav = category || subreddit;
	return (
		<div className="flex flex-col p-1">
			<h2 className="text-xl font-extrabold bg-red-600 text-black p-1 pl-2">
				{title}
			</h2>
			<div
				className={clsx(
					"flex items-center gap-4 p-2 overflow-x-auto overflow-y-hidden ",
					direction === "row" ? "flex-row" : "flex-col"
				)}
			>
				{data &&
					data.map((post) => (
						<div
							key={post.id}
							className="h-full"
							onClick={() =>
								navigate(`/${nav ? nav + "/" : ""}${post.id}`, {
									state: { backgroundLocation: location },
								})
							}
						>
							<PostCard post={post} />
						</div>
					))}
				{!data && <p>No Data</p>}
			</div>
		</div>
	);
};

export default ScrollContainer;
