import { Category } from "../utils/types";

export const defaultCategories: Category[] = [
	{
		title: "Funny",
		active: true,
		keywords: "funny memes jokes humor hilarious standup comedy",
		subreddits: ["funny", "memes", "comedyheaven"],
		ttl: 0,
	},
	{
		title: "Wholesome",
		active: true,
		keywords: "wholesome uplifting kind positive feelgood heartwarming",
		ttl: 0,
	},
	{
		title: "Nature & Animals",
		active: false,
		keywords: "nature wildlife animals cute dogs cats ocean forest birds",
		ttl: 0,
	},
	{
		title: "Tech & Gadgets",
		active: true,
		keywords: "technology gadgets innovation hardware software programming ai",
		ttl: 0,
	},
	{
		title: "Movies & TV",
		active: true,
		keywords: "movies tv shows film series trailers actors directors netflix",
		ttl: 0,
	},
	{
		title: "Gaming",
		active: true,
		keywords: "gaming videogames pc ps5 xbox nintendo gameplay esports mods",
		ttl: 0,
	},
	{
		title: "DIY & Crafts",
		active: false,
		keywords: "diy crafts handmade woodworking home improvement projects",
		ttl: 0,
	},
	{
		title: "Art & Design",
		active: false,
		keywords: "art design digitalart illustration drawing painting aesthetic",
		ttl: 0,
	},
	{
		title: "News & World Events",
		active: true,
		keywords: "news world politics current events global economy war headlines",
		ttl: 0,
	},
	{
		title: "Fitness & Motivation",
		active: false,
		keywords:
			"fitness motivation gym workout health wellness discipline progress",
		ttl: 0,
	},
	{
		title: "Programming",
		keywords:
			"programming code developer coding dev javascript python typescript rust c++ webdev backend frontend vscode typescript devhelp",
		active: false,
		ttl: 0,
	},
	{
		title: "Inspiration",
		subreddits: ["GetMotivated", "UpliftingNews", "quotes"],
		active: true,
		ttl: 0,
	},
];
