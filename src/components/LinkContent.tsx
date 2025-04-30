import { LinkPost } from "../features/reddit/redditTypes";

const LinkContent = ({ post }: { post: LinkPost }) => {
	const linkUrl = post.url_overridden_by_dest || post.url;
	const previewImage =
		post.preview?.images?.[0]?.source?.url?.replace(/&amp;/g, "&") ||
		(post.thumbnail && post.thumbnail.startsWith("http")
			? post.thumbnail
			: null);

	return (
		<div>
			{post.selftext && <p>{post.selftext}</p>}
			<a href={linkUrl} target="_blank" rel="noopener noreferrer">
				{previewImage && <img src={previewImage} alt={post.title} />}
				<p>{linkUrl}</p>
			</a>
		</div>
	);
};

export default LinkContent;
