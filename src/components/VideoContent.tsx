import { VideoPost } from "../features/reddit/redditTypes";

const VideoContent = ({ post }: { post: VideoPost }) => {
	return (
		<div>
			<video controls>
				<source src={post.media.reddit_video.fallback_url} />
			</video>
		</div>
	);
};

export default VideoContent;
