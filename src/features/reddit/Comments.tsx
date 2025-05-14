import { useParams } from "react-router-dom";
import { useFetchPostAndCommentsQuery } from "./redditApi";
import { RedditCommentFormatted } from "./redditTypes";
import InfoBubble from "../../components/InfoBubble";
import { BUBBLE_ICON } from "../../utils/types";
import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { ArrowBigUpDashIcon, ArrowDown, ArrowUp } from "lucide-react";

const getDescendants = (comment: RedditCommentFormatted): string[] => {
	const desc: string[] = [];

	const walk = (comm: RedditCommentFormatted[]) => {
		comm.forEach((c) => {
			desc.push(c.id);
			if (c.replies && c.replies.length) {
				walk(c.replies);
			}
		});
	};

	walk(comment.replies);

	return desc;
};

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
}: {
	comments: RedditCommentFormatted[];
	expanded: Set<string>;
	toggleExpanded: (id: string, desc: string[]) => void;
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
								onClick={() =>
									toggleExpanded(comment.id, getDescendants(comment))
								}
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

const CommentThread = ({ comment }: { comment: RedditCommentFormatted }) => {
	const [expanded, setExpanded] = useState<Set<string>>(new Set());
	const isExpanded = expanded.has(comment.id);

	const toggleExpanded = (id: string, desc: string[] = []) => {
		setExpanded((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(id)) {
				newSet.delete(id);
				desc.forEach((desc) => newSet.delete(desc));
			} else newSet.add(id);
			return newSet;
		});
	};

	return (
		<>
			<div className="flex flex-col gap-3 w-full">
				<div
					className={clsx(
						comment.replies.length > 0 ? "cursor-pointer" : "cursor-default"
					)}
					onClick={() => toggleExpanded(comment.id, getDescendants(comment))}
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
		</>
	);
};

const Comments = () => {
	const { postId } = useParams();
	const PAGE_SIZE = 20;
	const [page, setPage] = useState(0);

	const commRef = useRef<HTMLDivElement>(null);

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

	useEffect(() => {
		const el = commRef.current;
		if (el) {
			requestAnimationFrame(() => {
				el.scrollTop = 0;
				el.focus();
			});
		}
	}, [page]);

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
	if (!comments || comments.length === 0)
		return (
			<div className=" h-full w-full p-1">
				<h3 className="text-lg text-center">No Comments</h3>
			</div>
		);

	const section = page * PAGE_SIZE;
	const maxPages = Math.max(0, Math.floor(comments.length / PAGE_SIZE) - 1);

	return (
		<div
			ref={commRef}
			className="h-full w-full overflow-y-auto overflow-x-hidden min-h-0 p-1 "
			tabIndex={-1}
		>
			{comments && (
				<>
					{page !== 0 && (
						<PageButtons
							dir="prev"
							page={page}
							setPage={setPage}
							max={maxPages}
						/>
					)}

					{comments
						.slice(section, section + PAGE_SIZE)
						.map((c: RedditCommentFormatted) => (
							<CommentThread key={c.id} comment={c} />
						))}

					{comments.length > PAGE_SIZE && (
						<PageButtons
							dir="next"
							page={page}
							setPage={setPage}
							max={maxPages}
						/>
					)}
				</>
			)}
		</div>
	);
};

export default Comments;

const PageButtons = ({
	dir,
	page,
	setPage,
	max,
}: {
	dir: "next" | "prev";
	page: number;
	setPage: React.Dispatch<React.SetStateAction<number>>;
	max: number;
}) => {
	const handleNext = () => {
		setPage((prev) => Math.min(max, prev + 1));
	};
	const handlePrev = () => {
		setPage((prev) => Math.max(0, prev - 1));
	};
	const handleTop = () => {
		setPage(0);
	};

	const lastPage = page === max;

	return (
		<div className="grid grid-cols-3 p-4">
			<div></div>
			{dir === "next" ? (
				<button
					onClick={handleNext}
					className={clsx("flex gap-2 p-4 w-full justify-center")}
					disabled={lastPage}
				>
					<ArrowDown />
					<p>View More </p>
				</button>
			) : (
				<button
					onClick={handlePrev}
					className="flex gap-2 p-4 w-full justify-center"
				>
					<ArrowUp />
					<p>View Previous</p>
				</button>
			)}
			{page > 1 && (
				<button onClick={handleTop} className="flex gap-2 justify-self-end">
					<ArrowBigUpDashIcon />
					<p>Top</p>
				</button>
			)}
		</div>
	);
};
