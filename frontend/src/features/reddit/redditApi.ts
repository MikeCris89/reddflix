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
	RedditPostAndComments,
	RedditPostsPage,
	RedditThing,
	RefinedCommentBase,
} from "./redditTypes";
import { refinePost } from "../../utils/helpers";
import { localAppApi } from "../localApp/localAppApi";
import { isBannedResponse, isRateLimitedResponse } from "../../utils/types";
import { memoryBan } from "../../utils/memoryBan";

const PLACEHOLDER_COMMENT: RedditCommentFormatted = {
	id: "",
	author: "[deleted]",
	body_html: "",
	distinguished: "moderator",
	score: 0,
	is_submitter: false,
	created_utc: 0,
	parent_id: "",
	permalink: "",
	replies: [],
};

const refineComments = (comment: RedditComment): RefinedCommentBase => ({
	id: comment.id,
	author: comment.author,
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
	const now = Date.now();

	// Synchronous check — blocks concurrent requests the moment a ban is set
	if (now < memoryBan.get()) {
		return {
			error: {
				status: 403,
				data: {
					message: `Reddit has temporarily blocked requests.`,
					pendingTimestamp: memoryBan.get(),
					isAppHandledError: false,
					reason: "ban",
				},
			},
		};
	}

	console.log(`📡 network request started.`);

	const rawBaseQuery = fetchBaseQuery({
		baseUrl: import.meta.env.DEV
			? "http://localhost:3001"
			: import.meta.env.VITE_API_URL,
	});
	const result = await rawBaseQuery(args, api, extraOptions);

	if (result.error) {
		const retryAfterHeader = result.meta?.response?.headers.get("retry-after");
		if (!retryAfterHeader || isNaN(Number(retryAfterHeader))) {
			return {
				error: {
					status: "CUSTOM_ERROR",
					error: `Missing or invalid Retry-After header on ${result.error.status} response. Got: ${retryAfterHeader}`,
				},
			};
		}
		const delaySec = Number(retryAfterHeader);
		if (result.error.status === 403) {
			if (!isBannedResponse(result.error.data))
				return {
					error: {
						status: "CUSTOM_ERROR",
						error: "Malformed 403 response from backend.",
					},
				};

			// Set in-memory ban immediately to block any concurrent requests
			memoryBan.set(now + delaySec * 1000);
			await api.dispatch(
				localAppApi.endpoints.setBannedUntil.initiate(memoryBan.get()),
			);

			return {
				error: {
					status: 403,
					data: {
						message: `Reddit has temporarily blocked further requests. Retry after cooldown.`,
						pendingTimestamp: memoryBan.get(),
						isAppHandledError: false,
						reason: "ban",
					},
				},
			};
		} else if (result.error.status === 429) {
			if (!isRateLimitedResponse(result.error.data))
				return {
					error: {
						status: "CUSTOM_ERROR",
						error: "Malformed 429 response from backend.",
					},
				};

			const slot = result.error.data.slotToken;
			return {
				error: {
					status: 429,
					data: {
						message: `You've reached Reddit's rate limit. Retrying in ~${delaySec}s`,
						//delay: requestLimit.delayMs,
						pendingTimestamp: slot,
						isAppHandledError: true,
						reason: result.error.data.reason,
					},
				},
			};
		} else {
			return { error: result.error };
		}
	}

	return result;
};

export const redditApi = createApi({
	reducerPath: "redditApi",
	baseQuery: customBaseQuery,
	endpoints: (builder) => ({
		fetchPostsBySubreddit: builder.query<
			RedditPostsPage,
			{ subreddit: string; slotToken?: number }
		>({
			query: ({ subreddit, slotToken }) => ({
				url: `r/${subreddit}`,
				headers:
					slotToken !== undefined
						? { "X-Slot-Token": String(slotToken) }
						: undefined,
			}),
			serializeQueryArgs: ({ queryArgs }) => queryArgs.subreddit,
			keepUnusedDataFor: 60 * 60 * 24 * 7,
			transformResponse: (
				response: RedditListing<RawRedditPost>,
			): RedditPostsPage => {
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
			onQueryStarted(arg, { queryFulfilled, dispatch }) {
				console.log(
					`fetchPostsBySubreddit(${arg.subreddit}) fetch request started.`,
				);

				queryFulfilled
					.then((res) => {
						console.log(
							`✅ fetchPostsBySubreddit(${arg.subreddit}) Success:`,
							res,
						);
						dispatch(
							localAppApi.endpoints.setSubredditLastUpdated.initiate(
								arg.subreddit,
							),
						);
					})
					.catch((err) => {
						console.error(
							`❌ fetchPostsBySubreddit(${arg.subreddit}) failed:`,
							err,
						);
					});
			},
		}),
		// UNUSED - keep for future feature
		searchPosts: builder.query({
			query: (searchTerm) =>
				`search.json?q=${encodeURIComponent(searchTerm)}&sort=top`,
			keepUnusedDataFor: 60 * 60 * 24 * 7,
			transformResponse: (
				response: RedditListing<RawRedditPost>,
			): RedditPostsPage => {
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
			onQueryStarted(arg, { queryFulfilled, dispatch: _dispatch }) {
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
		fetchPostAndComments: builder.query<
			RedditPostAndComments,
			{ postId: string; slotToken?: number }
		>({
			query: ({ postId, slotToken }) => ({
				url: `comments/${postId}`,
				headers:
					slotToken !== undefined
						? { "X-Slot-Token": String(slotToken) }
						: undefined,
			}),
			serializeQueryArgs: ({ queryArgs }) => queryArgs.postId,
			keepUnusedDataFor: 60 * 60 * 24 * 7,
			transformResponse: (
				response: PostAndCommentsResponse,
			): RedditPostAndComments => {
				if (
					!response ||
					!Array.isArray(response) ||
					!Array.isArray(response[0].data.children)
					// response[1].data.children.length === 0
				) {
					throw new Error("Invalid Reddit response");
				}
				return {
					post: refinePost(response[0].data.children[0].data),
					comments: response[1].data.children.map((comment) =>
						formatCommentTree(comment.data),
					),
				};
			},
			onQueryStarted(arg, { queryFulfilled }) {
				console.log(
					`fetchPostAndComments(${arg.postId}) fetch request started.`,
				);

				queryFulfilled
					.then((res) => {
						console.log(`✅ fetchPostAndComments(${arg.postId}) Success:`, res);
					})
					.catch((err) => {
						console.error(
							`❌ fetchPostAndComments(${arg.postId}) failed:`,
							err,
						);
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
