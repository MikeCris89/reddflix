import "./App.css";
import { useFetchPostsBySubredditQuery } from "./features/reddit/redditApi";

function App() {
	const { data } = useFetchPostsBySubredditQuery("funny");
	console.log(data);

	return (
		<div>
			<button>Search</button>
		</div>
	);
}

export default App;
