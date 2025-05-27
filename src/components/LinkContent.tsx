import { ExternalLink } from "lucide-react";
import { LinkPost } from "../features/reddit/redditTypes";
import ContentBadge from "./ContentBadge";
import { ContentMode, MODE } from "../utils/types";
import clsx from "clsx";

const LinkContent = ({ post, mode }: { post: LinkPost; mode: ContentMode }) => {
	const linkUrl = post.url_overridden_by_dest || post.url;
	const previewImage =
		post.preview?.images?.[0]?.source?.url?.replace(/&amp;/g, "&") ||
		(post.thumbnail && post.thumbnail.startsWith("http")
			? post.thumbnail
			: null);

	const Content = () => {
		return (
			<>
				{previewImage && <img src={previewImage} alt={post.title} />}
				{
					<p
						className={clsx("break-words text-sky-400", {
							"hover:text-blue-400 hover:underline": mode === MODE.full,
						})}
					>
						{linkUrl}
					</p>
				}
			</>
		);
	};

	const wrapper = "w-full h-full flex flex-col justify-center";

	return (
		<>
			<ContentBadge badge={<ExternalLink size={14} />}>
				{mode === MODE.preview ? (
					<div className={wrapper}>
						<Content />
					</div>
				) : (
					<a
						href={linkUrl}
						target="_blank"
						rel="noopener noreferrer"
						className={wrapper}
					>
						<Content />
					</a>
				)}
			</ContentBadge>
		</>
	);
};

export default LinkContent;
