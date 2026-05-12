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
	useClearPendingMutation,
	useFetchRequestLimitQuery,
	useFetchRequestMonitorQuery,
	useFetchSubredditsQuery,
	useSetAllSubredditsMutation,
	useSetSubredditMutation,
} from "../features/localApp/localAppApi";
import Spinner from "../components/Spinner";
import { defaultSubreddits } from "../data/defaultSubreddits";
import { RequestMonitor } from "../utils/types";
import { Toaster } from "sonner";
import DemoBanner from "../components/DemoBanner";

const RateLimitManager = () => {
	// initial rtk query fetches to setup cache
	const { data: reqMonitor } = useFetchRequestMonitorQuery();
	const { data: _rateLimit } = useFetchRequestLimitQuery(
		reqMonitor as RequestMonitor,
		{
			skip: !reqMonitor,
		},
	);

	return null;
};

const Root = () => {
	const [isLoading, setIsLoading] = useState(true);
	const location = useLocation();
	const state = location.state as { backgroundLocation?: Location };
	// const backgroundLocation = state?.backgroundLocation;
	const backgroundLocation =
		state?.backgroundLocation ||
		(location.pathname === "/about" ? { pathname: "/" } : undefined);
	const elements = useRoutes(childRoutes, backgroundLocation || location);

	const {
		data: subreddits,
		isError,
		isLoading: subloading,
	} = useFetchSubredditsQuery();
	const [setAllSubreddits] = useSetAllSubredditsMutation();
	const [setSubreddit] = useSetSubredditMutation();
	const [clearPending] = useClearPendingMutation();

	useEffect(() => {
		//clear all pending requests in storage
		clearPending("");
	}, [clearPending]);

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
		// check subreddits in local storage
		const subredditCheck = async () => {
			if (subreddits.length === 0) {
				await setAllSubreddits(defaultSubreddits);
			} else {
				const subCheck = defaultSubreddits.filter(
					(def) => !subreddits.some((sub) => def.name === sub.name),
				);
				if (subCheck.length > 0) {
					await Promise.all(
						subCheck.map((s) => setSubreddit({ name: s.name, value: s })),
					);
				}
			}
			setIsLoading(false);
		};
		subredditCheck();
	}, [subreddits, setAllSubreddits, setSubreddit]);

	return (
		<div className="h-full w-full flex flex-col overflow-hidden gap-2 p-1">
			<Toaster position="top-right" richColors />
			<RateLimitManager />
			<Navbar />
			<DemoBanner />
			<main className="flex-1 overflow-hidden w-full flex justify-center">
				{(isLoading || subloading) && (
					<div className="h-full w-full flex justify-center items-center">
						<Spinner size="lg" />
					</div>
				)}
				{subreddits && (
					<ErrorBoundary>
						{backgroundLocation && (
							<Routes>
								<Route path="/about" element={<Modal about />} />
								<Route path="/:category/:postId" element={<Modal />} />
							</Routes>
						)}
						{elements}
					</ErrorBoundary>
				)}
				{isError && <p>Something went wrong.</p>}
			</main>
		</div>
	);
};

export default Root;
