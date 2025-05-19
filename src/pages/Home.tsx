import { useParams } from "react-router-dom";
import ScrollContainer from "../components/ScrollContainer";
import { useFetchPostsBySubredditQuery } from "../features/reddit/redditApi";
import PostModal from "../components/PostModal";
import clsx from "clsx";
import { store } from "../app/store";
import { MinusCircle } from "lucide-react";

declare global {
	interface Window {
		store?: typeof store;
	}
}

const Home = () => {
	//const { postId } = useParams();
	// const { data: newsData } = useFetchPostsBySubredditQuery("worldnews");
	const { data: funnyData, refetch: refetchFunny } =
		useFetchPostsBySubredditQuery("funny", {
			refetchOnMountOrArgChange: false,
			refetchOnReconnect: false,
			refetchOnFocus: false,
		});

	const { data: codeData, refetch: refetchCode } =
		useFetchPostsBySubredditQuery("learnprogramming", {
			refetchOnMountOrArgChange: false,
			refetchOnReconnect: false,
			refetchOnFocus: false,
		});
	// const { data: gifData } = useFetchPostsBySubredditQuery("gifs");
	// const { data: confessData } = useFetchPostsBySubredditQuery("confession");
	// const { data: artistData } = useFetchPostsBySubredditQuery("ARTIST");

	// if (!newsData || !funnyData || !gifData || !confessData || !artistData)
	// 	return null;
	console.log("code", codeData);
	console.log("funny", funnyData);
	//if (!funnyData || !codeData) return null;
	// console.log("news", newsData);
	//console.log("funny", funnyData);
	// console.log("gifs", gifData);
	// console.log("arist", artistData);

	const showCache = (storeName: string) => {
		const store_ = window.store;
		if (!store_) {
			console.warn(`Redux store ${storeName} not found on window`);
			return;
		}
		const state = store_.getState();
		const queries = state.redditApi?.queries;

		for (const [key, value] of Object.entries(queries || {})) {
			if (key.includes(`${storeName}`)) {
				console.log(`Found ${storeName} query:`);
				console.log(key, value);
			}
		}
	};

	return (
		<div
			className={clsx(
				"flex-1 w-full relative overflow-y-auto"
				//postId ? "overflow-hidden" : "overflow-y-auto"
			)}
		>
			{/* {postId && <PostModal />} */}
			{/* <ScrollContainer
				data={newsData.posts}
				title="WorldNews"
				category="worldnews"
			/> */}
			<button onClick={refetchFunny}>Refetch</button>
			<button onClick={() => showCache("funny")}>Check Cache</button>
			<ScrollContainer data={funnyData?.posts} title="Funny" category="funny" />
			<button onClick={refetchCode}>Refetch</button>
			<button onClick={() => showCache("learnprogramming")}>Check Cache</button>
			<ScrollContainer
				data={codeData?.posts}
				title="Coding"
				category="learnprogramming"
			/>
			{/* <ScrollContainer data={gifData.posts} title="Gifs" category="gifs" />
			<ScrollContainer
				data={confessData.posts}
				title="Confessions"
				category="confession"
			/>
			<ScrollContainer data={artistData.posts} title="Artists" /> */}
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
