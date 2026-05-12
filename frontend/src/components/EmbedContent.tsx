import { ExternalLink } from "lucide-react";
import { EmbedPost } from "../features/reddit/redditTypes";
import ContentBadge from "./ContentBadge";
import { ContentMode, MODE } from "../utils/types";
import clsx from "clsx";

const EmbedContent = ({
	post,
	mode,
}: {
	post: EmbedPost;
	mode: ContentMode;
}) => {
	const linkUrl = post.url_overridden_by_dest || post.url;
	const previewImage =
		post.secure_media?.oembed?.thumbnail_url ||
		post.preview?.images?.[0]?.source?.url?.replace(/&amp;/g, "&");
	const isYouTube = post.secure_media?.oembed?.provider_name
		?.toLowerCase()
		.includes("youtube");

	const Content = () => {
		return (
			<div className="relative w-full h-full">
				{previewImage && (
					<>
						<img
							src={previewImage}
							alt={post.title}
							className="rounded-md w-full h-full object-cover"
						/>
						<div className="absolute inset-0 flex items-center justify-center">
							{isYouTube ? (
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="red"
									className={clsx(
										"opacity-80 relative group-hover:scale-[1.03]",
										mode === MODE.preview ? "w-20 h-20" : "w-28 h-28"
									)}
								>
									<path d="M10 8.64v6.72L15.27 12 10 8.64z" />
									<path
										fillRule="evenodd"
										d="M21.8 7.2c-.2-.75-.78-1.33-1.52-1.52C18.45 5.2 12 5.2 12 5.2s-6.45 0-8.28.48c-.74.2-1.32.77-1.52 1.52C2 9.05 2 12 2 12s0 2.95.2 4.8c.2.75.78 1.33 1.52 1.52C5.55 18.8 12 18.8 12 18.8s6.45 0 8.28-.48c.74-.2 1.32-.77 1.52-1.52.2-1.85.2-4.8.2-4.8s0-2.95-.2-4.8z"
										clipRule="evenodd"
									/>
									<polygon points="10,8.5 10,15.5 16,12" fill="white" />
								</svg>
							) : (
								// <div className="w-16 h-12 bg-red-600 rounded-xl flex items-center justify-center shadow-lg">
								// 	<Play className="text-white w-6 h-6" />
								// </div>
								// <img
								// 	src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/YouTube_play_button_icon_(2013-2017).svg/1024px-YouTube_play_button_icon_(2013-2017).svg.png"
								// 	alt="YouTube Play"
								// 	className="w-12 h-12 opacity-90"
								// />
								<div className="text-white bg-black bg-opacity-50 rounded-full p-2">
									▶
								</div>
							)}
						</div>
					</>
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

	const wrapper = "w-full h-auto flex flex-col justify-center items-center";

	return (
		<ContentBadge badge={<ExternalLink size={14} />}>
			<div
				className={clsx(
					"w-full h-full flex justify-center items-center bg-black p-1 rounded-lg",
					mode === MODE.full && "p-2"
				)}
			>
				{mode === MODE.preview ? (
					<div className={clsx("relative", wrapper)}>
						<Content />
					</div>
				) : (
					<a
						href={linkUrl}
						target="_blank"
						rel="noopener noreferrer"
						className={clsx("group", wrapper)}
					>
						<Content />
					</a>
				)}
			</div>
		</ContentBadge>
	);
};

export default EmbedContent;
