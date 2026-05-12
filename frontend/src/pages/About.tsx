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
					<span className="text-[#E50914] font-semibold">Demo Mode:</span>{" "}
					ReddFlix pulls from Reddit's free public JSON API, which is heavily
					rate-limited and prone to blocking. It worked fine during development,
					but Reddit started rejecting requests from the deployed site.
				</p>
				<p>
					To keep the demo usable, ReddFlix loads pre-scraped sample posts and
					comments so you can still try out the features.
				</p>
				<p>
					Next step: a small proxy backend with proper request headers, which
					should restore live data and make the app more resilient to blocks.
				</p>
			</div>
		</div>
	);
};

export default About;
