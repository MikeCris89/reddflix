import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./App.css";
import App from "./App.tsx";
import { Provider } from "react-redux";
import { store, persistor } from "./app/store.ts";
import { PersistGate } from "redux-persist/integration/react";
import { getItem } from "./utils/dbHelpers.ts";
import { memoryBan } from "./utils/memoryBan.ts";

const persisted = await getItem<number>("requestMonitor", "bannedUntil");
if (persisted && persisted > Date.now()) {
	memoryBan.set(persisted);
}

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<Provider store={store}>
			<PersistGate loading={null} persistor={persistor}>
				<App />
			</PersistGate>
		</Provider>
	</StrictMode>,
);
