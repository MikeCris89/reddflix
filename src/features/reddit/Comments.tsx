import { useParams } from "react-router-dom";
import { useFetchPostAndCommentsQuery } from "./redditApi";
import { RedditCommentFormatted } from "./redditTypes";
import InfoBubble from "../../components/InfoBubble";
import { BUBBLE_ICON } from "../../utils/types";
import { useMemo, useState } from "react";
import clsx from "clsx";

const CommentCard = ({ c }: { c: RedditCommentFormatted }) => {
	return (
		<div className="bg-[#1a1a1a] rounded-md p-2 w-full">
			<p className="text-xs">
				u/{c.author}
				{c.is_submitter && <span className="text-green-400">OP</span>}
			</p>
			<p className="text-sm font-semibold p-0.5">{c.body}</p>
			<div className="flex gap-3">
				<InfoBubble icon={BUBBLE_ICON.score} text={c.score} size="sm" />
				<InfoBubble icon={BUBBLE_ICON.chat} text={c.replies.length} size="sm" />
			</div>
		</div>
	);
};

const RecursiveComments = ({
	comments,
	expanded,
	toggleExpanded,
	children,
}: {
	comments: RedditCommentFormatted[];
	expanded: Set<string>;
	toggleExpanded: (id: string) => void;
	children?: React.ReactNode;
}) => {
	return (
		<div className="flex flex-col gap-2 justify-center items-center w-full">
			{comments.length &&
				comments.map((comment) => {
					if (comment.distinguished) return null;
					const isExpanded = expanded.has(comment.id);

					return (
						<div className="flex flex-col gap-3 w-full" key={comment.id}>
							<div
								className={clsx(
									comment.replies.length > 0
										? "cursor-pointer"
										: "cursor-default"
								)}
								onClick={() => toggleExpanded(comment.id)}
							>
								<CommentCard c={comment} />
							</div>
							{isExpanded && comment.replies.length > 0 && (
								<div className="pl-3">
									<RecursiveComments
										comments={comment.replies}
										expanded={expanded}
										toggleExpanded={toggleExpanded}
									/>
								</div>
							)}
						</div>
					);
				})}
		</div>
	);
};

const buildDescendantMap = (
	comments: RedditCommentFormatted[] | undefined
): Record<string, string[]> => {
	const map: Record<string, string[]> = {};

	const buildMap = (comm: RedditCommentFormatted[]): string[] => {
		const allDesc: string[] = [];

		comm.map((c) => {
			const nested: string[] = [];
			if (c.replies.length) {
				c.replies.forEach((reply) => nested.push(reply.id));
				nested.push(...buildMap(c.replies));
			}
			map[c.id] = nested;
			allDesc.push(c.id, ...nested);
		});
		return allDesc;
	};

	if (comments) buildMap(comments);

	return map;
};

const Comments = () => {
	const { postId } = useParams();
	const [expanded, setExpanded] = useState<Set<string>>(new Set());
	const {
		data: comments,
		isLoading,
		error,
	} = useFetchPostAndCommentsQuery(postId, {
		refetchOnMountOrArgChange: false,
		refetchOnReconnect: false,
		refetchOnFocus: false,
		selectFromResult: ({ data, isLoading, error }) => ({
			data: data?.comments,
			isLoading,
			error,
		}),
	});

	const descendantMap = useMemo(() => buildDescendantMap(comments), [comments]);

	console.log(descendantMap);

	const toggleExpanded = (id: string) => {
		setExpanded((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(id)) {
				newSet.delete(id);
				descendantMap[id].forEach((desc) => newSet.delete(desc));
			} else newSet.add(id);
			return newSet;
		});
	};

	if (error) {
		const errMsg =
			"status" in error
				? typeof error.data === "string"
					? error.data
					: JSON.stringify(error.data)
				: error.message || "Unknown error";

		return <p>Error: {errMsg}</p>;
	}
	if (isLoading) return <p>Loading...</p>;
	//console.log(comments);

	return (
		<div className=" h-full w-full p-1">
			{comments &&
				(comments.length === 0 ? (
					<h3 className="text-lg text-center">No Comments</h3>
				) : (
					<RecursiveComments
						comments={comments}
						expanded={expanded}
						toggleExpanded={toggleExpanded}
					/>
				))}
		</div>
	);
};

export default Comments;
