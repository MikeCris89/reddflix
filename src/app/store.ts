import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import localForage from "localforage"; // for IndexedDB support
import {
	persistStore,
	persistReducer,
	FLUSH,
	REHYDRATE,
	PAUSE,
	PERSIST,
	PURGE,
	REGISTER,
} from "redux-persist";
import { redditApi } from "../features/reddit/redditApi";
import { localAppApi } from "../features/localApp/localAppApi";

// RTK Query cache is stored under 'api.reducerPath'
const persistConfig = {
	key: redditApi.reducerPath,
	storage: localForage,
	version: 1,
};

localForage.config({
	name: "reddflix-persist",
	storeName: "redux-cache",
	description: "Redux persist storage for Reddit API cache",
});

export const persistedReducer = persistReducer(
	persistConfig,
	redditApi.reducer
);

export const store = configureStore({
	reducer: {
		[redditApi.reducerPath]: persistedReducer,
		[localAppApi.reducerPath]: localAppApi.reducer,
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: {
				// These actions are used internally by redux-persist
				ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
			},
		}).concat(redditApi.middleware, localAppApi.middleware),
});

// 👇 Dev-only access to Redux store
if (import.meta.env.DEV) {
	window.store = store;
}

export const persistor = persistStore(store);

// Enables refetching on window focus and network reconnect (opt-in per query).
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const dispatch = store.dispatch;
