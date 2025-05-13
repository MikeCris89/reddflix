import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useEffect } from "react";

const Root = () => {
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
			<Outlet />
			<Navbar />
		</div>
	);
};

export default Root;
