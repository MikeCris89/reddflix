import { createBrowserRouter } from "react-router-dom";
import Home from "../pages/Home";
import Root from "../pages/Root";
import Settings from "../pages/Settings";
import PostModal from "../components/PostModal";
import NoMatch from "../pages/NoMatch";

export const childRoutes = [
	{
		index: true,
		element: <Home />,
	},
	{
		path: "settings",
		element: <Settings />,
	},
	{
		path: "/:category/:postId",
		element: <PostModal />, // full page version
	},
	{
		path: "*",
		element: <NoMatch />,
	},
];

const routes = [
	{
		path: "/",
		element: <Root />,
		children: childRoutes, // DON'T call useRoutes on this whole object
	},
];

const router = createBrowserRouter(routes);

export default router;
