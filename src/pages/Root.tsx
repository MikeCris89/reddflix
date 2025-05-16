import {
	Location,
	Route,
	Routes,
	useLocation,
	useRoutes,
} from "react-router-dom";
import Navbar from "../components/Navbar";
import { useEffect } from "react";
import Modal from "./Modal";
import { childRoutes } from "../utils/router";

const Root = () => {
	const location = useLocation();
	const state = location.state as { backgroundLocation?: Location };
	const backgroundLocation = state?.backgroundLocation;
	const elements = useRoutes(childRoutes, backgroundLocation || location);

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

	return (
		<div className="h-full w-full flex flex-col justify-between overflow-hidden">
			<Navbar />

			{backgroundLocation && (
				<Routes>
					<Route path="/:category/:postId" element={<Modal />} />
				</Routes>
			)}
			{elements}
		</div>
	);
};

export default Root;
