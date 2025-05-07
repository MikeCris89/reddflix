import { MODE } from "../../utils/types";
import PostMedia from "./PostMedia";
import { RedditPost } from "./redditTypes";

const PostCard = ({ post }: { post: RedditPost }) => {
	return (
		<>
			<p>{post.title}</p>
			<div className="h-60 w-60 sm:w-72 md:w-80 flex-shrink-0 overflow-hidden bg-black">
				<PostMedia post={post} mode={MODE.preview} />
			</div>
		</>
	);
};

export default PostCard;
