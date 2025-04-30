import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RedditListing, RedditPost, RedditPostsPage } from "./redditTypes";

export const redditApi = createApi({
	reducerPath: "redditApi",
	baseQuery: fetchBaseQuery({ baseUrl: "https://www.reddit.com/" }),
	endpoints: (builder) => ({
		fetchPostsBySubreddit: builder.query({
			query: (subreddit) => `r/${subreddit}.json`,
			transformResponse: (
				response: RedditListing<RedditPost>
			): RedditPostsPage => ({
				after: response.data.after,
				posts: response.data.children
					.filter((post) => post.data.stickied !== true)
					.map((post) => post.data),
			}),
		}),
		searchPosts: builder.query({
			query: (searchTerm) => `search.json?q=${encodeURIComponent(searchTerm)}`,
			transformResponse: (
				response: RedditListing<RedditPost>
			): RedditPostsPage => ({
				after: response.data.after,
				posts: response.data.children.map((post) => post.data),
			}),
		}),
	}),
});

export const { useFetchPostsBySubredditQuery } = redditApi;
