import { useParams } from "react-router-dom";
import ScrollContainer from "../components/ScrollContainer";
import { useFetchPostsBySubredditQuery } from "../features/reddit/redditApi";
import PostModal from "../components/PostModal";
import clsx from "clsx";
import { store } from "../app/store";

declare global {
	interface Window {
		store?: typeof store;
	}
}

const Home = () => {
	const { postId } = useParams();
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
				"flex-1 w-full relative",
				postId ? "overflow-hidden" : "overflow-y-auto"
			)}
		>
			{postId && <PostModal />}
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
