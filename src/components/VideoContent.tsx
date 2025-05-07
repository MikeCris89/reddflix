import { useInView } from "react-intersection-observer";
import { VideoPost } from "../features/reddit/redditTypes";
import { ContentMode, MODE } from "../utils/types";
import { useEffect, useRef } from "react";
import ContentBadge from "./ContentBadge";
import { Play } from "lucide-react";
import FullVideoPlayer from "./FullVideoPlayer";

interface VideoProps {
	post: VideoPost;
	mode: ContentMode;
}

const VideoContent = ({ post, mode }: VideoProps) => {
	const videoRef = useRef<HTMLVideoElement | null>(null);
	const { ref, inView } = useInView({
		triggerOnce: false,
		threshold: 0.5,
	});

	useEffect(() => {
		if (!videoRef.current) return;
		const vid = videoRef.current;

		const playPromise = inView ? vid.play() : Promise.resolve();

		playPromise
			.catch(() => {})
			.then(() => {
				if (!inView) vid.pause();
			});
	}, [inView]);

	const src = post.media?.reddit_video.fallback_url || post.url;
	const fullSrc =
		post.media?.reddit_video.hls_url ||
		post.media?.reddit_video.fallback_url ||
		post.url;

	if (!src || !fullSrc) return <p>VIDEO NOT RECOGNIZED {post.id}</p>;

	return (
		<>
			{/* {mode === MODE.full && (
				<div className="w-full h-full">
					<video className="w-full h-full object-contain" controls>
						<source src={src} />
					</video>
				</div>
			)} */}
			{mode === MODE.full && (
				<div className="w-full h-full">
					<FullVideoPlayer url={fullSrc} />
				</div>
			)}
			{mode === MODE.preview && (
				<div ref={ref} className="w-full h-full">
					<ContentBadge badge={<Play size={14} />}>
						<video
							className="w-full h-full object-cover"
							ref={videoRef}
							muted
							loop
							playsInline
						>
							<source src={src} />
						</video>
					</ContentBadge>
				</div>
			)}
		</>
	);
};

export default VideoContent;
