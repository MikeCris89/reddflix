import { MessageCircle } from "lucide-react";
import { SelfPost } from "../features/reddit/redditTypes";
import ContentBadge from "./ContentBadge";
import { ContentMode, MODE } from "../utils/types";

const SelfContent = ({ post, mode }: { post: SelfPost; mode: ContentMode }) => {
	return (
		<>
			{mode === MODE.preview && (
				<ContentBadge badge={<MessageCircle size={14} />}>
					<p className="text-xs">{post.selftext}</p>
				</ContentBadge>
			)}
			{mode === MODE.full && (
				<div className="h-full w-full overflow-y-auto">
					<p className="text-lg">{post.selftext}</p>
				</div>
			)}
		</>
	);
};

export default SelfContent;
