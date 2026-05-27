import { Provider } from "react-redux";
import { ReactNode } from "react";
import { configureStore } from "@reduxjs/toolkit";
import { redditApi } from "../features/reddit/redditApi";
import { localAppApi } from "../features/localApp/localAppApi";

// Fresh store per test — no persistence, no rehydration, no shared state
export const makeTestStore = () =>
	configureStore({
		reducer: {
			[redditApi.reducerPath]: redditApi.reducer,
			[localAppApi.reducerPath]: localAppApi.reducer,
		},
		middleware: (gdm) =>
			gdm().concat(redditApi.middleware, localAppApi.middleware),
	});

export const wrapper = ({ children }: { children: ReactNode }) => {
	const store = makeTestStore();
	return <Provider store={store}>{children}</Provider>;
};
