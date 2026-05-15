import {
	Category,
	defaultMonitor,
	RequestMonitor,
	SeenPosts,
	Subreddit,
} from "../../utils/types";
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
	tagTypes: [
		"categories",
		"settings",
		"seenPosts",
		"requestMonitor",
		"subreddits",
	],
	endpoints: (build) => ({
		// ===== CATEGORIES =====
		// =======================
		fetchCategories: build.query<Category[], void>({
			async queryFn() {
				const data = await getAllFromStore<Category>("categories");
				return { data };
			},
			providesTags: ["categories"],
		}),
		setCategory: build.mutation({
			async queryFn(args: { title: string; value: Category }) {
				const data = await setItem("categories", args.title, args.value);
				return { data };
			},
			invalidatesTags: ["categories"],
		}),
		setAllCategories: build.mutation({
			async queryFn(categories: Category[]) {
				const data = await Promise.all(
					categories.map((cat) => setItem("categories", cat.title, cat)),
				);
				return { data };
			},
			invalidatesTags: ["categories"],
		}),
		setCategoryTTL: build.mutation({
			async queryFn(title: string) {
				const existing = await getItem<Category>("categories", title);
				if (!existing) return { error: new Error("Category not found") };
				const ttl = 1000 * 60 * 60 * 3;
				const updated = { ...existing, ttl: Date.now() + ttl };
				const data = await setItem("categories", title, updated);
				return { data };
			},
			invalidatesTags: ["categories"],
		}),
		deleteCategory: build.mutation({
			async queryFn(title: string) {
				await deleteItem("categories", title);
				await deleteItem("seenPosts", title);
				return { data: true };
			},
			invalidatesTags: ["categories", "seenPosts"],
		}),
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
		setAllSubreddits: build.mutation({
			async queryFn(subs: Subreddit[]) {
				const data = await Promise.all(
					subs.map(async (sub) => {
						await deleteItem("subreddits", sub.name);
						if (!sub.active) await deleteItem("seenPosts", sub.name);
						return await setItem("subreddits", sub.name, sub);
					}),
				);
				return { data };
			},
			invalidatesTags: ["subreddits"],
		}),
		setSubredditTTL: build.mutation({
			async queryFn(name: string) {
				const existing = await getItem<Subreddit>("subreddits", name);
				if (!existing) return { error: new Error("Subreddit not found") };
				const ttl = 1000 * 60 * 60 * 3;
				const updated = { ...existing, ttl: Date.now() + ttl };
				const data = await setItem("subreddits", name, updated);
				return { data };
			},
			invalidatesTags: ["subreddits"],
		}),
		setSubredditLastUpdated: build.mutation({
			async queryFn(name: string) {
				const existing = await getItem<Subreddit>("subreddits", name);
				if (!existing) return { error: new Error("Subreddit not found") };
				const updated = { ...existing, lastUpdated: Date.now() };
				const data = await setItem("subreddits", name, updated);
				return { data };
			},
			invalidatesTags: ["subreddits"],
		}),
		deleteSubreddit: build.mutation({
			async queryFn(name: string) {
				await deleteItem("subreddits", name);
				await deleteItem("seenPosts", name);
				return { data: true };
			},
			invalidatesTags: ["subreddits", "seenPosts"],
		}),
		// ====== SETTINGS ======
		// =======================
		fetchSettings: build.query({
			async queryFn() {
				const data = (await getAllFromStore("settings")) || [];
				return { data };
			},
			providesTags: ["settings"],
		}),
		// ===== SEEN POSTS =====
		// =======================
		fetchAllSeenPosts: build.query<Record<string, string>, void>({
			async queryFn() {
				const resp = await getAllFromStore<SeenPosts>("seenPosts");
				const formatted = resp.map((e) => [e.id, e.subreddit]);
				const data = Object.fromEntries(formatted);
				return { data };
			},
			providesTags: ["seenPosts"],
		}),
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
		clearSeenPostsForSubreddit: build.mutation({
			async queryFn(subreddit: string) {
				const existing = await getAllFromStore<SeenPosts>("seenPosts");

				if (!existing) {
					// Nothing to clear, just return
					return { data: true };
				}

				// Filter by subreddit
				const filtered = existing.filter((e) => e.subreddit === subreddit);

				//delete entries of subreddit
				await Promise.all(filtered.map((e) => deleteItem("seenPosts", e.id)));
				return { data: true };
			},
			invalidatesTags: ["seenPosts"],
		}),
		// === REQUEST MONITOR ===
		// =======================
		fetchRequestMonitor: build.query<RequestMonitor, void>({
			async queryFn() {
				const store = "requestMonitor";
				const data: RequestMonitor = { ...defaultMonitor };
				data.recent = (await getItem<number[]>(store, "recent")) || [];
				data.pending = (await getItem<number[]>(store, "pending")) || [];
				data.bannedUntil = await getItem<number>(store, "bannedUntil");
				return { data };
			},
			providesTags: ["requestMonitor"],
		}),
		// fetchRequestLimit: build.query<RateLimit, RequestMonitor>({
		// 	async queryFn(reqMonitor, api) {
		// 		const prunePending = async (newPending: number[]) => {
		// 			await api.dispatch(
		// 				localAppApi.endpoints.setPendingArray.initiate(newPending),
		// 			);
		// 		};
		// 		const data = await evaluateRateLimit(
		// 			Date.now(),
		// 			reqMonitor,
		// 			prunePending,
		// 		);
		// 		return { data };
		// 	},
		// 	providesTags: ["requestMonitor"],
		// }),
		// setRequestTime: build.mutation<unknown, number>({
		// 	async queryFn(timestamp: number = 0) {
		// 		const store = "requestMonitor";
		// 		const key = "recent";
		// 		const now = Date.now();
		// 		const existing = await getItem<number[]>(store, key);
		// 		const recent = (existing || []).filter((t) => now - t < 63_000);
		// 		const pending = (await getItem<number[]>(store, "pending")) || [];
		// 		if (timestamp) {
		// 			const index = pending.findIndex((el) => el === timestamp);
		// 			if (index !== -1) {
		// 				pending.splice(index, 1);
		// 				await setItem(store, "pending", pending);
		// 			}
		// 		}
		// 		const data = await setItem(store, key, [...recent, now]);

		// 		return { data };
		// 	},
		// 	invalidatesTags: ["requestMonitor"],
		// }),
		// setPendingRequest: build.mutation<unknown, number>({
		// 	async queryFn(timestamp: number) {
		// 		const store = "requestMonitor";
		// 		const key = "pending";
		// 		const pending = (await getItem<number[]>(store, key)) || [];
		// 		const data = await setItem(store, key, [...pending, timestamp]);
		// 		return { data };
		// 	},
		// 	invalidatesTags: ["requestMonitor"],
		// }),
		// removePendingRequest: build.mutation<unknown, number>({
		// 	async queryFn(timestamp: number) {
		// 		const store = "requestMonitor";
		// 		const key = "pending";
		// 		const pending = (await getItem<number[]>(store, key)) || [];
		// 		const index = pending.findIndex((el) => el === timestamp);
		// 		if (index === -1) return { data: false };
		// 		pending.splice(index, 1);
		// 		const data = await setItem(store, key, pending);
		// 		return { data };
		// 	},
		// 	invalidatesTags: ["requestMonitor"],
		// }),
		// setPendingArray: build.mutation<unknown, number[]>({
		// 	async queryFn(arr: number[]) {
		// 		const store = "requestMonitor";
		// 		const key = "pending";
		// 		const data = await setItem(store, key, arr);
		// 		return { data };
		// 	},
		// 	invalidatesTags: ["requestMonitor"],
		// }),
		setBannedUntil: build.mutation<unknown, number>({
			async queryFn(bannedUntil: number) {
				const data = await setItem(
					"requestMonitor",
					"bannedUntil",
					bannedUntil,
				);
				return { data };
			},
			invalidatesTags: ["requestMonitor"],
		}),
		// clearPending: build.mutation({
		// 	async queryFn() {
		// 		const data = await deleteItem("requestMonitor", "pending");
		// 		return { data };
		// 	},
		// 	invalidatesTags: ["requestMonitor"],
		// }),
	}),
});

export const {
	useFetchCategoriesQuery,
	useFetchSeenPostsQuery,
	useFetchSettingsQuery,
	useSetAllCategoriesMutation,
	useSetCategoryMutation,
	useSetCategoryTTLMutation,
	useSetSeenPostMutation,
	useClearSeenPostsForSubredditMutation,
	useDeleteCategoryMutation,
	useFetchSubredditsQuery,
	useLazyFetchSubredditsQuery,
	useSetAllSubredditsMutation,
	useSetSubredditMutation,
	useSetSubredditTTLMutation,
	useSetSubredditLastUpdatedMutation,

	useFetchRequestMonitorQuery,
	// useFetchRequestLimitQuery,
	// useRemovePendingRequestMutation,
	// useSetPendingArrayMutation,
	// useSetPendingRequestMutation,
	// useClearPendingMutation,
} = localAppApi;
