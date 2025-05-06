import GalleryContent from "../../components/GalleryContent";
import GifContent from "../../components/GifContent";
import ImageContent from "../../components/ImageContent";
import LinkContent from "../../components/LinkContent";
import SelfContent from "../../components/SelfContent";
import VideoContent from "../../components/VideoContent";
import { getPostType } from "../../utils/helpers";
import { ContentMode } from "../../utils/types";
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

interface MediaProps {
	post: RedditPost;
	mode: ContentMode;
}

const PostMedia = ({ post, mode }: MediaProps) => {
	const postType = getPostType(post);
	return (
		<>
			{/* VIDEOS */}
			{isVideoPost(post) && <VideoContent post={post} mode={mode} />}
			{/* GIFs */}
			{isGifPost(post) && <GifContent post={post} />}
			{/* IMAGE */}
			{isImagePost(post) && <ImageContent post={post} mode={mode} />}
			{/* GALLERY */}
			{isGalleryPost(post) && <GalleryContent post={post} mode={mode} />}
			{/* LINK */}
			{isLinkPost(post) && <LinkContent post={post} />}
			{/* SELF */}
			{isSelfPost(post) && <SelfContent post={post} />}
			{/* UNKNOWN - for testing */}
			{postType === POST_TYPES.unknown && <h6>UNKNOWN - ID: {post.id}</h6>}
		</>
	);
};

export default PostMedia;
