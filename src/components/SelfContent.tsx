import { MessageCircle } from "lucide-react";
import { SelfPost } from "../features/reddit/redditTypes";
import ContentBadge from "./ContentBadge";
import { ContentMode, MODE } from "../utils/types";
import HTML from "./HTML";

const demo =
	'<div class="md"><p>This is <strong>bold</strong>, <em>italic</em>, and <del>struck through</del>.</p><p>Spoiler: <span class="md-spoiler-text">Snape kills Dumbledore</span></p><p><a href="https://reddit.com/r/funny">Reddit Link</a></p><p>Code: <code>console.log("hi")</code></p><pre><code>function test() {return true;}</code></pre><blockquote><p>This is a quote block</p></blockquote><ul><li>List item 1</li><li>List item 2</li></ul><p>Here\'s a horizontal rule:</p><hr /><p>1st<sup>2</sup> = 1</p></div>';

const SelfContent = ({ post, mode }: { post: SelfPost; mode: ContentMode }) => {
	return (
		<>
			{mode === MODE.preview && (
				<div className="h-full overflow-hidden bg-black">
					<ContentBadge badge={<MessageCircle size={14} />}>
						<HTML text={post.selftext_html} />
					</ContentBadge>
				</div>
			)}
			{mode === MODE.full && (
				<div className="h-full overflow-y-auto md:max-w-[400px]">
					{console.log(post.selftext)}
					<HTML text={post.selftext_html} />
				</div>
			)}
		</>
	);
};

export default SelfContent;
