import { ExternalLink } from "lucide-react";
import { BUBBLE_ICON, MODE } from "../../utils/types";
import PostMedia from "./PostMedia";
import { isSelfPost, isTitleAsPost, RedditPost } from "./redditTypes";
import clsx from "clsx";
import InfoBubble from "../../components/InfoBubble";
import HTML from "../../components/HTML";
import { useEffect, useRef, useState } from "react";
import redditLogo from "../../assets/reddit.svg";
import redditBlack from "../../assets/reddit-black.svg";
import useDisplay from "../../hooks/useDisplay";
import useHoverTouch from "../../hooks/useHoverTouch";
import { handleNativeShare } from "../../utils/helpers";
import { useLocation } from "react-router-dom";

const Post = ({
	post,
	toggleComments,
}: {
	post: RedditPost;
	toggleComments: () => void;
}) => {
	const location = useLocation();
	const [seeMore, setSeeMore] = useState(false);
	const scrollRef = useRef<HTMLDivElement>(null);
	const { isMobile } = useDisplay();
	const { isHovered, isClicked, eventHandlers } = useHoverTouch();

	useEffect(() => {
		if (!seeMore && scrollRef.current) {
			scrollRef.current.scrollTop = 0;
		}
	}, [seeMore]);
	return (
		<div className={clsx("flex flex-col overflow-hidden gap-1 w-full h-full")}>
			{/* Post */}
			<div
				className={clsx(
					"flex justify-center items-center overflow-hidden px-1 py-2 bg-black rounded-md flex-1 min-w-full"
				)}
			>
				{isTitleAsPost(post) ? (
					<h1>{post.title}</h1>
				) : (
					<PostMedia post={post} mode={MODE.full} />
				)}
			</div>
			{!isSelfPost(post) && post.selftext_html && (
				<div
					className="cursor-pointer bg-[#1a1a1a] rounded-md p-1 w-full max-w-[900px]"
					onClick={() => setSeeMore((prev) => !prev)}
				>
					<div
						ref={scrollRef}
						className={clsx("transition overflow-hidden ", {
							//"line-clamp-3": !seeMore,
							"line-clamp-3": !seeMore,
							"max-h-[200px] overflow-y-auto": seeMore,
						})}
					>
						<HTML text={post.selftext_html} size="sm" />
					</div>
					<p className="text-right text-sm text-blue-700">
						...{seeMore ? "less" : "more"}
					</p>
				</div>
			)}
			{/* Info Buttons */}
			<div className="flex justify-between items-center w-full  p-3">
				<div className="flex gap-3">
					<InfoBubble icon={BUBBLE_ICON.score} text={post.score} />
					<InfoBubble
						icon={BUBBLE_ICON.chat}
						text={post.num_comments}
						onClick={toggleComments}
					/>
					<InfoBubble
						icon={BUBBLE_ICON.share}
						onClick={() =>
							handleNativeShare(
								`${window.location.origin}${location.pathname}`,
								post.title
							)
						}
					/>
				</div>
				<div>
					<a
						className="flex items-center gap-1 text-[#FF4500] hover:text-blue-400"
						href={`https://www.reddit.com${post.permalink}`}
						target="_blank"
						rel="noopener noreferrer"
						{...eventHandlers}
					>
						<ExternalLink size={isMobile ? 12 : 14} />
						<p className="text-sm">reddit</p>
						<img
							src={isHovered || isClicked ? redditBlack : redditLogo}
							alt="logo"
							className={clsx("w-6 h-6 bg-blue-400 rounded-full")}
						/>
					</a>
				</div>
			</div>
		</div>
	);
};

export default Post;
