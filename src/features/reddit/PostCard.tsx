import { MODE } from "../../utils/types";
import PostMedia from "./PostMedia";
import { RedditPost } from "./redditTypes";

const PostCard = ({ post }: { post: RedditPost }) => {
	return (
		<>
			<div className="h-full w-60 sm:w-72 md:w-80 rounded-md flex-shrink-0 overflow-hidden bg-[#242424] p-1">
				<p className="font-bold text-sm pb-1">{post.title}</p>
				<PostMedia post={post} mode={MODE.preview} />
			</div>
		</>
	);
};

export default PostCard;
