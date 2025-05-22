import {
	Location,
	Route,
	Routes,
	useLocation,
	useRoutes,
} from "react-router-dom";
import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import Modal from "./Modal";
import { childRoutes } from "../utils/router";
import { ErrorBoundary } from "./ErrorBoundary";
import {
	useFetchSubredditsQuery,
	useSetAllSubredditsMutation,
	useSetSubredditMutation,
} from "../features/localApp/localAppApi";
import Spinner from "../components/Spinner";
import { defaultSubreddits } from "../utils/defaultSubreddits";

const Root = () => {
	const [isLoading, setIsLoading] = useState(true);
	const location = useLocation();
	const state = location.state as { backgroundLocation?: Location };
	const backgroundLocation = state?.backgroundLocation;
	const elements = useRoutes(childRoutes, backgroundLocation || location);

	const {
		data: subreddits,
		isError,
		error,
		isLoading: catLoading,
	} = useFetchSubredditsQuery();
	const [setAllSubreddits] = useSetAllSubredditsMutation();
	const [setSubreddit] = useSetSubredditMutation();

	useEffect(() => {
		// pause preview videos when not visible
		const handleVisibilityChange = () => {
			if (document.hidden) {
				document.querySelectorAll("video").forEach((vid) => vid.pause());
			}
		};

		document.addEventListener("visibilitychange", handleVisibilityChange);
		return () =>
			document.removeEventListener("visibilitychange", handleVisibilityChange);
	}, []);

	useEffect(() => {
		if (!subreddits) return;

		const subredditCheck = async () => {
			if (subreddits.length === 0) {
				await setAllSubreddits(defaultSubreddits);
			} else {
				const subCheck = defaultSubreddits.filter(
					(def) => !subreddits.some((sub) => def.name === sub.name)
				);
				if (subCheck.length > 0) {
					await Promise.all(
						subCheck.map((s) => setSubreddit({ name: s.name, value: s }))
					);
				}
			}
			setIsLoading(false);
		};
		subredditCheck();
	}, [subreddits, setAllSubreddits, setSubreddit]);

	if (isError && error) {
		console.log(error);
	}

	return (
		<div className="h-full w-full flex flex-col justify-between overflow-hidden">
			<Navbar />
			{(isLoading || catLoading) && <Spinner />}
			{subreddits && (
				<ErrorBoundary>
					{backgroundLocation && (
						<Routes>
							<Route path="/:category/:postId" element={<Modal />} />
						</Routes>
					)}
					{elements}
				</ErrorBoundary>
			)}
			{isError && <p>Something went wrong.</p>}
		</div>
	);
};

export default Root;
