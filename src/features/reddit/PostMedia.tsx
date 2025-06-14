import EmbedContent from "../../components/EmbedContent";
import GalleryContent from "../../components/GalleryContent";
import ImageContent from "../../components/ImageContent";
import LinkContent from "../../components/LinkContent";
import SelfContent from "../../components/SelfContent";
import VideoContent from "../../components/VideoContent";
import { getPostType } from "../../utils/helpers";
import { ContentMode } from "../../utils/types";
import {
	EmbedPost,
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
	let type = post.type;
	if (post.type === POST_TYPES.unknown) {
		type = getPostType(post);
	}

	return (
		<>
			{/* VIDEOS */}
			{type === POST_TYPES.video && (
				<VideoContent post={post as VideoPost} mode={mode} />
			)}
			{/* OEMBED */}
			{type === POST_TYPES.embed && (
				<EmbedContent post={post as EmbedPost} mode={mode} />
			)}
			{/* GIFs */}
			{type === POST_TYPES.gif && (
				<VideoContent post={post as GifPost} mode={mode} />
			)}
			{/* IMAGE */}
			{type === POST_TYPES.image && (
				<ImageContent post={post as ImagePost} mode={mode} />
			)}
			{/* GALLERY */}
			{type === POST_TYPES.gallery && (
				<GalleryContent post={post as GalleryPost} mode={mode} />
			)}
			{/* LINK */}
			{type === POST_TYPES.link && (
				<LinkContent post={post as LinkPost} mode={mode} />
			)}
			{/* SELF */}
			{type === POST_TYPES.self && (
				<SelfContent post={post as SelfPost} mode={mode} />
			)}
			{/* UNKNOWN - for testing */}
			{type === POST_TYPES.unknown && <h6>UNKNOWN - ID: {post.id}</h6>}
		</>
	);
};

export default PostMedia;
