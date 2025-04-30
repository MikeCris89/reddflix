import GalleryContent from "../../components/GalleryContent";
import GifContent from "../../components/GifContent";
import ImageContent from "../../components/ImageContent";
import LinkContent from "../../components/LinkContent";
import SelfContent from "../../components/SelfContent";
import VideoContent from "../../components/VideoContent";
import { getPostType } from "../../utils/helpers";
import {
	isGalleryPost,
	isGifPost,
	isImagePost,
	isLinkPost,
	isSelfPost,
	isVideoPost,
	POST_TYPES,
	RedditPost,
} from "./redditTypes";

const Post = ({ post }: { post: RedditPost }) => {
	const postType = getPostType(post);

	return (
		<div>
			<h6>/r/{post.subreddit}</h6>
			<h5>{post.title}</h5>
			{/* VIDEOS */}
			{isVideoPost(post) && <VideoContent post={post} />}
			{/* GIFs */}
			{isGifPost(post) && <GifContent post={post} />}
			{/* IMAGE */}
			{isImagePost(post) && <ImageContent post={post} />}
			{/* GALLERY */}
			{isGalleryPost(post) && <GalleryContent post={post} />}
			{/* LINK */}
			{isLinkPost(post) && <LinkContent post={post} />}
			{/* SELF */}
			{isSelfPost(post) && <SelfContent post={post} />}
			{/* UNKNOWN - for testing */}
			{postType === POST_TYPES.unknown && <h6>UNKNOWN - ID: {post.id}</h6>}
		</div>
	);
};

export default Post;
