import { SelfPost } from "../features/reddit/redditTypes";

const SelfContent = ({ post }: { post: SelfPost }) => {
	return (
		<div>
			<p>{post.selftext}</p>
		</div>
	);
};

export default SelfContent;
