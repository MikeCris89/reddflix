import "./App.css";
import ScrollContainer from "./components/ScrollContainer";
import { useFetchPostsBySubredditQuery } from "./features/reddit/redditApi";
import { testRedditListing } from "./utils/testData";

function App() {
	const { data } = useFetchPostsBySubredditQuery("worldnews");
	console.log(data);

	if (!data) return null;

	return (
		<div>
			<ScrollContainer data={data.posts} />
			<button>Search</button>
		</div>
	);
}

export default App;
