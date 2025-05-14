import Hls from "hls.js";
import { useEffect, useRef } from "react";

const FullVideoPlayer = ({ url }: { url: string }) => {
	const videoRef = useRef<HTMLVideoElement>(null);
	useEffect(() => {
		const video = videoRef.current;
		if (!video) return;

		// For Safari browsers, can play hls natively
		if (Hls.isSupported()) {
			const hls = new Hls();
			hls.loadSource(url);
			hls.attachMedia(video);
			return () => hls.destroy();
		} else {
			// Fallback ONLY for true native support (iOS Safari)
			video.src = url;
		}
	}, [url]);

	return (
		<video
			ref={videoRef}
			controls
			autoPlay
			disablePictureInPicture
			loop
			className="max-h-full max-w-full h-full w-full object-contain"
		/>
	);
};

export default FullVideoPlayer;
