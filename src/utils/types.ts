export const MODE = {
	preview: "preview",
	full: "full",
} as const;

export type ContentMode = keyof typeof MODE;
