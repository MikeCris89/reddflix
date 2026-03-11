import { useInView } from "react-intersection-observer";
import InfoBubble from "../../components/InfoBubble";
import { BUBBLE_ICON, MODE } from "../../utils/types";
import PostMedia from "./PostMedia";
import { isTitleAsPost, RedditPost } from "./redditTypes";
import { forwardRef, useEffect } from "react";
import { useSetSeenPostMutation } from "../localApp/localAppApi";
import { useLocation, useNavigate } from "react-router-dom";
import clsx from "clsx";
import useDisplay from "../../hooks/useDisplay";
import { relativeTime } from "../../utils/helpers";

interface PostCardProps {
	post: RedditPost;
	sub: string;
	isSeen?: boolean;
	className?: string;
}

const PostCard = forwardRef<HTMLDivElement, PostCardProps>((props, postRef) => {
	const { post, sub, isSeen, className } = props;
	const [setSeenPost] = useSetSeenPostMutation();
	const { isMobile, isPortrait } = useDisplay();
	const navigate = useNavigate();
	const location = useLocation();
	const { ref, inView } = useInView({
		triggerOnce: true,
		threshold: 0.5,
		delay: 200,
	});

	const isSample = post.sample === true;

	useEffect(() => {
		if (inView) {
			setSeenPost({ subreddit: sub, postId: post.id });
		}
	}, [inView, setSeenPost, post, sub]);

	const cardStyle2 = ` ${
		isMobile && !isPortrait ? "h-[300px] p-2" : "h-[400px] p-3"
	} w-72 md:w-80 flex-shrink-0 overflow-hidden flex flex-col justify-between bg-[#212121] rounded-xl text-neutral-100
		shadow-[0_10px_24px_rgba(0,0,0,0.5)] hover:shadow-[0_14px_30px_rgba(0,0,0,0.7)] hover:scale-[1.02]
		active:scale-[0.97] active:shadow-[0_6px_20px_rgba(0,0,0,0.5)]
		transition-all duration-200 ease-in-out`;

	return (
		<div
			ref={postRef}
			className={clsx(
				"h-full cursor-pointer  " + " " + className,
				isMobile ? "snap-center pt-3 pb-5" : "snap-start pt-5 pb-7",
			)}
			onClick={() => {
				navigate(`/${sub}/${post.id}`, {
					state: { backgroundLocation: location },
				});
			}}
		>
			<div ref={ref} className={cardStyle2 + " relative"}>
				{/* Top-right badges — "seen" for all, + time for isTitleAsPost */}
				<div className="w-full flex flex-col items-end gap-0.5">
					<div className={clsx("flex w-full justify-between items-center")}>
						<span className="text-[10px] font-medium text-zinc-400 leading-none">
							{isSample && "sample"}
						</span>
						<span className="text-[10px] font-medium text-green-400 leading-none ">
							{isSeen && "seen"}
						</span>
					</div>
					{isTitleAsPost(post) && (
						<span className="text-[10px] text-zinc-500 leading-none">
							{relativeTime(post.created_utc)}
						</span>
					)}
				</div>

				{!isTitleAsPost(post) && (
					<>
						<div
							className={clsx(
								"flex justify-between items-start gap-2",
								!isMobile && "px-2 pt-1",
							)}
						>
							<p className="text-sm font-semibold line-clamp-2 break-words leading-tight min-w-0 flex-1 shadow-neutral-600">
								{post.title}
							</p>
							<span className="text-[11px] shrink-0 mt-0.5 text-zinc-500">
								{relativeTime(post.created_utc)}
							</span>
						</div>
						<div
							className={clsx(
								"flex-1 max-h-[300px]",
								isMobile && "max-h-[80%]",
							)}
						>
							<PostMedia post={post} mode={MODE.preview} />
						</div>
					</>
				)}
				{isTitleAsPost(post) && (
					<>
						<div></div>
						<p className="font-bold text-xl pb-1 line-clamp-10">{post.title}</p>
					</>
				)}
				<div className="flex gap-2">
					<InfoBubble icon={BUBBLE_ICON.score} text={post.score} size="md" />
					<InfoBubble
						icon={BUBBLE_ICON.chat}
						text={post.num_comments}
						size="md"
					/>
				</div>
			</div>
		</div>
	);
});

PostCard.displayName = "PostCard";

export default PostCard;
