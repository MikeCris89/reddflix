import { useParams } from "react-router-dom";
import ScrollContainer from "../components/ScrollContainer";
import { useFetchPostsBySubredditQuery } from "../features/reddit/redditApi";
import PostModal from "../components/PostModal";
import clsx from "clsx";

const Home = () => {
	const { postId } = useParams();
	const { data: newsData } = useFetchPostsBySubredditQuery("worldnews");
	const { data: funnyData } = useFetchPostsBySubredditQuery("funny");
	const { data: gifData } = useFetchPostsBySubredditQuery("gifs");
	const { data: confessData } = useFetchPostsBySubredditQuery("confession");
	const { data: artistData } = useFetchPostsBySubredditQuery("ARTIST");

	if (!newsData || !funnyData || !gifData || !confessData || !artistData)
		return null;

	console.log("news", newsData);
	console.log("funny", funnyData);
	console.log("gifs", gifData);
	console.log("arist", artistData);

	return (
		<div
			className={clsx(
				"flex-1 w-full relative",
				postId ? "overflow-hidden" : "overflow-y-auto"
			)}
		>
			{postId && <PostModal />}
			<ScrollContainer
				data={newsData.posts}
				title="WorldNews"
				category="worldnews"
			/>
			<ScrollContainer data={funnyData.posts} title="Funny" category="funny" />
			<ScrollContainer data={gifData.posts} title="Gifs" category="gifs" />
			<ScrollContainer
				data={confessData.posts}
				title="Confessions"
				category="confession"
			/>
			<ScrollContainer data={artistData.posts} title="Artists" />
		</div>
	);
};

export default Home;
