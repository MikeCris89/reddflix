import { useEffect, useRef } from "react";
import { decodeHtml } from "../utils/helpers";

const class2 =
	"prose prose-invert w-full max-w-none break-words overflow-wrap-break-word prose-a:break-all prose-a:text-blue-300 prose-a:no-underline hover:prose-a:underline prose-code:before:content-none prose-code:after:content-none  prose-code:text-cyan-300 prose-code:font-mono prose-code:px-1  prose-pre:bg-neutral-900 prose-pre:text-white prose-pre:rounded prose-blockquote:border-l-4 prose-blockquote:border-neutral-700 prose-blockquote:pl-4 prose-blockquote:text-neutral-400";

const HTML = ({
	text,
	size = "md",
}: {
	text: string;
	size?: "sm" | "md" | "lg";
}) => {
	const textSizeMap = {
		sm: "text-xs md:text-sm",
		md: "text-sm md:text-base",
		lg: "text-base md:text-lg",
	} as const;

	const textSize = textSizeMap[size];
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const container = ref.current;
		if (!container) return;
		// console.log("Mounted:", text.slice(0, 100));
		// console.log("links found:", container.querySelectorAll("a").length);
		// add spoiler class to spoiler tags
		const spoilers = container.querySelectorAll(".md-spoiler-text");
		const handleSpoiler = (e: Event) => {
			(e.currentTarget as HTMLElement).classList.toggle("revealed");
		};
		spoilers.forEach((spoiler) => {
			spoiler.addEventListener("click", handleSpoiler);
		});

		// stop propagation from a links
		const handleClick = (e: MouseEvent) => {
			const el = e.target as HTMLElement;
			if (el.closest("[data-clickable]")) {
				e.stopPropagation();
			}
		};

		container.addEventListener("click", handleClick);

		// console.log(ref.current);

		return () => {
			spoilers.forEach((spoiler) => {
				spoiler.removeEventListener("click", handleSpoiler);
			});
			container.removeEventListener("click", handleClick);
		};
	}, []);

	return (
		<>
			<div
				ref={ref}
				className={class2 + textSize}
				dangerouslySetInnerHTML={{ __html: decodeHtml(text) }}
			/>
		</>
	);
};

export default HTML;
