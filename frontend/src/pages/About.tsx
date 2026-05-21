import { useLocation, useNavigate } from "react-router-dom";
import useDisplay from "../hooks/useDisplay";
import clsx from "clsx";

const About = () => {
	const navigate = useNavigate();
	const { isPortrait } = useDisplay();
	const location = useLocation();
	const state = location.state as { backgroundLocation?: Location };

	console.log(state);

	return (
		<div
			className={clsx("flex flex-col ", {
				"p-2 ": isPortrait,
				"p-4 ": !isPortrait,
			})}
		>
			{/* Header */}
			<div className="flex justify-between items-center pb-3 border-b border-neutral-800">
				<h2 className="text-lg md:text-xl font-semibold text-white">
					About ReddFlix
				</h2>
				<button
					onClick={() => {
						if (state?.backgroundLocation) {
							navigate(-1);
						} else {
							navigate("/");
						}
					}}
					className="text-zinc-400 hover:text-white transition-colors text-xl leading-none px-2"
					aria-label="Close"
				>
					×
				</button>
			</div>

			{/* Content */}
			<div className="flex-1 overflow-y-auto pt-3 text-sm md:text-base text-zinc-300 space-y-3">
				<p>
					<span className="text-[#E50914] font-semibold">Demo Mode:</span> The
					live demo runs with a deliberately low rate limit —{" "}
					<span className="font-semibold">2 requests per 15 seconds</span> — so
					the backend rate limiter and cache are observable in normal use.
					Production tuning would be 10 requests per 60 seconds, matching
					Reddit's actual limit.
				</p>
				<p>
					If you hit a "Retrying in Xs" countdown after a few refreshes, that's
					the limiter working as designed. Wait for the countdown, watch the
					request auto-retry with its reserved slot, and the cache will serve
					the same data instantly for the next 5 minutes.
				</p>
				<p>
					Pre-scraped sample posts and comments are bundled with the app as a
					fallback, so the UI stays usable even if Reddit blocks the proxy
					entirely.
				</p>
			</div>
		</div>
	);
};

export default About;
