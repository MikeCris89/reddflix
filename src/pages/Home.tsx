import ScrollContainer from "../components/ScrollContainer";
import clsx from "clsx";
import { store } from "../app/store";
import { MinusCircle } from "lucide-react";
import { useFetchSubredditsQuery } from "../features/localApp/localAppApi";

declare global {
	interface Window {
		store?: typeof store;
	}
}

const Home = () => {
	const { data: subreddits } = useFetchSubredditsQuery();

	console.log(subreddits);

	return (
		<div className={clsx("flex-1 w-full relative overflow-y-auto")}>
			{subreddits &&
				subreddits
					.filter((s) => s.active)
					.map((sub, i) => {
						if (sub.title !== "Funny") return null;
						return (
							<ScrollContainer key={`${sub.title}-${i}`} subreddit={sub} />
						);
					})}
		</div>
	);
};

export default Home;

// Test Component for sticky icon on scrollable container
function StickyTest() {
	return (
		<div className="h-screen p-4 overflow-auto bg-black text-white">
			{/* Mimic the comment thread container */}
			<div className="flex gap-4 min-h-[1200px]">
				{/* Sticky Collapse Bar */}
				<div className="relative w-8 bg-neutral-900">
					<div className="absolute top-0 bottom-0 left-1/2 w-px bg-cyan-800/40" />
					<div className="sticky top-[50%] z-10 flex flex-col items-center text-cyan-300">
						<div className="h-4 w-0.5 bg-current" />
						<MinusCircle size={20} />
						<div className="h-4 w-0.5 bg-current" />
					</div>
				</div>

				{/* Fake recursive comment content */}
				<div className="flex-1 space-y-8">
					{Array.from({ length: 20 }).map((_, i) => (
						<p key={i} className="bg-neutral-800 p-4 rounded">
							Comment {i + 1}: Lorem ipsum dolor sit amet, consectetur
							adipiscing elit.
						</p>
					))}
				</div>
			</div>
		</div>
	);
}
