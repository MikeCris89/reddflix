import { useDispatch } from "react-redux";
import { persistor } from "../app/store";
import { redditApi } from "../features/reddit/redditApi";

const DevResetBtn = () => {
	const dispatch = useDispatch();

	const handleReset = async () => {
		await persistor.purge(); // clear persisted Redux state (IndexedDB/localStorage)
		dispatch(redditApi.util.resetApiState()); // clear in-memory RTK Query cache
		window.location.reload(); // optional: reload the app for a clean state
	};

	return (
		<button onClick={handleReset} style={{ color: "red" }}>
			🚨 Reset App Cache (Dev Only)
		</button>
	);
};

export default DevResetBtn;
