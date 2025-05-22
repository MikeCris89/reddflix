import { useEffect, useRef } from "react";
import { decodeHtml } from "../utils/helpers";

const demo =
	'<div class="md"><p>This is <strong>bold</strong>, <em>italic</em>, and <del>struck through</del>.</p><p>Spoiler: <span class="md-spoiler-text">Snape kills Dumbledore</span></p><p><a href="https://reddit.com/r/funny">Reddit Link</a></p><p>Code: <code>console.log("hi")</code></p><pre><code>function test() {return true;}</code></pre><blockquote><p>This is a quote block</p></blockquote><ul><li>List item 1</li><li>List item 2</li></ul><p>Here\'s a horizontal rule:</p><hr /><p>1st<sup>2</sup> = 1</p></div>';

const class2 =
	"prose prose-invert max-w-none prose-a:text-blue-400 hover:prose-a:underline prose-code:before:content-none prose-code:after:content-none  prose-code:text-cyan-300 prose-code:font-mono prose-code:px-1  prose-pre:bg-neutral-900 prose-pre:text-white prose-pre:rounded prose-blockquote:border-l-4 prose-blockquote:border-neutral-700 prose-blockquote:pl-4 prose-blockquote:text-neutral-400";

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
		console.log("Mounted:", text.slice(0, 100));
		console.log("links found:", container.querySelectorAll("a").length);
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

		console.log(ref.current);

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
