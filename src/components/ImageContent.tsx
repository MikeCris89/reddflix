import { Image } from "lucide-react";
import { ImagePost } from "../features/reddit/redditTypes";
import { ContentMode, MODE } from "../utils/types";
import ContentBadge from "./ContentBadge";
import { getDecodedPreviewImage } from "../utils/helpers";

const ImageContent = ({
	post,
	mode,
}: {
	post: ImagePost;
	mode: ContentMode;
}) => {
	const previewImg = getDecodedPreviewImage(post);

	const isGif = post.url?.endsWith(".gif");

	return (
		<>
			{mode === MODE.preview && (
				<ContentBadge badge={isGif ? "GIF" : <Image size={14} />}>
					<img
						src={isGif ? post.url : (previewImg ?? post.url)}
						className="w-full h-full object-cover rounded-md"
						alt="Reddit Image"
						loading="lazy"
					/>
				</ContentBadge>
			)}
			{mode === MODE.full && (
				<img
					src={post.url}
					alt="Reddit Image"
					className="w-auto max-w-full h-auto max-h-full object-contain rounded-md"
				/>
			)}
		</>
	);
};

export default ImageContent;
