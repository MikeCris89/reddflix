import { useLocation, useParams } from "react-router-dom";
import { useFetchPostAndCommentsQuery } from "./redditApi";
import { RedditCommentFormatted } from "./redditTypes";
import InfoBubble from "../../components/InfoBubble";
import { BUBBLE_ICON, isAppHandledError } from "../../utils/types";
import { useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import {
	ArrowBigUpDashIcon,
	ArrowDown,
	ArrowLeft,
	ArrowUp,
	MinusCircle,
} from "lucide-react";
import useDisplay from "../../hooks/useDisplay";
import HTML from "../../components/HTML";
import {
	getCreatedTime,
	getFallbackComments,
	hasCommentFallback,
} from "../../utils/helpers";
import { motion, AnimatePresence } from "framer-motion";
import Spinner from "../../components/Spinner";
import QueryErrorMessage from "../../components/QueryErrorMessage";
import { skipToken } from "@reduxjs/toolkit/query";

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

const CommentCard = ({
	c,
	oc,
	onClick,
	ref,
}: {
	c: RedditCommentFormatted;
	oc: boolean;

	onClick: (e: React.MouseEvent<HTMLDivElement>) => void;
	ref?: React.ForwardedRef<HTMLDivElement>;
}) => {
	return (
		<div
			className={clsx("bg-[#1a1a1a] rounded p-2 flex flex-col flex-nowrap")}
			onClick={onClick}
			ref={ref}
		>
			<div className="text-xs font-semibold pb-1 pl-2">
				<div className="flex gap-1">
					u/{c.author}
					<p>&#8226;</p>
					<p className="text-xs">{getCreatedTime(c.created_utc)}</p>
					{c.is_submitter && <span className="text-green-400 pl-2"> OP</span>}
					{oc && <span className="text-purple-400 pl-2"> OC</span>}
				</div>
			</div>
			<HTML text={c.body_html} size="sm" />
			<div className="flex gap-3 pt-1">
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
	oc,
}: {
	comments: RedditCommentFormatted[];
	expanded: Set<string>;
	toggleExpanded: (id: string, desc: string[], el: HTMLElement) => void;
	oc: string;
}) => {
	return (
		<div
			className={clsx("flex flex-col gap-2 justify-center items-center w-full")}
		>
			{comments.map((comment) => {
				if (comment.distinguished) return null;
				const isExpanded = expanded.has(comment.id);

				return (
					<div
						className={clsx("flex flex-col gap-3 flex-1 w-full")}
						key={comment.id}
					>
						<div
							className={clsx(
								"pl-1 pr-1 pt-1 w-full",
								comment.replies.length > 0
									? "cursor-pointer"
									: "cursor-default",
							)}
						>
							<CommentCard
								c={comment}
								oc={comment.author === oc}
								onClick={(e) => {
									e.stopPropagation();
									if (comment.replies.length > 0)
										toggleExpanded(
											comment.id,
											getDescendants(comment),
											e.currentTarget,
										);
								}}
							/>
						</div>
						<AnimatePresence>
							{isExpanded && comment.replies.length > 0 && (
								<motion.div
									layout
									key={comment.id}
									initial={{ height: 0, opacity: 0 }}
									animate={{ height: "auto", opacity: 1 }}
									exit={{ height: 0, opacity: 0 }}
									transition={{ duration: 0.3 }}
									className="overflow-hidden"
								>
									<div className={clsx("pl-5  border-l-slate-600 border-l ")}>
										<RecursiveComments
											comments={comment.replies}
											expanded={expanded}
											toggleExpanded={toggleExpanded}
											oc={oc}
										/>
									</div>
								</motion.div>
							)}
						</AnimatePresence>
					</div>
				);
			})}
		</div>
	);
};

const CommentThread = ({ comment }: { comment: RedditCommentFormatted }) => {
	const [expanded, setExpanded] = useState<Set<string>>(new Set());
	const isExpanded = expanded.has(comment.id);
	const commentRef = useRef<HTMLDivElement>(null);

	const toggleExpanded = (id: string, desc: string[] = [], el: HTMLElement) => {
		if (expanded.has(id)) {
			el.scrollIntoView({ behavior: "auto", block: "start" });

			setTimeout(() => {
				setExpanded((prev) => {
					const newSet = new Set(prev);

					newSet.delete(id);
					desc.forEach((desc) => newSet.delete(desc));

					return newSet;
				});
			}, 100);
			setTimeout(() => {
				el.classList.remove("bg-neutral-800", "ring-1", "ring-cyan-400");
			}, 500);
		} else {
			setExpanded((prev) => new Set(prev).add(id));
			setTimeout(() => {
				el.scrollIntoView({ behavior: "smooth", block: "start" });
			}, 50);
			requestAnimationFrame(() => {
				el.classList.add("bg-neutral-800", "ring-1", "ring-cyan-400");
			});
		}
	};

	return (
		<div className={clsx("flex flex-col gap-2 w-full h-full pl-1")}>
			<div
				className={clsx(
					"",
					comment.replies.length > 0 ? "cursor-pointer" : "cursor-default",
				)}
			>
				<CommentCard
					ref={commentRef}
					c={comment}
					oc={false}
					onClick={(e) => {
						if (comment.replies.length > 0)
							toggleExpanded(
								comment.id,
								getDescendants(comment),
								e.currentTarget,
							);
					}}
				/>
			</div>
			<div className={clsx("flex justify-between gap-3")}>
				{isExpanded && comment.replies.length > 0 && (
					<>
						<div
							title="Collapse Thread"
							className="relative flex w-2 cursor-pointer group  justify-center"
							onClick={(e) =>
								toggleExpanded(
									comment.id,
									getDescendants(comment),
									commentRef.current || e.currentTarget,
								)
							}
						>
							<div className="absolute top-0 bottom-0  w-px bg-cyan-400  md:bg-cyan-800/30 md:group-hover:bg-cyan-400 transition-all" />

							<div className="absolute left-0 z-10 flex flex-col items-center justify-center h-full w-full">
								<div className="flex flex-col items-center bg-[#121212] text-cyan-300 transition">
									<div className="h-4 w-px bg-current text-transparent md:text-cyan-300 md:group-hover:text-transparent" />
									<MinusCircle size={16} />
									<div className="h-4 w-px bg-current text-transparent md:text-cyan-300 md:group-hover:text-transparent" />
								</div>
							</div>
						</div>
						<div className="flex-1">
							<AnimatePresence>
								<motion.div
									key={comment.id}
									initial={{ height: 0, opacity: 0 }}
									animate={{ height: "auto", opacity: 1 }}
									exit={{ height: 0, opacity: 0 }}
									transition={{ duration: 0.3 }}
									className="overflow-hidden"
								>
									<RecursiveComments
										comments={comment.replies}
										expanded={expanded}
										toggleExpanded={toggleExpanded}
										oc={comment.author}
									/>
								</motion.div>
							</AnimatePresence>
						</div>
					</>
				)}
			</div>
		</div>
	);
};

const btnTextClass = "text-xs md:text-sm";

const Comments = ({ hideComments }: { hideComments: () => void }) => {
	const { postId } = useParams();
	const [pendingTime, setPendingTime] = useState(0);
	const [slotToken, setSlotToken] = useState<number | undefined>();
	const [page, setPage] = useState(0);
	const [fallbackComments, setFallbackComments] = useState<
		RedditCommentFormatted[] | null
	>(null);
	const location = useLocation();
	const commRef = useRef<HTMLDivElement>(null);
	const { isPortrait, isMobile } = useDisplay();
	const PAGE_SIZE = 20;
	const shared = !location.state?.backgroundLocation;
	const hasFallback = postId ? hasCommentFallback(postId) : false;

	const { data, isLoading, isError, error } = useFetchPostAndCommentsQuery(
		postId && !hasFallback ? { postId, slotToken, shared } : skipToken,
		{
			refetchOnMountOrArgChange: false,
			refetchOnReconnect: false,
			refetchOnFocus: false,
			selectFromResult: ({ data, isLoading, error, isError }) => ({
				data: data?.comments,
				isLoading,
				isError,
				error,
			}),
		},
	);

	const comments = useMemo(() => {
		if (hasFallback) return fallbackComments;
		if (data) return data;
		return null;
	}, [data, fallbackComments, hasFallback]);

	useEffect(() => {
		if (postId) getFallbackComments(postId).then(setFallbackComments);
	}, [postId]);

	useEffect(() => {
		const el = commRef.current;
		if (el) {
			requestAnimationFrame(() => {
				el.scrollTop = 0;
				el.focus();
			});
		}
	}, [page]);

	useEffect(() => {
		if (!pendingTime || pendingTime < Date.now()) return;

		const timeout = setTimeout(() => {
			setSlotToken(pendingTime);
		}, pendingTime - Date.now());

		return () => {
			clearTimeout(timeout);
		};
	}, [pendingTime]);

	useEffect(() => {
		if (
			isError &&
			error &&
			isAppHandledError(error) &&
			error.data.pendingTimestamp > 0 &&
			error.data.reason === "rateLimit"
		) {
			console.warn(
				"Pending request: ",
				new Date(error.data.pendingTimestamp).toLocaleDateString(),
			);
			setPendingTime(error.data.pendingTimestamp);
		}
	}, [isError, error]);

	if (hasFallback && isError && error) {
		return (
			<div className="flex flex-col h-[300px] justify-center items-center">
				<QueryErrorMessage error={error} variant="panel" />
			</div>
		);
	}

	if (isLoading)
		return (
			<div className="flex flex-col h-[300px] justify-center items-center">
				<Spinner />
				<p className="text-sm md:text-base">Loading Comments...</p>
			</div>
		);

	if (!comments || comments.length === 0) {
		if (hasFallback) {
			return <Spinner />;
		}
		return (
			<div className=" h-full w-full p-1">
				<h3 className="text-lg text-center">No Comments</h3>
			</div>
		);
	}

	const section = page * PAGE_SIZE;
	const maxPages = Math.max(0, Math.floor(comments.length / PAGE_SIZE) - 1);

	return (
		<div className="h-full min-h-0 flex flex-col gap-1 p-1">
			{(!isMobile || !isPortrait) && (
				<button
					onClick={hideComments}
					className="flex items-center gap-2 w-fit justify-center py-[3px] px-2 mb-1 "
				>
					<ArrowLeft size={16} />
					<p className={btnTextClass}>Hide Comments</p>
				</button>
			)}
			<div
				ref={commRef}
				className="flex-1 flex flex-col w-full overflow-y-auto overflow-x-hidden min-h-0 p-1 focus:outline-none comment-section"
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

						<div className="flex flex-col gap-2 flex-1">
							{comments
								.slice(section, section + PAGE_SIZE)
								.map((c: RedditCommentFormatted) => {
									if (c.distinguished) return null;
									return <CommentThread key={c.id} comment={c} />;
								})}
						</div>

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
		</div>
	);
};

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
	const handlePage = () => {
		setPage((prev) =>
			dir === "next" ? Math.min(max, prev + 1) : Math.max(0, prev - 1),
		);
	};

	const handleTop = () => {
		setPage(0);
	};

	const lastPage = page === max;

	return (
		<div className="grid grid-cols-[1fr_2fr_1fr] pb-3">
			<div></div>
			{
				<div className="w-full flex justify-center">
					<button
						onClick={handlePage}
						className={clsx(
							"flex gap-2 py-[3px] px-2 w-fit justify-center items-center bg-[#E50914]",
						)}
						disabled={dir === "next" && lastPage}
					>
						{dir === "next" ? (
							<>
								<ArrowDown size={16} />
								<p className={btnTextClass}>View More</p>
							</>
						) : (
							<>
								<ArrowUp size={16} />
								<p className={btnTextClass}>View Previous</p>
							</>
						)}
					</button>
				</div>
			}
			{page > 1 ? (
				<button
					onClick={handleTop}
					className="flex gap-2 py-[3px] px-2 w-fit justify-self-end items-center text-[#E50914]"
				>
					<ArrowBigUpDashIcon size={16} />
					<p className={btnTextClass}>Top</p>
				</button>
			) : (
				<div></div>
			)}
		</div>
	);
};

export default Comments;
