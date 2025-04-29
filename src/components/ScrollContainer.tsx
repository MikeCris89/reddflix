import Post from "../features/reddit/Post";
import { RedditPost } from "../features/reddit/redditTypes";

interface Props {
	data: RedditPost[];
}

const ScrollContainer = ({ data }: Props) => {
	return (
		<div>{data && data.map((post) => <Post key={post.id} post={post} />)}</div>
	);
};

export default ScrollContainer;
