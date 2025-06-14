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

interface PostCardProps {
	post: RedditPost;
	sub: string;
	className?: string;
}

const PostCard = forwardRef<HTMLDivElement, PostCardProps>((props, postRef) => {
	const { post, sub, className } = props;
	const [setSeenPost] = useSetSeenPostMutation();
	const { isMobile, isPortrait } = useDisplay();
	const navigate = useNavigate();
	const location = useLocation();
	const { ref, inView } = useInView({
		triggerOnce: true,
		threshold: 0.5,
		delay: 200,
	});

	useEffect(() => {
		if (inView) {
			setSeenPost({ subreddit: sub, postId: post.id });
		}
	}, [inView, setSeenPost, post, sub]);

	const cardStyle2 = ` ${
		isMobile && !isPortrait ? "h-[300px] p-2" : "h-[400px] p-3"
	} w-72 md:w-80 flex-shrink-0 overflow-hidden flex flex-col justify-between  bg-[#212121] rounded-xl text-neutral-100
		shadow-[0_10px_24px_rgba(0,0,0,0.5)] hover:shadow-[0_14px_30px_rgba(0,0,0,0.7)] hover:scale-[1.02]
		active:scale-[0.97] active:shadow-[0_6px_20px_rgba(0,0,0,0.5)]
		transition-all duration-200 ease-in-out`;
	//shadow-lg shadow-black hover:shadow-xl hover:shadow-black

	return (
		<div
			ref={postRef}
			className={clsx(
				"h-full cursor-pointer  " + " " + className,
				isMobile ? "snap-center pt-3 pb-5" : "snap-start pt-5 pb-7"
			)}
			onClick={() => {
				// setTimeout(
				// 	() =>
				navigate(`/${sub}/${post.id}`, {
					state: { backgroundLocation: location },
				});
				// 	50
				// );
			}}
		>
			<div ref={ref} className={cardStyle2}>
				{!isTitleAsPost(post) && (
					<>
						<p
							className={clsx(
								"text-sm font-semibold line-clamp-2 break-words leading-tight  shadow-neutral-600",
								!isMobile && "px-2 pt-1"
							)}
						>
							{post.title}
						</p>
						<div
							className={clsx(
								"flex-1 max-h-[300px]",
								isMobile && "max-h-[80%]"
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
