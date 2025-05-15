import { Image } from "lucide-react";
import { ImagePost } from "../features/reddit/redditTypes";
import { ContentMode, MODE } from "../utils/types";
import ContentBadge from "./ContentBadge";

const ImageContent = ({
	post,
	mode,
}: {
	post: ImagePost;
	mode: ContentMode;
}) => {
	return (
		<>
			{mode === MODE.preview && (
				<ContentBadge
					badge={post.url?.endsWith(".gif") ? "GIFI" : <Image size={14} />}
				>
					<img
						src={post.url}
						className="w-full h-full object-cover"
						loading="lazy"
					/>
				</ContentBadge>
			)}
			{mode === MODE.full && (
				<img
					src={post.url}
					className="w-auto max-w-full h-auto max-h-full object-contain rounded-md"
				/>
			)}
		</>
	);
};

export default ImageContent;
