import clsx from "clsx";
import { RedditPost } from "../features/reddit/redditTypes";
import PostCard from "../features/reddit/PostCard";

interface Props {
	data: RedditPost[];
	direction?: "row" | "col";
	title: string;
}

const ScrollContainer = ({ data, direction = "row", title }: Props) => {
	return (
		<div className="flex flex-col">
			<h2 className="text-xl font-semibold">{title}</h2>
			<div
				className={clsx(
					"flex items-center gap-4 p-2 border overflow-x-auto overflow-y-hidden h-[300px]",
					direction === "row" ? "flex-row" : "flex-col"
				)}
			>
				{data && data.map((post) => <PostCard key={post.id} post={post} />)}
			</div>
		</div>
	);
};

export default ScrollContainer;
