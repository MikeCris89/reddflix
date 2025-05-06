import { RouterProvider } from "react-router-dom";
import "./App.css";
import router from "./utils/router";

function App() {
	return (
		<div className="h-full w-full">
			<RouterProvider router={router} />
		</div>
	);
}

export default App;
