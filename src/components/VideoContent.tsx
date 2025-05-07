import { useInView } from "react-intersection-observer";
import { GifPost, POST_TYPES, VideoPost } from "../features/reddit/redditTypes";
import { ContentMode, MODE } from "../utils/types";
import { useEffect, useRef, useState } from "react";
import ContentBadge from "./ContentBadge";
import { Play } from "lucide-react";
import FullVideoPlayer from "./FullVideoPlayer";
import clsx from "clsx";

interface VideoProps {
	post: VideoPost | GifPost;
	mode: ContentMode;
}

const VideoContent = ({ post, mode }: VideoProps) => {
	const isGif = post.type === POST_TYPES.gif;
	const badge = isGif ? "GIF" : <Play size={14} />;
	const isPreview = mode === MODE.preview;
	const videoRef = useRef<HTMLVideoElement | null>(null);
	const [hasLoaded, setHasLoaded] = useState(false);
	const { ref, inView } = useInView({
		triggerOnce: false,
		threshold: 0.5,
	});

	useEffect(() => {
		if (!videoRef.current) return;
		const vid = videoRef.current;

		if (inView && !hasLoaded) {
			setHasLoaded(true);
		}

		const timeout = setTimeout(() => {
			const playPromise = inView ? vid.play() : Promise.resolve();
			playPromise
				.catch(() => {})
				.then(() => {
					if (!inView) vid.pause();
				});
		}, 50);

		return () => clearTimeout(timeout);
	}, [inView, hasLoaded]);

	const fallback = post.url?.endsWith(".gifv")
		? post.url.replace(".gifv", ".mp4")
		: post.url;
	const src = post.media?.reddit_video.fallback_url || fallback;
	const fullSrc =
		post.media?.reddit_video.hls_url ||
		post.media?.reddit_video.fallback_url ||
		fallback;

	if (!src || !fullSrc) return <p>VIDEO NOT RECOGNIZED {post.id}</p>;

	return (
		<>
			{!isGif && !isPreview && (
				<div className="w-full h-full">
					<FullVideoPlayer url={fullSrc} />
				</div>
			)}

			{/* {!isGif && isPreview && (
				<div ref={ref} className="w-full h-full">
					{!hasLoaded && <p>Loading...</p>}
					<ContentBadge badge={<Play size={14} />}>
						<video
							className="w-full h-full object-cover"
							ref={videoRef}
							muted
							loop
							playsInline
						>
							{hasLoaded && <source src={src} type="video/mp4" />}
						</video>
					</ContentBadge>
				</div>
			)}
			{isGif && (
				<div ref={ref} className="w-full h-full ">
					{!hasLoaded && <p>Loading...</p>}
					<ContentBadge badge="GIF">
						<video
							ref={videoRef}
							autoPlay
							muted
							loop
							playsInline
							className={clsx(
								"w-full h-full",
								mode === MODE.preview ? "object-cover" : "object-contain"
							)}
						>
							{hasLoaded && <source src={src} type="video/mp4" />}
						</video>
					</ContentBadge>
				</div>
			)} */}

			{(isPreview || isGif) && (
				<div ref={ref} className="w-full h-full">
					{!hasLoaded && <p>Loading...</p>}
					<ContentBadge badge={badge}>
						<video
							ref={videoRef}
							autoPlay
							muted
							loop
							playsInline
							className={clsx(
								"w-full h-full",
								isGif && !isPreview ? "object-contain" : "object-cover"
							)}
						>
							{hasLoaded && <source src={src} type="video/mp4" />}
						</video>
					</ContentBadge>
				</div>
			)}
		</>
	);
};

export default VideoContent;
