export interface RedditPostsPage {
	after: string | null;
	posts: RedditPost[];
}

export interface RedditPostAndComments {
	post: RedditPost;
	comments: RedditCommentFormatted[];
}

export interface RedditComment {
	id: string;
	author: string;
	body: string;
	body_html: string;
	score: number;
	is_submitter: boolean;
	created_utc: number;
	replies:
		| {
				data: {
					children: { kind: string; data: RedditComment }[];
				};
		  }
		| "";
	distinguished: "moderator" | "admin" | "special" | null;
	parent_id: string;
	permalink: string;
	[key: string]: unknown;
}

export interface RefinedCommentBase {
	id: string;
	author: string;
	body: string;
	body_html: string;
	distinguished: "moderator" | "admin" | "special" | null;
	score: number;
	is_submitter: boolean;
	created_utc: number;
	parent_id: string;
	permalink: string;
}

export type RedditCommentFormatted = RefinedCommentBase & {
	replies: RedditCommentFormatted[];
};

export interface RedditListing<T> {
	kind: string;
	data: {
		after: string | null;
		before: string | null;
		children: Array<{
			kind: string;
			data: T;
		}>;
	};
}

export interface RedditThing<T> {
	kind: "t1" | "more" | string;
	data: T;
}

export type PostAndCommentsResponse = [
	RedditListing<RawRedditPost>,
	RedditListing<RedditComment>
];

export interface RawRedditPost {
	id: string;
	title: string;
	subreddit: string;
	thumbnail?: string;
	url?: string;
	permalink: string;
	author: string;
	score: number;
	num_comments: number;
	created_utc: number;
	over_18: boolean;
	is_video: boolean;
	is_self: boolean;
	preview?: Preview;
	post_hint?: string;
	url_overridden_by_dest?: string;
	selftext: string;
	selftext_html: string;
	media?: Media | null;
	secure_media?: Media | null;
	gallery_data?: GalleryData;
	media_metadata?: MediaMetadata;
	stickied: boolean;
	crosspost_parent_list?: RedditPost[];
	[key: string]: unknown;
}

export interface RedditPost {
	id: string;
	title: string;
	subreddit: string;
	thumbnail?: string;
	url?: string;
	permalink: string;
	author: string;
	created_utc: number;
	score: number;
	num_comments: number;
	post_hint?: string;
	media?: RawRedditPost["media"];
	media_metadata?: RawRedditPost["media_metadata"];
	gallery_data?: RawRedditPost["gallery_data"];
	secure_media?: RawRedditPost["secure_media"];
	preview?: Preview;
	is_video: boolean;
	is_self: boolean;
	selftext: string;
	selftext_html: string;
	url_overridden_by_dest?: string;
	type: keyof typeof POST_TYPES;
}

export interface GalleryData {
	items: GalleryItem[];
}

export interface GalleryItem {
	media_id: string;
	id: number;
}

export interface MediaMetadata {
	[mediaId: string]: MediaMetadataItem;
}

export interface MediaMetadataItem {
	status: "valid" | "failed"; // Mostly "valid"
	e: "Image"; // Always "Image" for now
	m: string; // MIME type like "image/jpeg" or "image/png"
	p: MediaPreview[]; // Array of smaller resolution previews
	s: MediaSource; // Full-size image
	id: string;
}

export interface MediaPreview {
	u: string; // URL
	x: number; // width
	y: number; // height
}

export interface MediaSource {
	u: string; // URL
	x: number; // width
	y: number; // height
}

export interface Preview {
	images: Image[];
	enabled: boolean;
}

export interface Image {
	source: Source;
	resolutions: Source[];
	variants: Gildings;
	id: string;
}

export interface Source {
	url: string;
	width: number;
	height: number;
}

export interface Gildings {
	[key: string]: number;
}

export interface Media {
	reddit_video?: RedditVideo;
}

export interface RedditVideo {
	fallback_url: string;
	height: number;
	width: number;
	scrubber_media_url: string;
	dash_url: string;
	duration: number;
	hls_url: string;
	is_gif: boolean;
	transcoding_status: string;
}

// POST TYPES

export const POST_TYPES = {
	gif: "gif",
	video: "video",
	image: "image",
	gallery: "gallery",
	link: "link",
	self: "self",
	unknown: "unknown",
} as const;

export type PostType = keyof typeof POST_TYPES;

export type VideoPost = RedditPost & {
	type: typeof POST_TYPES.video;
	media?: { reddit_video: RedditVideo & { is_gif: false } };
	url?: string; // fallback for external .mp4
};

export type GifPost = RedditPost & {
	type: typeof POST_TYPES.gif;
	media?: { reddit_video: RedditVideo & { is_gif: true } };
	url?: string; // fallback for .gifv
};

export type ImagePost = RedditPost & {
	type: typeof POST_TYPES.image;
	post_hint?: typeof POST_TYPES.image;
	url: string;
};

export type GalleryPost = RedditPost & {
	type: typeof POST_TYPES.gallery;
	gallery_data: GalleryData;
	media_metadata: MediaMetadata;
};

export type SelfPost = RedditPost & {
	type: typeof POST_TYPES.self;
	is_self: true;
};

export type LinkPost = RedditPost & {
	type: typeof POST_TYPES.link;
	url: string;
	post_hint?: typeof POST_TYPES.link;
};

export type UnknownPost = RedditPost & {
	type: typeof POST_TYPES.unknown;
};

// TYPE GUARDS
export const isVideoPost = (
	post: RedditPost | RawRedditPost
): post is VideoPost =>
	post.media?.reddit_video?.is_gif === false ||
	(post.url?.endsWith(".mp4") ?? false);

export const isGifPost = (post: RedditPost | RawRedditPost): post is GifPost =>
	post.media?.reddit_video?.is_gif === true ||
	(post.url?.endsWith(".gifv") ?? false);

export const isImagePost = (
	post: RedditPost | RawRedditPost
): post is ImagePost =>
	!isVideoPost(post) &&
	!isGifPost(post) &&
	(post.post_hint === POST_TYPES.image ||
		/\.(gif|jpg|jpeg|png|webp)$/i.test(post.url ?? ""));

export const isGalleryPost = (
	post: RedditPost | RawRedditPost
): post is GalleryPost => !!post.gallery_data && !!post.media_metadata;

export const isSelfPost = (
	post: RedditPost | RawRedditPost
): post is SelfPost => post.is_self === true;

export const isLinkPost = (
	post: RedditPost | RawRedditPost
): post is LinkPost =>
	!isVideoPost(post) &&
	!isGifPost(post) &&
	!isImagePost(post) &&
	!isGalleryPost(post) &&
	!isSelfPost(post) &&
	!!post.url &&
	!post.url.includes("reddit.com") &&
	!post.url.includes("redd.it");

export const isValidRedditComment = (
	c: RedditThing<RedditComment>
): boolean => {
	if (!c || typeof c !== "object") return false;
	if (c.kind === "more") return false;
	const data = c.data;
	if (!data) return false;
	// If these are missing, it's a stub
	return (
		typeof data.id === "string" &&
		typeof data.author === "string" &&
		typeof data.body === "string"
	);
};
