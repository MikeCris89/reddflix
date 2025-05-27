import { useInView } from "react-intersection-observer";
import InfoBubble from "../../components/InfoBubble";
import { BUBBLE_ICON, MODE } from "../../utils/types";
import PostMedia from "./PostMedia";
import { isTitleAsPost, RedditPost } from "./redditTypes";
import { useEffect } from "react";
import { useSetSeenPostMutation } from "../localApp/localAppApi";

const PostCard = ({ post, sub }: { post: RedditPost; sub: string }) => {
	const [setSeenPost] = useSetSeenPostMutation();
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

	const cardStyle1 =
		"h-[400px] w-72 md:w-80 rounded-lg flex-shrink-0 overflow-hidden bg-[#242424] p-1 flex flex-col justify-between hover:scale-[1.01] hover:shadow-md transition-transform duration-150";
	const cardStyle2 =
		"h-[400px] w-80 md:w-90 flex-shrink-0 overflow-hidden flex flex-col justify-between hover:scale-[1.01] bg-[#212121] rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow text-neutral-100 ";
	const cardStyle3 =
		"h-[400px] w-80 md:w-90 flex-shrink-0 overflow-hidden flex flex-col justify-between hover:scale-[1.01] rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow text-neutral-100  bg-[#1e1e1e] border border-[#262626]";

	return (
		<>
			<div ref={ref} className={cardStyle2}>
				{!isTitleAsPost(post) && (
					<>
						<p className="text-sm font-semibold line-clamp-2 break-words leading-tight px-2 pt-1">
							{post.title}
						</p>
						<div className="flex-1 max-h-[300px]">
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
		</>
	);
};

export default PostCard;
