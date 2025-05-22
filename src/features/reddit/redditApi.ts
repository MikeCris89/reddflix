import {
	BaseQueryFn,
	createApi,
	FetchArgs,
	fetchBaseQuery,
	FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
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
import { localAppApi } from "../localApp/localAppApi";
import { RootState } from "../../app/store";

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
		selftext_html: base.selftext_html,
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

const customBaseQuery: BaseQueryFn<
	string | FetchArgs,
	unknown,
	FetchBaseQueryError
> = async (args, api, extraOptions) => {
	const state = api.getState() as RootState;
	const requestLimit =
		localAppApi.endpoints.fetchRequestLimit.select()(state)?.data;

	// Check rate limiting and request ban delay
	if (requestLimit && !requestLimit.ok) {
		let msg = "Error communicating with Reddit.";
		if (requestLimit.reason === "ban")
			msg = `Reddit has temporarily blocked further requests. Retry at ${new Date(
				Date.now() + requestLimit.delayMs
			).toLocaleString()}`;
		else {
			const seconds = Math.ceil(requestLimit.delayMs / 1000);
			msg = `You've reach Reddit's rate limit. Retrying in ~${seconds}s`;
		}

		throw Object.assign(new Error(msg), {
			delay: requestLimit.delayMs,
			isAppHandledError: true,
		});
	}

	// add request to rate limit list
	api.dispatch(localAppApi.endpoints.setRequestTime.initiate());

	const rawBaseQuery = fetchBaseQuery({ baseUrl: "https://www.reddit.com/" });
	const result = await rawBaseQuery(args, api, extraOptions);

	console.log("BaseQuery result:", result);

	// Set request ban for 403 errors and throw for other errors
	if (result.error) {
		console.log("Error received:", result.error);
		let delay = 0;
		if (result.error.status === 403) {
			try {
				const resp = await api
					.dispatch(localAppApi.endpoints.setBannedUntil.initiate())
					.unwrap();
				delay = resp && resp > 0 ? resp : 1000 * 60 * 60;
			} catch {
				delay = 1000 * 60 * 60;
			}
			throw Object.assign(
				new Error(
					`Reddit has temporarily blocked further requests. Retry at ${new Date(
						Date.now() + delay
					).toLocaleString()}`
				),
				{
					delay,
					isAppHandledError: true,
				}
			);
		} else {
			throw Object.assign(
				new Error(`Error communicating with Reddit. Retrying in 30s`),
				{
					delay: 30_000,
					isAppHandledError: true,
				}
			);
		}
	}

	return result;
};

export const redditApi = createApi({
	reducerPath: "redditApi",
	baseQuery: customBaseQuery,
	endpoints: (builder) => ({
		fetchPostsBySubreddit: builder.query({
			query: (subreddit) => `r/${subreddit}.json`,
			keepUnusedDataFor: 60 * 60 * 24 * 7,
			transformResponse: (
				response: RedditListing<RawRedditPost>
			): RedditPostsPage => {
				console.log(`fetchPostsBySubreddit network response.`);
				if (
					!response ||
					!response.data ||
					!Array.isArray(response.data.children) ||
					response.data.children.length === 0
				) {
					throw new Error("Invalid Reddit response");
				}
				return {
					after: response.data.after,
					posts: response.data.children
						.filter((post) => post.data.stickied !== true)
						.map((post) => refinePost(post.data)),
				};
			},
			onQueryStarted(arg, { queryFulfilled }) {
				console.log(`fetchPostsBySubreddit(${arg}) network request started.`);

				queryFulfilled
					.then((res) => {
						console.log(`✅ fetchPostsBySubreddit(${arg}) Success:`, res);
					})
					.catch((err) => {
						console.error(`❌ fetchPostsBySubreddit(${arg}) failed:`, err);
					});
			},
		}),
		searchPosts: builder.query({
			query: (searchTerm) =>
				`search.json?q=${encodeURIComponent(searchTerm)}&sort=top`,
			keepUnusedDataFor: 60 * 60 * 24 * 7,
			transformResponse: (
				response: RedditListing<RawRedditPost>
			): RedditPostsPage => {
				console.log("searchPosts endpoint network request.");
				if (
					!response?.data?.children ||
					!Array.isArray(response.data.children)
				) {
					throw new Error("Invalid Reddit response");
				}
				return {
					after: response.data.after,
					posts: response.data.children.map((post) => refinePost(post.data)),
				};
			},
			onQueryStarted(arg, { queryFulfilled, dispatch }) {
				console.log(`searchPosts(${arg}) network request started.`);

				queryFulfilled
					.then((res) => {
						console.log(`✅ searchPosts(${arg}) Success:`, res);
					})
					.catch((err) => {
						console.error(`❌ searchPosts(${arg}) failed:`, err);
					});
			},
		}),

		fetchPostAndComments: builder.query({
			query: (postId) => `comments/${postId}.json`,
			keepUnusedDataFor: 60 * 60 * 24 * 7,
			transformResponse: (
				response: PostAndCommentsResponse
			): RedditPostAndComments => {
				console.log("fetchPostsAndComments network request.");
				if (
					!response ||
					!Array.isArray(response) ||
					!Array.isArray(response[0].data.children) ||
					response[1].data.children.length === 0
				) {
					throw new Error("Invalid Reddit response");
				}
				return {
					post: refinePost(response[0].data.children[0].data),
					comments: response[1].data.children.map((comment) =>
						formatCommentTree(comment.data)
					),
				};
			},
			onQueryStarted(arg, { queryFulfilled }) {
				console.log(`fetchPostAndComments(${arg}) network request started.`);

				queryFulfilled
					.then((res) => {
						console.log(`✅ fetchPostAndComments(${arg}) Success:`, res);
					})
					.catch((err) => {
						console.error(`❌ fetchPostAndComments(${arg}) failed:`, err);
					});
			},
		}),
	}),
});

export const {
	useFetchPostsBySubredditQuery,
	useLazyFetchPostsBySubredditQuery,
	useSearchPostsQuery,
	useLazySearchPostsQuery,
	useFetchPostAndCommentsQuery,
} = redditApi;
