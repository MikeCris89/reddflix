import { useInView } from "react-intersection-observer";
import { GifPost, POST_TYPES, VideoPost } from "../features/reddit/redditTypes";
import { ContentMode, MODE } from "../utils/types";
import { useEffect, useRef, useState } from "react";
import ContentBadge from "./ContentBadge";
import { Play } from "lucide-react";
import FullVideoPlayer from "./FullVideoPlayer";
import clsx from "clsx";
import { getDecodedPreviewImage, getGifMp4Url } from "../utils/helpers";

interface VideoProps {
	post: VideoPost | GifPost;
	mode: ContentMode;
}

const VideoContent = ({ post, mode }: VideoProps) => {
	const [vidError, setVidError] = useState(false);

	const isGif = post.type === POST_TYPES.gif;

	const gifMp4 = isGif ? getGifMp4Url(post) : null;

	const badge = isGif ? "GIF" : <Play size={14} />;
	const isPreview = mode === MODE.preview;
	const videoRef = useRef<HTMLVideoElement | null>(null);
	const { ref, inView } = useInView({
		triggerOnce: false,
		threshold: 0.1,
		rootMargin: "0px 300px 0px 200px",
	});

	useEffect(() => {
		if (!isGif || !videoRef.current) return;

		videoRef.current.play().catch(() => setVidError(true));
	}, [isGif]);

	const fallback = post.url?.endsWith(".gifv")
		? post.url.replace(".gifv", ".mp4")
		: post.url;

	const src = gifMp4 || post.media?.reddit_video?.fallback_url || fallback;

	const fullSrc =
		post.media?.reddit_video?.hls_url ||
		post.media?.reddit_video?.fallback_url ||
		gifMp4 ||
		fallback;

	if (!src || !fullSrc) return <p>VIDEO NOT RECOGNIZED {post.id}</p>;

	const previewImg = getDecodedPreviewImage(post);

	console.log(post.id, inView);

	return (
		<>
			{!isGif && !isPreview && <FullVideoPlayer url={fullSrc} />}

			{(isPreview || isGif) && (
				<div ref={ref} className="w-full h-full">
					<ContentBadge badge={badge}>
						{isPreview && !isGif && previewImg ? (
							<img
								src={previewImg}
								alt={post.title}
								className="w-full h-full object-cover rounded-md"
								loading="lazy"
							/>
						) : !vidError ? (
							inView ? (
								<div className="relative w-full h-full">
									{previewImg && isPreview && (
										<img
											src={previewImg}
											alt={post.title}
											className="absolute inset-0 w-full h-full object-cover rounded-md"
										/>
									)}
									<video
										ref={videoRef}
										autoPlay
										muted
										loop
										playsInline
										preload="none"
										className={clsx(
											"relative w-full h-full rounded-md",

											isGif && !isPreview ? "object-contain" : "object-cover",
										)}
									>
										<source src={src} type="video/mp4" />
									</video>
								</div>
							) : // placeholder while out of view — keeps layout stable
							previewImg ? (
								<img
									src={previewImg ?? ""}
									alt={post.title}
									className="w-full h-full object-cover rounded-md"
									loading="lazy"
								/>
							) : (
								<div className="w-full h-full bg-neutral-900 rounded-md" />
							)
						) : null}
						{vidError &&
							(!isPreview ? (
								<p className="text-red-500 italic text-sm h-full flex justify-center items-center">
									This video is no longer available or has been removed
								</p>
							) : (
								<p className="text-neutral-400 italic text-sm h-full flex justify-center items-center">
									Click to view
								</p>
							))}
					</ContentBadge>
				</div>
			)}
		</>
	);
};

export default VideoContent;
