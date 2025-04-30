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

export const getPostType = (post: RedditPost): keyof typeof POST_TYPES => {
	if (isVideoPost(post)) return POST_TYPES.video;
	if (isGifPost(post)) return POST_TYPES.gif;
	if (isImagePost(post)) return POST_TYPES.image;
	if (isGalleryPost(post)) return POST_TYPES.gallery;
	if (isLinkPost(post)) return POST_TYPES.link;
	if (isSelfPost(post)) return POST_TYPES.self;
	return POST_TYPES.unknown;
};
