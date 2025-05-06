import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
	POST_TYPES,
	PostWithType,
	RedditListing,
	RedditPost,
	RedditPostsPage,
} from "./redditTypes";
import { getPostType } from "../../utils/helpers";

const refineData = (data: RedditPost) => {
	const parent = data.crosspost_parent_list?.[0];

	if (
		!data.gallery_data &&
		!data.media_metadata &&
		parent?.gallery_data &&
		parent?.media_metadata
	) {
		const withFallback = {
			...data,
			gallery_data: parent.gallery_data,
			media_metadata: parent.media_metadata,
		};

		return {
			...withFallback,
			type: getPostType(withFallback),
		};
	}

	return {
		...data,
		type: getPostType(data),
	};
};

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
					.map((post) => refineData(post.data)),
			}),
		}),
		searchPosts: builder.query({
			query: (searchTerm) => `search.json?q=${encodeURIComponent(searchTerm)}`,
			transformResponse: (
				response: RedditListing<RedditPost>
			): RedditPostsPage => ({
				after: response.data.after,
				posts: response.data.children.map((post) => refineData(post.data)),
			}),
		}),
	}),
});

export const { useFetchPostsBySubredditQuery } = redditApi;
