import { useEffect, useRef, useState } from "react";
import { GifPost } from "../features/reddit/redditTypes";
import { useInView } from "react-intersection-observer";
import ContentBadge from "./ContentBadge";

const GifContent = ({ post }: { post: GifPost }) => {
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

		const playPromise = inView ? vid.play() : Promise.resolve();

		playPromise
			.catch(() => {})
			.then(() => {
				if (!inView) vid.pause();
			});
	}, [inView, hasLoaded]);

	const src =
		post.media?.reddit_video.fallback_url || post.url?.replace(".gifv", ".mp4");

	return src ? (
		<div ref={ref} className="w-full h-full ">
			{!hasLoaded && <p>Loading...</p>}
			<ContentBadge badge="GIF">
				<video
					ref={videoRef}
					autoPlay
					muted
					loop
					playsInline
					className="w-full h-full object-cover"
				>
					{hasLoaded && <source src={src} type="video/mp4" />}
				</video>
			</ContentBadge>
		</div>
	) : (
		<p>GIF NOT RECOGNIZED {post.id}</p>
	);
};

export default GifContent;
