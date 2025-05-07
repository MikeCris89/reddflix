import clsx from "clsx";
import { RedditPost } from "../features/reddit/redditTypes";
import PostCard from "../features/reddit/PostCard";
import { useLocation, useNavigate } from "react-router-dom";

interface Props {
	data: RedditPost[];
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
		<div className="flex flex-col">
			<h2 className="text-xl font-semibold">{title}</h2>
			<div
				className={clsx(
					"flex items-center gap-4 p-2 border overflow-x-auto overflow-y-hidden h-[300px]",
					direction === "row" ? "flex-row" : "flex-col"
				)}
			>
				{data &&
					data.map((post) => (
						<div
							key={post.id}
							className="h-full"
							onClick={() =>
								navigate(`${nav ? nav + "/" : ""}${post.id}`, {
									state: { background: location },
								})
							}
						>
							<PostCard post={post} />
						</div>
					))}
			</div>
		</div>
	);
};

export default ScrollContainer;
