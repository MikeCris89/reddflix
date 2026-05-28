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

export const BAN_DURATION_MS = 1000 * 60 * 20;
export const RATE_DURATION_MS = 1000 * 15;

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
		console.log("🚫 blocked by ban — no request sent");
		return {
			error: {
				status: 403,
				data: {
					message: `Reddit has temporarily blocked requests.`,
					pendingTimestamp: memoryBan.get(),
					isAppHandledError: true,
					reason: "ban",
					blockedLocally: true,
				},
			},
		};
	}

	console.log("📡 → proxy");

	const rawBaseQuery = fetchBaseQuery({
		baseUrl: import.meta.env.DEV
			? "http://localhost:3001"
			: import.meta.env.VITE_API_URL,
	});
	const result = await rawBaseQuery(args, api, extraOptions);

	const cacheStatus = result.meta?.response?.headers.get("x-cache");
	if (cacheStatus) console.log(`🗄️ cache ${cacheStatus}`);

	if (result.error) {
		const status = result.error.status;

		if (status === 403) {
			if (!isBannedResponse(result.error.data))
				return {
					error: {
						status: "CUSTOM_ERROR",
						error: "Malformed 403 response from backend.",
					},
				};

			const retryAfterHeader =
				result.meta?.response?.headers.get("retry-after");
			const parsed = Number(retryAfterHeader);
			const retryAfter =
				retryAfterHeader && !isNaN(parsed) && parsed > 0
					? parsed
					: BAN_DURATION_MS / 1000;

			const banTime = now + Number(retryAfter) * 1000;
			memoryBan.set(banTime);
			return {
				error: {
					status: 403,
					data: {
						message: `Reddit has temporarily blocked further requests. Retry after cooldown.`,
						pendingTimestamp: banTime,
						isAppHandledError: true,
						reason: "ban",
					},
				},
			};
		}

		if (status === 429) {
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
						message: `You've reached Reddit's rate limit.`,
						pendingTimestamp: slot,
						isAppHandledError: true,
						reason: result.error.data.reason,
					},
				},
			};
		}

		console.error("Error fetching from proxy: ", result.error);
		// everything else — 500, PARSING_ERROR, FETCH_ERROR — passes through untouched
		return { error: result.error };
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
				// console.log(
				// 	`fetchPostsBySubreddit(${arg.subreddit}) fetch request started.`,
				// );

				queryFulfilled
					.then((_res) => {
						console.log(`✅ fetchPostsBySubreddit(${arg.subreddit}) Success`);
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
		fetchPostAndComments: builder.query<
			RedditPostAndComments,
			{ postId: string; slotToken?: number; shared?: boolean }
		>({
			query: ({ postId, slotToken, shared }) => ({
				url: `${shared ? "shared" : "comments"}/${postId}`,
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
				queryFulfilled
					.then((_res) => {
						console.log(`✅ fetchPostAndComments(${arg.postId}) Success`);
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
	useFetchPostAndCommentsQuery,
	useLazyFetchPostAndCommentsQuery,
} = redditApi;
