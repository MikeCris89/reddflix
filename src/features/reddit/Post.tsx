import { ArrowBigUp, ExternalLink, MessageCircle, Share2 } from "lucide-react";
import { MODE } from "../../utils/types";
import PostMedia from "./PostMedia";
import { RedditPost } from "./redditTypes";
import clsx from "clsx";
import { getCreatedTime } from "../../utils/helpers";

const Info = ({
	children,
	icon,
	text,
	onClick,
}: {
	children?: React.ReactNode;
	icon?: React.ReactNode;
	text?: string | number;
	onClick?: () => void;
}) => {
	return (
		<div
			className={clsx(
				"rounded-3xl bg-[#242424] px-3 py-1 box-shadow-thin",
				onClick ? "cursor-pointer" : "cursor-default"
			)}
			onClick={onClick}
		>
			<div className="flex items-center justify-center gap-1">
				{icon}
				<p className="text-sm font-semibold">{text}</p>
				{children}
			</div>
		</div>
	);
};

const Post = ({ post }: { post: RedditPost }) => {
	return (
		<>
			<div className="flex justify-start items-center gap-1 w-full pl-1">
				<p className="text-sm">r/{post.subreddit}</p>
				<p>&#8226;</p>
				<p className="text-xs">{getCreatedTime(post.created_utc)}</p>
			</div>
			<h2 className="text-lg font-semibold w-full pl-1">{post.title}</h2>
			<div className="flex justify-center items-center overflow-hidden px-1 py-2 w-full h-full bg-black rounded-md my-4">
				<PostMedia post={post} mode={MODE.full} />
			</div>
			<div className="flex justify-between w-full">
				<div className="flex gap-2">
					<Info icon={<ArrowBigUp size={22} />} text={post.score} />
					<Info icon={<MessageCircle size={22} />} text={post.num_comments} />
					<Info icon={<Share2 size={22} />} />
				</div>
				<a
					className="self-end flex gap-2"
					href={`https://www.reddit.com${post.permalink}`}
					target="_blank"
					rel="noopener noreferrer"
				>
					{/* <Info icon={<ExternalLink />} text={"Reddit"} /> */}
					<ExternalLink />
					<p>Reddit</p>
				</a>
			</div>
		</>
	);
};

export default Post;
