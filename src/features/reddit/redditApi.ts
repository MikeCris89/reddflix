import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
	isValidRedditComment,
	PostAndCommentsResponse,
	RawRedditPost,
	RedditComment,
	RedditCommentFormatted,
	RedditListing,
	RedditPost,
	RedditPostAndComments,
	RedditPostsPage,
	RedditThing,
	RefinedCommentBase,
} from "./redditTypes";
import { getPostType } from "../../utils/helpers";

const PLACEHOLDER_COMMENT: RedditCommentFormatted = {
	id: "",
	author: "[deleted]",
	body: "",
	body_html: "",
	distinguished: "moderator",
	score: 0,
	is_submitter: false,
	created_utc: 0,
	parent_id: "",
	permalink: "",
	replies: [],
};

const refinePost = (data: RawRedditPost): RedditPost => {
	const parent = data.crosspost_parent_list?.[0];

	const base: RawRedditPost =
		!data.gallery_data &&
		!data.media_metadata &&
		parent?.gallery_data &&
		parent?.media_metadata
			? {
					...data,
					gallery_data: parent.gallery_data,
					media_metadata: parent.media_metadata,
			  }
			: data;

	return {
		id: base.id,
		title: base.title,
		subreddit: base.subreddit,
		thumbnail: base.thumbnail,
		url: base.url,
		permalink: base.permalink,
		author: base.author,
		created_utc: base.created_utc,
		score: base.score,
		num_comments: base.num_comments,
		post_hint: base.post_hint,
		media: base.media,
		media_metadata: base.media_metadata,
		gallery_data: base.gallery_data,
		secure_media: base.secure_media,
		preview: base.preview,
		is_video: base.is_video,
		is_self: base.is_self,
		selftext: base.selftext,
		url_overridden_by_dest: base.url_overridden_by_dest,
		type: getPostType(base),
	};
};

const refineComments = (comment: RedditComment): RefinedCommentBase => ({
	id: comment.id,
	author: comment.author,
	body: comment.body,
	body_html: comment.body_html,
	distinguished: comment.distinguished,
	score: comment.score,
	is_submitter: comment.is_submitter,
	created_utc: comment.created_utc,
	parent_id: comment.parent_id,
	permalink: comment.permalink,
});

const formatCommentTree = (comment: RedditComment): RedditCommentFormatted => {
	if (!comment || typeof comment !== "object") {
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
		base.replies = comment.replies.data.children
			.filter((c: RedditThing<RedditComment>) => isValidRedditComment(c))
			.map((child) => formatCommentTree(child.data));
	}

	return base;
};

export const redditApi = createApi({
	reducerPath: "redditApi",
	baseQuery: fetchBaseQuery({ baseUrl: "https://www.reddit.com/" }),
	endpoints: (builder) => ({
		fetchPostsBySubreddit: builder.query({
			query: (subreddit) => `r/${subreddit}.json`,
			keepUnusedDataFor: 60 * 60 * 24 * 7,
			transformResponse: (
				response: RedditListing<RawRedditPost>
			): RedditPostsPage => {
				console.log("fetchPostsBySubreddit network response.");
				return {
					after: response.data.after,
					posts: response.data.children
						.filter((post) => post.data.stickied !== true)
						.map((post) => refinePost(post.data)),
				};
			},
		}),
		searchPosts: builder.query({
			query: (searchTerm) => `search.json?q=${encodeURIComponent(searchTerm)}`,
			keepUnusedDataFor: 60 * 60 * 24 * 7,
			transformResponse: (
				response: RedditListing<RawRedditPost>
			): RedditPostsPage => {
				console.log("searchPosts endpoint network request.");
				return {
					after: response.data.after,
					posts: response.data.children.map((post) => refinePost(post.data)),
				};
			},
		}),

		fetchPostAndComments: builder.query({
			query: (postId) => `comments/${postId}.json`,
			keepUnusedDataFor: 60 * 60 * 24 * 7,
			transformResponse: (
				response: PostAndCommentsResponse
			): RedditPostAndComments => {
				console.log("fetchPostsAndComments network request.");
				return {
					post: refinePost(response[0].data.children[0].data),
					comments: response[1].data.children.map((comment) =>
						formatCommentTree(comment.data)
					),
				};
			},
		}),
	}),
});

export const {
	useFetchPostsBySubredditQuery,
	useSearchPostsQuery,
	useFetchPostAndCommentsQuery,
} = redditApi;
