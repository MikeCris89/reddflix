import ScrollContainer from "../components/ScrollContainer";
import clsx from "clsx";
import { useFetchSubredditsQuery } from "../features/localApp/localAppApi";

const Home = () => {
	const { data: subreddits } = useFetchSubredditsQuery();

	const sortedSubs = subreddits
		?.slice()
		.sort((a, b) => a.name.localeCompare(b.name));

	return (
		<div
			className={clsx(
				"flex-1 flex flex-col gap-8 w-full relative overflow-y-auto p-1 pb-10",
			)}
		>
			{sortedSubs &&
				sortedSubs
					.filter((s) => s.active)
					.map((sub, i) => {
						return <ScrollContainer key={`${sub.name}-${i}`} subreddit={sub} />;
					})}
		</div>
	);
};

export default Home;
