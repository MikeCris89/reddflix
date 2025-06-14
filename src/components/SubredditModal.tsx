import { CheckCircle2Icon, Circle } from "lucide-react";
import {
	useFetchSubredditsQuery,
	useSetAllSubredditsMutation,
} from "../features/localApp/localAppApi";
import Spinner from "./Spinner";
import clsx from "clsx";
import { useEffect, useState } from "react";
import { Subreddit } from "../utils/types";

const SubredditModal = ({ onClose }: { onClose: () => void }) => {
	const [subreddits, setSubreddits] = useState<Subreddit[]>([]);
	const { data, isLoading: loadingSubs } = useFetchSubredditsQuery();
	const [setSubs, { isLoading: savingSubs }] = useSetAllSubredditsMutation();

	useEffect(() => {
		if (data) {
			const { activeSubs, notActive } = data.reduce<{
				activeSubs: Subreddit[];
				notActive: Subreddit[];
			}>(
				(acc, curr) => {
					if (curr.active) acc.activeSubs.push(curr);
					else acc.notActive.push(curr);
					return acc;
				},
				{ activeSubs: [], notActive: [] }
			);
			activeSubs.sort((a, b) => a.name.localeCompare(b.name));
			notActive.sort((a, b) => a.name.localeCompare(b.name));
			setSubreddits([...activeSubs, ...notActive]);
		}
	}, [data]);

	const toggleSub = (name: string) => {
		setSubreddits((prev) =>
			prev.map((s) => (s.name === name ? { ...s, active: !s.active } : s))
		);
	};

	const handleSubmit = async () => {
		await setSubs(subreddits);
		onClose();
	};

	return (
		<div
			className="fixed inset-0 z-50 h-full w-full bg-black/80 flex justify-center items-center"
			onClick={onClose}
		>
			<div
				className="bg-[#121212] rounded-md p-2  max-h-[90vh] max-w-[90%] min-w-[400px] min-h-0 overflow-hidden flex flex-col gap-3"
				onClick={(e) => e.stopPropagation()}
			>
				{loadingSubs && <Spinner />}
				{!loadingSubs && data && (
					<div className="h-full w-full overflow-y-auto overflow-x-hidden rounded-md flex flex-col gap-3 p-4 custom-scroll">
						{subreddits.map((sub, i) => (
							<div
								key={`${sub.name}-${i}`}
								onClick={() => toggleSub(sub.name)}
								className={clsx(
									"flex items-center gap-4 p-2 rounded-lg hover:cursor-pointer transition-colors duration-150",
									// sub.active
									// 	? "bg-neutral-800 hover:bg-neutral-600"
									// 	: "bg-neutral-800 hover:bg-neutral-700",
									sub.active
										? "bg-zinc-900 border border-cyan-500/30 hover:border-cyan-500/60 hover:bg-zinc-800"
										: "bg-zinc-800 hover:bg-zinc-700"
								)}
							>
								{!sub.active && <Circle className="h-5 w-5 text-gray-500" />}
								{sub.active && (
									<CheckCircle2Icon
										className={clsx(
											"h-5 w-5 text-[#E50914]",
											sub.active ? "" : "text-gray-500"
										)}
									/>
								)}
								<p
									className={clsx(
										"text-md  font-semibold",
										sub.active
											? "text-[rgba(255, 255, 255, 0.87)]"
											: "text-neutral-400"
									)}
								>
									r/{sub.name}
								</p>
							</div>
						))}
					</div>
				)}
				<div className="flex justify-end gap-3">
					<button
						onClick={onClose}
						className="my-2 w-[100px]  text-white py-1 rounded-lg"
					>
						Cancel
					</button>
					<button
						onClick={handleSubmit}
						className="my-2 w-[100px] bg-blue-800 hover:bg-blue-600 text-white py-1 rounded-lg"
						disabled={savingSubs}
					>
						{savingSubs ? <Spinner size="sm" /> : "Save"}
					</button>
				</div>
			</div>
		</div>
	);
};

export default SubredditModal;
