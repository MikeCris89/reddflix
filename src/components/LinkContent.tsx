import { ExternalLink } from "lucide-react";
import { LinkPost } from "../features/reddit/redditTypes";
import ContentBadge from "./ContentBadge";

const LinkContent = ({ post }: { post: LinkPost }) => {
	const linkUrl = post.url_overridden_by_dest || post.url;
	const previewImage =
		post.preview?.images?.[0]?.source?.url?.replace(/&amp;/g, "&") ||
		(post.thumbnail && post.thumbnail.startsWith("http")
			? post.thumbnail
			: null);

	return (
		<>
			<ContentBadge badge={<ExternalLink size={14} />}>
				<a
					href={linkUrl}
					target="_blank"
					rel="noopener noreferrer"
					className="w-full h-full flex flex-col justify-center align-middle"
				>
					{previewImage && <img src={previewImage} alt={post.title} />}
				</a>

				{post.selftext && <p>{post.selftext}</p>}
			</ContentBadge>
		</>
	);
};

export default LinkContent;
