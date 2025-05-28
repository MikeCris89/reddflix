import Hls from "hls.js";
import { useEffect, useRef, useState } from "react";

const FullVideoPlayer = ({ url }: { url: string }) => {
	const [isPlayable, setIsPlayable] = useState<boolean | null>(null);
	const videoRef = useRef<HTMLVideoElement>(null);

	useEffect(() => {
		const video = videoRef.current;
		if (!video) return;

		if (Hls.isSupported()) {
			const hls = new Hls();
			hls.loadSource(url);
			hls.attachMedia(video);
			hls.on(Hls.Events.ERROR, (event, data) => {
				if (data.fatal) {
					setIsPlayable(false);
					hls.destroy();
				}
			});
			return () => hls.destroy();
		} else {
			// Fallback ONLY for true native support (iOS Safari)
			video.src = url;

			const timeout = setTimeout(() => {
				// If video hasn't started buffering/playing in 2s, assume fail
				if (video.readyState < 2) {
					setIsPlayable(false);
				}
			}, 2000);

			return () => clearTimeout(timeout);
		}
	}, [url]);

	if (isPlayable === false) {
		return (
			<p className="text-red-500 italic text-sm">
				This video is no longer available or has been removed.
			</p>
		);
	}
	return (
		<>
			<video
				onError={() => setIsPlayable(false)}
				ref={videoRef}
				controls
				autoPlay
				disablePictureInPicture
				loop
				className="w-full h-full max-w-full max-h-full object-contain rounded-md aspect-video"
			/>
		</>
	);
};

export default FullVideoPlayer;
