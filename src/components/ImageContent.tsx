import { ImagePost } from "../features/reddit/redditTypes";

const ImageContent = ({ post }: { post: ImagePost }) => {
	return (
		<div>
			<img src={post.url} />
		</div>
	);
};

export default ImageContent;
