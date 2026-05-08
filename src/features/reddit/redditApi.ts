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
import { BAN_DURATION_MS } from "../../utils/types";

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

let inMemoryBannedUntil = 0;
let inMemoryPending: number[] = [];

const customBaseQuery: BaseQueryFn<
	string | FetchArgs,
	unknown,
	FetchBaseQueryError
> = async (args, api, extraOptions) => {
	const now = Date.now();

	if (import.meta.env.DEV) {
		console.error("Dev - blocking all requests. (redditApi custom base query)");
		return {
			error: {
				status: 403,
				data: {
					message: `Dev Block`,
					pendingTimestamp: now + 1000 * 60 * 60,
					isAppHandledError: true,
					reason: "ban",
				},
			},
		};
	}

	// Synchronous check — blocks concurrent requests the moment a ban is set
	if (now < inMemoryBannedUntil) {
		return {
			error: {
				status: 403,
				data: {
					message: `Reddit has temporarily blocked requests. Try again after ${new Date(inMemoryBannedUntil).toLocaleString()}`,
					pendingTimestamp: inMemoryBannedUntil,
					isAppHandledError: false,
					reason: "ban",
				},
			},
		};
	}

	const reqMonitor = await api
		.dispatch(
			localAppApi.endpoints.fetchRequestMonitor.initiate(undefined, {
				forceRefetch: true,
			}),
		)
		.unwrap();

	// Hydrate in-memory ban from DB (catches bans persisted across page reloads)
	if (reqMonitor?.bannedUntil && reqMonitor.bannedUntil > now) {
		inMemoryBannedUntil = reqMonitor.bannedUntil;
		return {
			error: {
				status: 403,
				data: {
					message: `Reddit has temporarily blocked requests. Try again after ${new Date(inMemoryBannedUntil).toLocaleString()}`,
					pendingTimestamp: inMemoryBannedUntil,
					isAppHandledError: false,
					reason: "ban",
				},
			},
		};
	}

	const mergedMonitor = {
		...reqMonitor,
		pending: [
			...new Set([
				...reqMonitor.pending,
				...inMemoryPending.filter((t) => t > now),
			]),
		],
	};

	const requestLimit = await api
		.dispatch(
			localAppApi.endpoints.fetchRequestLimit.initiate(mergedMonitor, {
				forceRefetch: true,
			}),
		)
		.unwrap();
	// Check rate limiting and request ban delay
	if (requestLimit && !requestLimit.ok) {
		let msg = "Error communicating with Reddit.";

		if (requestLimit.reason === "ban") {
			msg = `Reddit has temporarily blocked further requests.`;

			return {
				error: {
					status: 403,
					data: {
						message: msg,
						pendingTimestamp: inMemoryBannedUntil,
						isAppHandledError: false,
						reason: "ban",
					},
				},
			};
		} else {
			const seconds = Math.ceil(requestLimit.delayMs / 1000);
			msg = `You've reach Reddit's rate limit. Retrying in ~${seconds}s`;
			const timestamp = now + requestLimit.delayMs + 2000;

			// update in-memory immediately so next concurrent request sees it
			inMemoryPending = [...inMemoryPending.filter((t) => t > now), timestamp];

			// add request to pending list
			api.dispatch(localAppApi.endpoints.setPendingRequest.initiate(timestamp));

			return {
				error: {
					status: 429,
					data: {
						message: msg,
						//delay: requestLimit.delayMs,
						pendingTimestamp: timestamp,
						isAppHandledError: true,
						reason: "rateLimit",
					},
				},
			};
		}
	}

	const arg = args && typeof args === "number" ? args : 0;

	console.log(`📡 network request started.`);
	// add request to rate limit list
	api.dispatch(localAppApi.endpoints.setRequestTime.initiate(arg));

	const rawBaseQuery = fetchBaseQuery({ baseUrl: "https://www.reddit.com/" });
	const result = await rawBaseQuery(args, api, extraOptions);

	// console.log("BaseQuery result:", result);

	// Set request ban for 403 errors and throw for other errors
	if (result.error) {
		if (result.error.status === 403 || result.error.status === "FETCH_ERROR") {
			// Set in-memory ban immediately to block any concurrent requests
			inMemoryBannedUntil = now + BAN_DURATION_MS;
			let delay = BAN_DURATION_MS;
			try {
				const resp = await api
					.dispatch(localAppApi.endpoints.setBannedUntil.initiate())
					.unwrap();
				if (resp && resp > 0) {
					delay = resp;
					inMemoryBannedUntil = now + delay;
				}
			} catch {
				// fallback to BAN_DURATION_MS already set above
			}
			return {
				error: {
					status: 403,
					data: {
						message: `Reddit has temporarily blocked further requests. Retry after ${new Date(
							inMemoryBannedUntil,
						).toLocaleString()}`,
						pendingTimestamp: inMemoryBannedUntil,
						isAppHandledError: false,
						reason: "ban",
					},
				},
			};
		} else {
			throw Object.assign(new Error(`Error communicating with Reddit.`));
		}
	}

	return result;
};

export const redditApi = createApi({
	reducerPath: "redditApi",
	baseQuery: customBaseQuery,
	endpoints: (builder) => ({
		fetchPostsBySubreddit: builder.query({
			query: (subreddit) => `r/${subreddit}.json?limit=50`,
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
				console.log(`fetchPostsBySubreddit(${arg}) fetch request started.`);

				queryFulfilled
					.then((res) => {
						console.log(`✅ fetchPostsBySubreddit(${arg}) Success:`, res);
						dispatch(
							localAppApi.endpoints.setSubredditLastUpdated.initiate(arg),
						);
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

		fetchPostAndComments: builder.query({
			query: (postId) => `comments/${postId}.json`,
			keepUnusedDataFor: 60 * 60 * 24 * 7,
			transformResponse: (
				response: PostAndCommentsResponse,
			): RedditPostAndComments => {
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
						formatCommentTree(comment.data),
					),
				};
			},
			onQueryStarted(arg, { queryFulfilled }) {
				console.log(`fetchPostAndComments(${arg}) fetch request started.`);

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
