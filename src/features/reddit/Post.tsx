import { ExternalLink } from "lucide-react";
import { BUBBLE_ICON, MODE } from "../../utils/types";
import PostMedia from "./PostMedia";
import { RedditPost } from "./redditTypes";
import clsx from "clsx";
import Comments from "./Comments";
import { useState } from "react";
import InfoBubble from "../../components/InfoBubble";
import useDisplay from "../../hooks/useDisplay";

const Post = ({ post }: { post: RedditPost }) => {
	const [showComments, setShowComments] = useState(false);
	const { isPortrait } = useDisplay();

	return (
		<div className={clsx("flex flex-col flex-1 overflow-hidden")}>
			{/* Post Content */}
			{/* <div
				className={clsx(
					"flex flex-col my-3 w-full"
					// isPortrait
					// 	? showComments
					// 		? "min-h-[40%] flex-1"
					// 		: "min-h-[40%] w-full flex-1"
					// 	: "flex-1 min-w-[600px]"
				)}
			> */}
			{/* Title */}
			<div className="w-full pl-1">
				<h2 className="text-lg font-semibold">{post.title}</h2>
			</div>

			{/* Post */}
			<div
				className={clsx(
					"flex justify-center items-center overflow-hidden px-1 py-2 bg-black rounded-md flex-1"
				)}
			>
				<PostMedia post={post} mode={MODE.full} />
			</div>

			{/* Info Buttons */}
			<div className="flex justify-between items-center w-full gap-10 p-3">
				<div className="flex gap-2">
					<InfoBubble icon={BUBBLE_ICON.score} text={post.score} />
					<InfoBubble
						icon={BUBBLE_ICON.chat}
						text={post.num_comments}
						onClick={() => setShowComments((prev) => !prev)}
					/>
					<InfoBubble icon={BUBBLE_ICON.share} />
				</div>
				<a
					className="flex items-center gap-2"
					href={`https://www.reddit.com${post.permalink}`}
					target="_blank"
					rel="noopener noreferrer"
				>
					<ExternalLink size={20} />
					<p className="text-xs">Reddit</p>
				</a>
			</div>
			{/* </div> */}
			{/* {showComments && (
				<div
					className={clsx(
						"overflow-y-auto overflow-x-hidden min-w-[250px] ",
						isPortrait ? "" : "max-w-[600px]"
					)}
				>
					<Comments />
				</div>
			)} */}
		</div>
	);
};

export default Post;
