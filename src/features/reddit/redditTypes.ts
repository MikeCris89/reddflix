export interface RedditPostsPage {
	after: string | null;
	posts: RedditPost[];
}

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

export interface RedditPost {
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
	preview?: Preview;
	post_hint?: string;
	url_overridden_by_dest?: string;
	selftext: string;
	media?: Media | null;
	gallery_data?: GalleryData;
	media_metadata?: MediaMetadata;
	[key: string]: unknown;
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

export type VideoPost = RedditPost & {
	media: { reddit_video: RedditVideo & { is_gif: false } };
};

export type GifPost = RedditPost & {
	media: { reddit_video: RedditVideo & { is_gif: true } };
};

export type ImagePost = RedditPost & { post_hint: typeof POST_TYPES.image };

export type GalleryPost = RedditPost & {
	gallery_data: GalleryData;
	media_metadata: MediaMetadata;
};

export type SelfPost = RedditPost & { thumbnail: typeof POST_TYPES.self };

export type LinkPost = RedditPost & { post_hint: typeof POST_TYPES.link };

// TYPE GUARDS
export const isVideoPost = (post: RedditPost): post is VideoPost =>
	post.media?.reddit_video?.is_gif === false;

export const isGifPost = (post: RedditPost): post is GifPost =>
	post.media?.reddit_video?.is_gif === true;

export const isImagePost = (post: RedditPost): post is ImagePost =>
	!!post.post_hint && post.post_hint === POST_TYPES.image;

export const isGalleryPost = (post: RedditPost): post is GalleryPost =>
	!!post.gallery_data && !!post.media_metadata;

export const isSelfPost = (post: RedditPost): post is SelfPost =>
	!!post.thumbnail && post.thumbnail === POST_TYPES.self;

export const isLinkPost = (post: RedditPost): post is LinkPost =>
	!!post.post_hint && post.post_hint === POST_TYPES.link;
