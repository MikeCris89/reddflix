import { MessageCircle } from "lucide-react";
import { SelfPost } from "../features/reddit/redditTypes";
import ContentBadge from "./ContentBadge";
import { ContentMode, MODE } from "../utils/types";
import HTML from "./HTML";

const SelfContent = ({ post, mode }: { post: SelfPost; mode: ContentMode }) => {
	return (
		<>
			{mode === MODE.preview && (
				<div className="h-full overflow-hidden bg-black rounded-md">
					<ContentBadge badge={<MessageCircle size={14} />}>
						<HTML text={post.selftext_html} />
					</ContentBadge>
				</div>
			)}
			{mode === MODE.full && (
				<div className="h-full flex justify-center items-center overflow-y-auto w-auto">
					<HTML text={post.selftext_html} />
				</div>
			)}
		</>
	);
};

export default SelfContent;
