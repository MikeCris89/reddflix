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

// export const getPostType = (post: RedditPost): keyof typeof POST_TYPES => {
// 	if (isVideoPost(post)) return POST_TYPES.video;
// 	if (isGifPost(post)) return POST_TYPES.gif;
// 	if (isImagePost(post)) return POST_TYPES.image;
// 	if (isGalleryPost(post)) return POST_TYPES.gallery;
// 	if (isSelfPost(post)) return POST_TYPES.self;
// 	if (isLinkPost(post)) return POST_TYPES.link;
// 	return POST_TYPES.unknown;
// };

export const getPostType = (post: RedditPost): keyof typeof POST_TYPES => {
	const types: (keyof typeof POST_TYPES)[] = [];

	if (isVideoPost(post)) types.push(POST_TYPES.video);
	if (isGifPost(post)) types.push(POST_TYPES.gif);
	if (isImagePost(post)) types.push(POST_TYPES.image);
	if (isGalleryPost(post)) types.push(POST_TYPES.gallery);
	if (isSelfPost(post)) types.push(POST_TYPES.self);
	if (isLinkPost(post)) types.push(POST_TYPES.link);

	if (types.length > 1) {
		console.warn("⚠️ Post matched multiple types:", types, post);
	}

	return types[0] ?? POST_TYPES.unknown;
};
