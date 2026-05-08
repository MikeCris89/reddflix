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
	const [hasLoaded, setHasLoaded] = useState(false);
	const { ref, inView } = useInView({
		triggerOnce: false,
		threshold: 0.5,
	});

	useEffect(() => {
		if (!isGif || !videoRef.current) return;

		const vid = videoRef.current;

		if (inView && !hasLoaded) {
			setHasLoaded(true);
		}

		// Pause video when not in view
		const timeout = setTimeout(() => {
			const playPromise = inView ? vid.play() : Promise.resolve();
			playPromise
				.catch(() => {
					if (!vidError) setVidError(true);
				})
				.then(() => {
					if (!inView) vid.pause();
				});
		}, 50);

		return () => {
			clearTimeout(timeout);
		};
	}, [inView, hasLoaded, vidError, isGif]);

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
							<>
								{!hasLoaded && (
									<p className="absolute inset-0 flex items-center justify-center text-neutral-400 italic text-sm">
										Loading...
									</p>
								)}
								<video
									ref={videoRef}
									autoPlay
									muted
									loop
									playsInline
									className={clsx(
										"w-full h-full rounded-md",
										isGif && !isPreview ? "object-contain" : "object-cover",
									)}
								>
									{hasLoaded && <source src={src} type="video/mp4" />}
								</video>
							</>
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
