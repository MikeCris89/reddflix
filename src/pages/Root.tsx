import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import PostModal from "../components/PostModal";

const Root = () => {
	return (
		<div className="h-full w-full flex flex-col justify-between overflow-hidden">
			<Outlet />
			<Navbar />
		</div>
	);
};

export default Root;
