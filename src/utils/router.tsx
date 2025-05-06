import {
	createBrowserRouter,
	createRoutesFromElements,
	Route,
} from "react-router-dom";
import Home from "../pages/Home";
import Root from "../pages/Root";
import Settings from "../pages/Settings";

const routes = createRoutesFromElements(
	<Route path="/" element={<Root />}>
		<Route index element={<Home />} />
		<Route path=":category/:postId" element={<Home />} />
		<Route path="settings" element={<Settings />} />
	</Route>
);

const router = createBrowserRouter(routes);

export default router;
