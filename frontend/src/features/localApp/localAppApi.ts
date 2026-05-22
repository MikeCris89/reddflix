import { SeenPosts, Subreddit } from "../../utils/types";
import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import {
	deleteItem,
	getAllFromStore,
	getItem,
	setItem,
} from "../../utils/dbHelpers";

export const localAppApi = createApi({
	reducerPath: "localAppApi",
	baseQuery: fakeBaseQuery(),
	tagTypes: ["seenPosts", "subreddits"],
	endpoints: (build) => ({
		// ==== SUBREDDITS ====
		// =======================
		fetchSubreddits: build.query<Subreddit[], void>({
			async queryFn() {
				const data = await getAllFromStore<Subreddit>("subreddits");
				return { data };
			},
			providesTags: ["subreddits"],
		}),
		setSubreddit: build.mutation({
			async queryFn(args: { name: string; value: Subreddit }) {
				const data = await setItem("subreddits", args.name, args.value);
				return { data };
			},
			invalidatesTags: ["subreddits"],
		}),
		setSubbredditList: build.mutation({
			async queryFn(subs: Subreddit[]) {
				const data = await Promise.all(
					subs.map(async (sub) => {
						await deleteItem("subreddits", sub.name);
						return await setItem("subreddits", sub.name, sub);
					}),
				);
				return { data };
			},
			invalidatesTags: ["subreddits"],
		}),
		setSubredditLastUpdated: build.mutation({
			async queryFn(name: string) {
				const existing = await getItem<Subreddit>("subreddits", name);
				if (!existing) return { error: { message: "Subreddit not found" } };
				const updated = { ...existing, lastUpdated: Date.now() };
				const data = await setItem("subreddits", name, updated);
				return { data };
			},
			invalidatesTags: ["subreddits"],
		}),

		// ===== SEEN POSTS =====
		// =======================
		fetchSeenPosts: build.query<Record<string, string>, string>({
			async queryFn(sub: string) {
				const resp = (await getAllFromStore<SeenPosts>("seenPosts")) || [];
				const data = Object.fromEntries(
					resp
						.filter((el) => el.subreddit === sub)
						.map((seen) => [seen.id, seen.subreddit]),
				);
				return { data };
			},
			providesTags: ["seenPosts"],
		}),
		setSeenPost: build.mutation({
			async queryFn(args: { subreddit: string; postId: string }) {
				const data = await setItem<SeenPosts>("seenPosts", args.postId, {
					subreddit: args.subreddit,
					id: args.postId,
				});
				return { data };
			},
		}),
	}),
});

export const {
	useFetchSeenPostsQuery,
	useSetSeenPostMutation,
	useFetchSubredditsQuery,
	useSetSubbredditListMutation,
	useSetSubredditMutation,
	useSetSubredditLastUpdatedMutation,
} = localAppApi;
