import {
	isGalleryPost,
	isGifPost,
	isImagePost,
	isLinkPost,
	isSelfPost,
	isVideoPost,
	POST_TYPES,
	RedditPost,
} from "../features/reddit/redditTypes";

// export const getPostType2 = (post: RedditPost): keyof typeof POST_TYPES => {
// 	if (post.media?.reddit_video) {
// 		if (post.media.reddit_video.is_gif) return POST_TYPES.gif;
// 		return POST_TYPES.video;
// 	}
// 	if (post.post_hint) {
// 		if (post.post_hint === POST_TYPES.image) return POST_TYPES.image;
// 		if (post.post_hint === POST_TYPES.link) return POST_TYPES.link;
// 	}
// 	if (post.thumbnail && post.thumbnail === POST_TYPES.self)
// 		return POST_TYPES.self;
// 	if (post.gallery_data && post.media_metadata) return POST_TYPES.gallery;
// 	return POST_TYPES.unknown;
// };

export const getPostType = (post: RedditPost): keyof typeof POST_TYPES => {
	if (isVideoPost(post)) return POST_TYPES.video;
	if (isGifPost(post)) return POST_TYPES.gif;
	if (isImagePost(post)) return POST_TYPES.image;
	if (isGalleryPost(post)) return POST_TYPES.gallery;
	if (isLinkPost(post)) return POST_TYPES.link;
	if (isSelfPost(post)) return POST_TYPES.self;
	return POST_TYPES.unknown;
};
