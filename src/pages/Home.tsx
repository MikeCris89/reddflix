import ScrollContainer from "../components/ScrollContainer";
import { useFetchPostsBySubredditQuery } from "../features/reddit/redditApi";

const Home = () => {
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
		<div className="flex-1 w-full overflow-y-auto">
			<ScrollContainer data={newsData.posts} title="WorldNews" />
			<ScrollContainer data={funnyData.posts} title="Funny" />
			<ScrollContainer data={gifData.posts} title="Gifs" />
			<ScrollContainer data={confessData.posts} title="Confessions" />
			<ScrollContainer data={artistData.posts} title="Artists" />
		</div>
	);
};

export default Home;
