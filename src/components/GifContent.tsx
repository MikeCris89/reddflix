import { GifPost } from "../features/reddit/redditTypes";

const GifContent = ({ post }: { post: GifPost }) => {
	return (
		<div>
			<video autoPlay muted loop playsInline>
				<source src={post.media.reddit_video.fallback_url} />
			</video>
		</div>
	);
};

export default GifContent;
