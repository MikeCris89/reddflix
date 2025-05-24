import { useInView } from "react-intersection-observer";
import InfoBubble from "../../components/InfoBubble";
import { BUBBLE_ICON, MODE } from "../../utils/types";
import PostMedia from "./PostMedia";
import { RedditPost } from "./redditTypes";
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

	return (
		<>
			<div
				ref={ref}
				className="h-[400px] w-60 sm:w-72 md:w-80 rounded-md flex-shrink-0 overflow-hidden bg-[#242424] p-1 flex flex-col justify-between"
			>
				<p className="font-bold text-sm pb-1 line-clamp-3">{post.title}</p>
				<div className="flex-1 max-h-[300px]">
					<PostMedia post={post} mode={MODE.preview} />
				</div>
				<div className="flex gap-2">
					<InfoBubble icon={BUBBLE_ICON.score} text={post.score} />
					<InfoBubble icon={BUBBLE_ICON.chat} text={post.num_comments} />
				</div>
			</div>
		</>
	);
};

export default PostCard;
