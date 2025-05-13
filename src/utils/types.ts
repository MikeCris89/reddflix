export const MODE = {
	preview: "preview",
	full: "full",
} as const;

export type ContentMode = keyof typeof MODE;

export const BUBBLE_ICON = {
	score: "score",
	chat: "chat",
	share: "share",
	link: "link",
} as const;
