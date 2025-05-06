import { MessageCircle } from "lucide-react";
import { SelfPost } from "../features/reddit/redditTypes";
import ContentBadge from "./ContentBadge";

const SelfContent = ({ post }: { post: SelfPost }) => {
	return (
		<>
			<ContentBadge badge={<MessageCircle size={14} />}>
				<p className="text-xs">{post.selftext}</p>
			</ContentBadge>
		</>
	);
};

export default SelfContent;
