import GalleryContent from "../../components/GalleryContent";
import GifContent from "../../components/GifContent";
import ImageContent from "../../components/ImageContent";
import LinkContent from "../../components/LinkContent";
import SelfContent from "../../components/SelfContent";
import VideoContent from "../../components/VideoContent";
import { ContentMode } from "../../utils/types";
import {
	GalleryPost,
	GifPost,
	ImagePost,
	LinkPost,
	POST_TYPES,
	RedditPost,
	SelfPost,
	VideoPost,
} from "./redditTypes";

interface MediaProps {
	post: RedditPost;
	mode: ContentMode;
}

const PostMedia = ({ post, mode }: MediaProps) => {
	return (
		<>
			{/* VIDEOS */}
			{post.type === POST_TYPES.video && (
				<VideoContent post={post as VideoPost} mode={mode} />
			)}
			{/* GIFs */}
			{post.type === POST_TYPES.gif && (
				<VideoContent post={post as GifPost} mode={mode} />
			)}
			{/* IMAGE */}
			{post.type === POST_TYPES.image && (
				<ImageContent post={post as ImagePost} mode={mode} />
			)}
			{/* GALLERY */}
			{post.type === POST_TYPES.gallery && (
				<GalleryContent post={post as GalleryPost} mode={mode} />
			)}
			{/* LINK */}
			{post.type === POST_TYPES.link && <LinkContent post={post as LinkPost} />}
			{/* SELF */}
			{post.type === POST_TYPES.self && (
				<SelfContent post={post as SelfPost} mode={mode} />
			)}
			{/* UNKNOWN - for testing */}
			{post.type === POST_TYPES.unknown && <h6>UNKNOWN - ID: {post.id}</h6>}
		</>
	);
};

export default PostMedia;
