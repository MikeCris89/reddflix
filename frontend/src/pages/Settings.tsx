import { useState } from "react";
import { useDispatch } from "react-redux";
import DevResetBtn from "../utils/DevResetBtn";
import { persistor } from "../app/store";
import { redditApi } from "../features/reddit/redditApi";
import { localAppApi } from "../features/localApp/localAppApi";
import { clearAllDbStores } from "../utils/db";

const Settings = () => {
	const dispatch = useDispatch();
	const [confirming, setConfirming] = useState(false);

	const handleDeleteAllData = async () => {
		await clearAllDbStores();
		await persistor.purge();
		dispatch(redditApi.util.resetApiState());
		dispatch(localAppApi.util.resetApiState());
		window.location.reload();
	};

	return (
		<div className="h-full w-full flex flex-col justify-start items-center">
			<h1>Settings</h1>
			{import.meta.env.DEV && <DevResetBtn />}
			<div className="mt-8">
				{confirming ? (
					<div className="flex flex-col items-center gap-2">
						<p className="text-sm text-red-400">This will delete all local data and reload the app. Are you sure?</p>
						<div className="flex gap-3">
							<button
								onClick={handleDeleteAllData}
								className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
							>
								Yes, delete everything
							</button>
							<button
								onClick={() => setConfirming(false)}
								className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
							>
								Cancel
							</button>
						</div>
					</div>
				) : (
					<button
						onClick={() => setConfirming(true)}
						className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
					>
						Delete All Data
					</button>
				)}
			</div>
		</div>
	);
};

export default Settings;
