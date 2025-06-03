import {
	Category,
	RequestMonitor,
	SeenPosts,
	Subreddit,
} from "./../../utils/types";
import {
	createApi,
	fakeBaseQuery,
	FetchArgs,
} from "@reduxjs/toolkit/query/react";
import {
	deleteItem,
	getAllFromStore,
	getItem,
	setItem,
} from "../../utils/dbHelpers";
import { evaluateRateLimit } from "./requestMonitorUtils";

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
					categories.map((cat) => setItem("categories", cat.title, cat))
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
					subs.map((sub) => setItem("subreddits", sub.title, sub))
				);
				return { data };
			},
			invalidatesTags: ["subreddits"],
		}),
		setSubredditTTL: build.mutation({
			async queryFn(title: string) {
				const existing = await getItem<Subreddit>("subreddits", title);
				if (!existing) return { error: new Error("Subreddit not found") };
				const ttl = 1000 * 60 * 60 * 3;
				const updated = { ...existing, ttl: Date.now() + ttl };
				const data = await setItem("subreddits", title, updated);
				return { data };
			},
			invalidatesTags: ["subreddits"],
		}),
		deleteSubreddit: build.mutation({
			async queryFn(title: string) {
				await deleteItem("subreddits", title);
				await deleteItem("seenPosts", title);
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
						.map((seen) => [seen.id, seen.subreddit])
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
		fetchRequestMonitor: build.query({
			async queryFn() {
				const data = await getAllFromStore("requestMonitor");
				return { data };
			},
			providesTags: ["requestMonitor"],
		}),
		fetchRequestLimit: build.query<
			{
				ok: boolean;
				delayMs: number;
				reason: "ban" | "rateLimit" | undefined;
			},
			void
		>({
			async queryFn() {
				// const now = Date.now();
				// const bannedUntil = await getItem<number>(
				// 	"requestMonitor",
				// 	"bannedUntil"
				// );
				// if (bannedUntil && now < bannedUntil)
				// 	return {
				// 		data: {
				// 			ok: false,
				// 			delayMs: bannedUntil - now,
				// 			reason: "ban" as const,
				// 		},
				// 	};
				// const recent =
				// 	(await getItem<number[]>("requestMonitor", "recent")) || [];
				// const filteredRecent = recent.filter((t) => now - t < 63_000);
				// if (filteredRecent.length < 10)
				// 	return { data: { ok: true, delayMs: 0, reason: undefined } };
				// const pending =
				// 	(await getItem<number[]>("requestMonitor", "pending")) || [];
				// let delayMs = 0;
				// // get delay time. if # of pending exceeds # of recent, calc delay from pending list.
				// if (pending.length <= 10)
				// 	delayMs = 63_000 - (now - filteredRecent[pending.length]);
				// else {
				// 	delayMs = 63_000 - (now - pending[pending.length - 10]);
				// }
				// return { data: { ok: false, delayMs, reason: "rateLimit" as const } };
				const data = await evaluateRateLimit(Date.now());
				return { data };
			},
			providesTags: ["requestMonitor"],
		}),
		setRequestTime: build.mutation<unknown, void>({
			async queryFn() {
				const store = "requestMonitor";
				const key = "recent";
				const now = Date.now();
				const existing = await getItem<number[]>(store, key);
				const recent = (existing || []).filter((t) => now - t < 63_000);
				const pending = (await getItem<number[]>(store, "pending")) || [];
				if (pending.length > 0) pending.shift();
				const data = await setItem(store, key, [...recent, now]);
				await setItem(store, "pending", [...pending]);
				return { data };
			},
			invalidatesTags: ["requestMonitor"],
		}),
		setPendingRequest: build.mutation<unknown, void>({
			async queryFn() {
				const store = "requestMonitor";
				const key = "pending";
				const now = Date.now();
				const pending = (await getItem<number[]>(store, key)) || [];
				const data = await setItem(store, key, [...pending, now]);
				return { data };
			},
			invalidatesTags: ["requestMonitor"],
		}),
		setBannedUntil: build.mutation<number, void>({
			async queryFn() {
				const store = "requestMonitor";
				const key = "bannedUntil";
				const currTime = Date.now();
				const existing = await getItem<number>(store, key);
				let delay = 1000 * 60 * 60 * 2;
				// if resp is another 403 within 3 hours of previous, delay further to 6 hours.
				if (existing && currTime - existing <= delay * 3) delay *= 3;
				await setItem<number>(store, key, currTime + delay);
				return { data: delay };
			},
			invalidatesTags: ["requestMonitor"],
		}),
		clearPending: build.mutation({
			async queryFn() {
				const data = await deleteItem("requestMonitor", "pending");
				return { data };
			},
			invalidatesTags: ["requestMonitor"],
		}),
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
	useClearPendingMutation,
} = localAppApi;
