import { RedditPost } from "../features/reddit/redditTypes";

// NOT WORKING PROPERLY

export const imagePost = {
	id: "1cnswpb",
	title: "My dog baking in the sun",
	subreddit: "pics",
	thumbnail: "https://b.thumbs.redditmedia.com/abc12345.jpg",
	url: "https://i.redd.it/jg6g6fb6z3xc1.jpg",
	permalink: "/r/pics/comments/1cnswpb/my_dog_baking_in_the_sun/",
	author: "doglover123",
	score: 1234,
	num_comments: 45,
	created_utc: 1715092340,
	over_18: false,
	is_video: false,
	post_hint: "image",
	url_overridden_by_dest: undefined,
	selftext: "",
	media: null,
	preview: {
		images: [
			{
				source: {
					url: "https://preview.redd.it/jg6g6fb6z3xc1.jpg?width=1080&format=pjpg&auto=webp&s=abcdef123456",
					width: 1080,
					height: 720,
				},
				resolutions: [],
				id: "abc123",
			},
		],
		enabled: true,
	},
	gallery_data: undefined,
	media_metadata: undefined,
};

export const videoPost = {
	id: "1cph5gq",
	title: "Closeup of a chef making crab butter pasta",
	subreddit: "nextfuckinglevel",
	thumbnail: "https://b.thumbs.redditmedia.com/xyz98765.jpg",
	url: "https://v.redd.it/rvpua93xijxe1",
	permalink:
		"/r/nextfuckinglevel/comments/1cph5gq/closeup_of_a_chef_making_a_crab_butter_pasta/",
	author: "foodmaster",
	score: 4321,
	num_comments: 67,
	created_utc: 1715100000,
	over_18: false,
	is_video: true,
	post_hint: "hosted:video",
	url_overridden_by_dest: undefined,
	selftext: "",
	media: {
		reddit_video: {
			fallback_url:
				"https://v.redd.it/rvpua93xijxe1/DASH_720.mp4?source=fallback",
			height: 720,
			width: 1280,
			scrubber_media_url: "https://v.redd.it/rvpua93xijxe1/DASH_96.mp4",
			dash_url: "https://v.redd.it/rvpua93xijxe1/DASHPlaylist.mpd",
			duration: 12,
			hls_url: "https://v.redd.it/rvpua93xijxe1/HLSPlaylist.m3u8",
			is_gif: false,
			transcoding_status: "completed",
		},
	},
	preview: undefined,
	gallery_data: undefined,
	media_metadata: undefined,
} satisfies RedditPost;

export const textPost = {
	id: "1cmi00n",
	title: "What is a fun fact about the country you live in?",
	subreddit: "AskReddit",
	thumbnail: "self",
	url: undefined,
	permalink:
		"/r/AskReddit/comments/1cmi00n/what_is_a_fun_fact_about_the_country_you_live_in/",
	author: "curiouscat",
	score: 512,
	num_comments: 120,
	created_utc: 1715080000,
	over_18: false,
	is_video: false,
	post_hint: "self",
	url_overridden_by_dest: undefined,
	selftext:
		"In Canada, we have a place called 'Dildo.' Yes, it's a real town in Newfoundland.",
	media: null,
	preview: undefined,
	gallery_data: undefined,
	media_metadata: undefined,
} satisfies RedditPost;

export const gifPost = {
	id: "1cfvobd",
	title: "The most amazing card trick I've ever seen",
	subreddit: "gifs",
	thumbnail: "https://b.thumbs.redditmedia.com/efg67890.jpg",
	url: "https://v.redd.it/abcd1234",
	permalink:
		"/r/gifs/comments/1cfvobd/the_most_amazing_card_trick_ive_ever_seen/",
	author: "magicianfan",
	score: 3200,
	num_comments: 210,
	created_utc: 1715070000,
	over_18: false,
	is_video: true,
	post_hint: "hosted:video",
	url_overridden_by_dest: undefined,
	selftext: "",
	media: {
		reddit_video: {
			fallback_url: "https://v.redd.it/abcd1234/DASH_480.mp4?source=fallback",
			height: 480,
			width: 854,
			scrubber_media_url: "https://v.redd.it/abcd1234/DASH_96.mp4",
			dash_url: "https://v.redd.it/abcd1234/DASHPlaylist.mpd",
			duration: 6,
			hls_url: "https://v.redd.it/abcd1234/HLSPlaylist.m3u8",
			is_gif: true,
			transcoding_status: "completed",
		},
	},
	preview: undefined,
	gallery_data: undefined,
	media_metadata: undefined,
} satisfies RedditPost;

export const galleryPost = {
	id: "1cgswqv",
	title: "15 Years of Art Progress",
	subreddit: "pics",
	thumbnail: "https://b.thumbs.redditmedia.com/gallerythumb.jpg",
	url: undefined,
	permalink: "/r/pics/comments/1cgswqv/15_years_of_art_progress/",
	author: "artistjourney",
	score: 5000,
	num_comments: 88,
	created_utc: 1715050000,
	over_18: false,
	is_video: false,
	post_hint: "rich:gallery",
	url_overridden_by_dest: undefined,
	selftext: "",
	media: null,
	preview: undefined,
	gallery_data: {
		items: [
			{ media_id: "abcd1234", id: 1 },
			{ media_id: "efgh5678", id: 2 },
		],
	},
	media_metadata: {
		abcd1234: {
			status: "valid",
			e: "Image",
			m: "image/jpeg",
			id: "abcd1234",
			p: [],
			s: {
				u: "https://preview.redd.it/abcd1234.jpg?width=1080&format=jpg&auto=webp&s=abcdef123456",
				x: 1080,
				y: 720,
			},
		},
		efgh5678: {
			status: "valid",
			e: "Image",
			m: "image/jpeg",
			id: "efgh5678",
			p: [],
			s: {
				u: "https://preview.redd.it/efgh5678.jpg?width=1080&format=jpg&auto=webp&s=123456abcdef",
				x: 1080,
				y: 720,
			},
		},
	},
} satisfies RedditPost;

export const linkPost = {
	id: "1ck1q2w",
	title: "NASA releases stunning images of Jupiter",
	subreddit: "worldnews",
	thumbnail: "https://b.thumbs.redditmedia.com/xyz99999.jpg",
	url: "https://www.nasa.gov/jupiter-images-collection",
	permalink:
		"/r/worldnews/comments/1ck1q2w/nasa_releases_stunning_images_of_jupiter/",
	author: "spacenews",
	score: 2100,
	num_comments: 54,
	created_utc: 1715060000,
	over_18: false,
	is_video: false,
	post_hint: "link",
	url_overridden_by_dest: "https://www.nasa.gov/jupiter-images-collection",
	selftext: "",
	media: null,
	preview: undefined,
	gallery_data: undefined,
	media_metadata: undefined,
} satisfies RedditPost;

export const testRedditListing = {
	after: null,
	posts: [imagePost, videoPost, textPost, gifPost, galleryPost, linkPost],
};
