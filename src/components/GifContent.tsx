import { useEffect, useRef } from "react";
import { GifPost } from "../features/reddit/redditTypes";
import { useInView } from "react-intersection-observer";
import ContentBadge from "./ContentBadge";

const GifContent = ({ post }: { post: GifPost }) => {
	const videoRef = useRef<HTMLVideoElement | null>(null);
	const { ref, inView } = useInView({
		triggerOnce: false,
		threshold: 1,
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

	const getGifvAsMp4 = (url?: string) =>
		url?.endsWith(".gifv") ? url.replace(".gifv", ".mp4") : url;

	const source =
		post.media?.reddit_video?.fallback_url || getGifvAsMp4(post.url);

	return source ? (
		<div ref={ref} className="w-full h-full ">
			<ContentBadge badge="GIF">
				<video
					ref={videoRef}
					autoPlay
					muted
					loop
					playsInline
					className="w-full h-full object-contain"
				>
					<source src={source} type="video/mp4" />
				</video>
			</ContentBadge>
		</div>
	) : (
		<p>GIF NOT RECOGNIZED</p>
	);
};

export default GifContent;
