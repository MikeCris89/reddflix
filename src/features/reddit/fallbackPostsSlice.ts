import { createSlice } from "@reduxjs/toolkit";
import { RedditPost } from "./redditTypes";
import defaultPosts from "../../data/defaultPosts.json";

interface FallbackPostsState {
	posts: Record<string, RedditPost[]>;
}

const initialState: FallbackPostsState = {
	posts: defaultPosts as unknown as Record<string, RedditPost[]>,
};

const fallbackPostsSlice = createSlice({
	name: "fallbackPosts",
	initialState,
	reducers: {},
});

export const selectFallbackPosts =
	(subreddit: string) => (state: { fallbackPosts: FallbackPostsState }) =>
		state.fallbackPosts.posts[subreddit] ?? [];

export default fallbackPostsSlice.reducer;
