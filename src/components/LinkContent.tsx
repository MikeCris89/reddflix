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
			<div className="w-full h-full">
				{previewImage && (
					<img src={previewImage} alt={post.title} className="rounded-md" />
				)}
				{
					<p
						className={clsx(
							"truncate whitespace-nowrap overflow-hidden text-sky-400",
							{
								"text-xs": mode === MODE.preview,
								"p-1 text-base group-hover:text-blue-400 group-hover:underline group-active:text-blue-400 group-active:underline":
									mode === MODE.full,
							}
						)}
					>
						{linkUrl}
					</p>
				}
			</div>
		);
	};

	const wrapper =
		"w-full h-auto flex flex-col justify-center items-center group";

	return (
		<ContentBadge badge={<ExternalLink size={14} />}>
			<div
				className={clsx(
					"w-full h-full flex justify-center items-center bg-black p-1 rounded-lg",
					mode === MODE.full && "p-2"
				)}
			>
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
			</div>
		</ContentBadge>
	);
};

export default LinkContent;
