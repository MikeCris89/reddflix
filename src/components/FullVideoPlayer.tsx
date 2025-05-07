import Hls from "hls.js";
import { useEffect, useRef } from "react";

const FullVideoPlayer = ({ url }: { url: string }) => {
	const videoRef = useRef<HTMLVideoElement | null>(null);
	useEffect(() => {
		const video = videoRef.current;
		if (!video) return;

		// For Safari browsers, can play hls natively
		if (video.canPlayType("application/vnd.apple.mpegurl")) {
			video.src = url;
		} else if (Hls.isSupported()) {
			const hls = new Hls();
			hls.loadSource(url);
			hls.attachMedia(video);
			return () => {
				hls.destroy();
			};
		}
	}, [url]);

	return (
		<video
			ref={videoRef}
			autoPlay
			controls
			className="w-full h-full object-contain"
		/>
	);
};

export default FullVideoPlayer;
