import { Category, SeenPosts } from "./../../utils/types";
import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query";
import {
	deleteItem,
	getAllFromStore,
	getItem,
	setItem,
} from "../../utils/dbHelpers";

export const localAppApi = createApi({
	reducerPath: "localAppApi",
	baseQuery: fakeBaseQuery(),
	tagTypes: ["categories", "settings", "seenPosts"],
	endpoints: (build) => ({
		fetchCategories: build.query<Category[], void>({
			async queryFn() {
				const data = await getAllFromStore<Category>("categories");
				return { data };
			},
			providesTags: ["categories"],
		}),
		fetchSettings: build.query({
			async queryFn() {
				const data = (await getAllFromStore("settings")) || [];
				return { data };
			},
			providesTags: ["settings"],
		}),
		fetchSeenPosts: build.query<Record<string, SeenPosts>, string[]>({
			async queryFn(categories: string[]) {
				const cats = Array.isArray(categories) ? categories : [categories];
				const resp = await Promise.all(
					cats.map(async (c) => [
						c,
						(await getItem<SeenPosts>("seenPosts", c)) || {},
					])
				);
				const data = Object.fromEntries(resp);
				return { data };
			},
			providesTags: ["seenPosts"],
		}),
		setCategory: build.mutation({
			async queryFn(args: { title: string; value: Category }) {
				const data = await setItem("categories", args.title, args.value);
				return { data };
			},
			invalidatesTags: ["categories"],
		}),
		setActiveCategories: build.mutation({
			async queryFn(categories: Category[]) {
				const data = await Promise.all(
					categories.map((cat) => setItem("categories", cat.title, cat))
				);
				return { data };
			},
			invalidatesTags: ["categories"],
		}),
		setSeenPost: build.mutation({
			async queryFn(args: { category: string; postId: string }) {
				const existing =
					(await getItem<SeenPosts>("seenPosts", args.category)) || {};
				const updated = { ...existing, [args.postId]: true };
				const data = await setItem("seenPosts", args.category, updated);
				return { data };
			},
		}),
		clearSeenPostsForCategory: build.mutation({
			async queryFn(args: { category: string; newPostIds: string[] }) {
				const existing = await getItem<SeenPosts>("seenPosts", args.category);

				if (!existing) {
					// Nothing to clear, just return
					return { data: true };
				}

				// Retain only seen post IDs that still exist in new fetch
				const retained = args.newPostIds.filter((id) => existing[id]);

				if (retained.length === 0) {
					// All posts were outdated, delete the whole category key
					await deleteItem("seenPosts", args.category);
					return { data: true };
				}

				const updated = Object.fromEntries(retained.map((id) => [id, true]));
				await setItem("seenPosts", args.category, updated);
				return { data: true };
			},
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
				await deleteItem("seenPosts", title); // Clean up
				return { data: true };
			},
			invalidatesTags: ["categories", "seenPosts"],
		}),
	}),
});
