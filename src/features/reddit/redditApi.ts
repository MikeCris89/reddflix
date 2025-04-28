import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const redditApi = createApi({
	reducerPath: "redditApi",
	baseQuery: fetchBaseQuery({ baseUrl: "https://www.reddit.com/" }),
	endpoints: (builder) => ({
		fetchPostsBySubreddit: builder.query({
			query: (subreddit) => `r/${subreddit}.json`,
		}),
		searchPosts: builder.query({
			query: (searchTerm) => `search.json?q=${encodeURIComponent(searchTerm)}`,
		}),
	}),
});

export const { useFetchPostsBySubredditQuery } = redditApi;
