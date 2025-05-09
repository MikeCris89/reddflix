import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
	PostAndCommentsResponse,
	RedditComment,
	RedditCommentFormatted,
	RedditListing,
	RedditPost,
	RedditPostAndComments,
	RedditPostsPage,
	RefinedCommentBase,
} from "./redditTypes";
import { getPostType } from "../../utils/helpers";

const PLACEHOLDER_COMMENT: RedditCommentFormatted = {
	id: "",
	author: "[deleted]",
	body: "",
	body_html: "",
	score: 0,
	is_submitter: false,
	created_utc: 0,
	parent_id: "",
	permalink: "",
	replies: [],
};

const refinePost = (data: RedditPost) => {
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

const refineComments = (comment: RedditComment): RefinedCommentBase => ({
	id: comment.id,
	author: comment.author,
	body: comment.body,
	body_html: comment.body_html,
	score: comment.score,
	is_submitter: comment.is_submitter,
	created_utc: comment.created_utc,
	parent_id: comment.parent_id,
	permalink: comment.permalink,
});

const formatCommentTree = (comment: RedditComment): RedditCommentFormatted => {
	if (!comment || typeof comment !== "object" || comment.kind === "more") {
		return PLACEHOLDER_COMMENT;
	}

	const base: RedditCommentFormatted = {
		...refineComments(comment),
		replies: [],
	};

	if (
		typeof comment.replies === "object" &&
		"data" in comment.replies &&
		Array.isArray(comment.replies.data.children)
	) {
		base.replies = comment.replies.data.children.map((child) =>
			formatCommentTree(child.data)
		);
	}

	return base;
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
					.map((post) => refinePost(post.data)),
			}),
		}),
		searchPosts: builder.query({
			query: (searchTerm) => `search.json?q=${encodeURIComponent(searchTerm)}`,
			transformResponse: (
				response: RedditListing<RedditPost>
			): RedditPostsPage => ({
				after: response.data.after,
				posts: response.data.children.map((post) => refinePost(post.data)),
			}),
		}),

		fetchPostAndComments: builder.query({
			query: (postId) => `comments/${postId}.json`,
			transformResponse: (
				response: PostAndCommentsResponse
			): RedditPostAndComments => ({
				post: refinePost(response[0].data.children[0].data),
				comments: response[1].data.children.map((comment) =>
					formatCommentTree(comment.data)
				),
			}),
		}),
	}),
});

export const {
	useFetchPostsBySubredditQuery,
	useSearchPostsQuery,
	useFetchPostAndCommentsQuery,
} = redditApi;
