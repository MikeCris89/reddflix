import { MODE } from "../../utils/types";
import PostMedia from "./PostMedia";
import { RedditPost } from "./redditTypes";

const Post = ({ post }: { post: RedditPost }) => {
	return (
		<div>
			<h6>/r/{post.subreddit}</h6>
			<h5>{post.title}</h5>
			<PostMedia post={post} mode={MODE.full} />
		</div>
	);
};

export default Post;
