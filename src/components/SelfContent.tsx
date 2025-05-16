import { MessageCircle } from "lucide-react";
import { SelfPost } from "../features/reddit/redditTypes";
import ContentBadge from "./ContentBadge";
import { ContentMode, MODE } from "../utils/types";
import { decodeHtml } from "../utils/helpers";
import HTML from "./HTML";

const SelfContent = ({ post, mode }: { post: SelfPost; mode: ContentMode }) => {
	return (
		<>
			{mode === MODE.preview && (
				<ContentBadge badge={<MessageCircle size={14} />}>
					<div
						className="prose prose-invert max-w-none text-base md:text-lg"
						dangerouslySetInnerHTML={{ __html: decodeHtml(post.selftext_html) }}
					/>
				</ContentBadge>
			)}
			{mode === MODE.full && (
				<div className="h-full overflow-y-auto max-w-[50%]">
					<HTML text={post.selftext_html} />
				</div>
			)}
		</>
	);
};

export default SelfContent;
