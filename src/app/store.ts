import { configureStore } from "@reduxjs/toolkit";
import { redditApi } from "../features/reddit/redditApi";
import { setupListeners } from "@reduxjs/toolkit/query";

export const store = configureStore({
	reducer: {
		[redditApi.reducerPath]: redditApi.reducer,
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware().concat(redditApi.middleware),
});

// Enables refetching on window focus and network reconnect (opt-in per query).
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
