import { ExternalLink } from "lucide-react";
import { BUBBLE_ICON, MODE } from "../../utils/types";
import PostMedia from "./PostMedia";
import { RedditPost } from "./redditTypes";
import clsx from "clsx";
import InfoBubble from "../../components/InfoBubble";

const Post = ({
	post,
	toggleComments,
	titleAsPost,
}: {
	post: RedditPost;
	toggleComments: () => void;
	titleAsPost: boolean;
}) => {
	console.log("Post Render");
	return (
		<div className={clsx("flex flex-col flex-1 overflow-hidden")}>
			{/* Post */}
			<div
				className={clsx(
					"flex justify-center items-center overflow-hidden px-1 py-2 bg-black rounded-md flex-1"
				)}
			>
				{titleAsPost ? (
					<h1>{post.title}</h1>
				) : (
					<PostMedia post={post} mode={MODE.full} />
				)}
			</div>

			{/* Info Buttons */}
			<div className="flex justify-between items-center w-full gap-10 p-3">
				<div className="flex gap-2">
					<InfoBubble icon={BUBBLE_ICON.score} text={post.score} />
					<InfoBubble
						icon={BUBBLE_ICON.chat}
						text={post.num_comments}
						onClick={toggleComments}
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
		</div>
	);
};

export default Post;
