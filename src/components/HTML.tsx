import { decodeHtml } from "../utils/helpers";

const HTML = ({ text, size = "md" }: { text: string; size?: string }) => {
	const textSize = "";
	return (
		<>
			<div
				className="prose prose-invert max-w-none text-2xl md:text-lg"
				dangerouslySetInnerHTML={{ __html: decodeHtml(text) }}
			/>
		</>
	);
};

export default HTML;
