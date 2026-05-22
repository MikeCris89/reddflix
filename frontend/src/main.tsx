import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./App.css";
import App from "./App.tsx";
import { Provider } from "react-redux";
import { store, persistor } from "./app/store.ts";
import { PersistGate } from "redux-persist/integration/react";
import { hydrateBan } from "./utils/memoryBan.ts";

hydrateBan()
	.catch((err) => console.error("ban hydration failed, booting anyway:", err))
	.then(() => {
		createRoot(document.getElementById("root")!).render(
			<StrictMode>
				<Provider store={store}>
					<PersistGate loading={null} persistor={persistor}>
						<App />
					</PersistGate>
				</Provider>
			</StrictMode>,
		);
	});
