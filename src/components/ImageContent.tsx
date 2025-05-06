import { Image } from "lucide-react";
import { ImagePost } from "../features/reddit/redditTypes";
import { ContentMode, MODE } from "../utils/types";
import ContentBadge from "./ContentBadge";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";

const ImageContent = ({
	post,
	mode,
}: {
	post: ImagePost;
	mode: ContentMode;
}) => {
	return (
		<div className="w-full h-full">
			{mode === MODE.preview && (
				<ContentBadge
					badge={post.url?.endsWith(".gif") ? "GIF" : <Image size={14} />}
				>
					<img src={post.url} className="w-full h-full object-cover" />
				</ContentBadge>
			)}
			{mode === MODE.full && (
				<Zoom>
					<img src={post.url} className="w-full h-full object-cover" />
				</Zoom>
			)}
		</div>
	);
};

export default ImageContent;
