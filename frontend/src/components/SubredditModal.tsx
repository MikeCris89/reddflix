import { CheckCircle2Icon, Circle } from "lucide-react";
import {
	useFetchSubredditsQuery,
	useSetSubbredditListMutation,
} from "../features/localApp/localAppApi";
import Spinner from "./Spinner";
import clsx from "clsx";
import { useEffect, useState } from "react";
import { Subreddit } from "../utils/types";

const SubredditModal = ({ onClose }: { onClose: () => void }) => {
	const [subreddits, setSubreddits] = useState<Subreddit[]>([]);
	const { data, isLoading: loadingSubs } = useFetchSubredditsQuery();
	const [setSubs, { isLoading: savingSubs }] = useSetSubbredditListMutation();

	useEffect(() => {
		// if (data) {
		// 	const { activeSubs, notActive } = data.reduce<{
		// 		activeSubs: Subreddit[];
		// 		notActive: Subreddit[];
		// 	}>(
		// 		(acc, curr) => {
		// 			if (curr.active) acc.activeSubs.push(curr);
		// 			else acc.notActive.push(curr);
		// 			return acc;
		// 		},
		// 		{ activeSubs: [], notActive: [] },
		// 	);
		// 	activeSubs.sort((a, b) => a.name.localeCompare(b.name));
		// 	notActive.sort((a, b) => a.name.localeCompare(b.name));
		// 	setSubreddits([...activeSubs, ...notActive]);
		// }

		if (data)
			setSubreddits(data.slice().sort((a, b) => a.name.localeCompare(b.name)));
	}, [data]);

	const toggleSub = (name: string) => {
		setSubreddits((prev) =>
			prev.map((s) => (s.name === name ? { ...s, active: !s.active } : s)),
		);
	};

	const handleSubmit = async () => {
		await setSubs(subreddits);
		onClose();
	};

	const activeCount = subreddits.filter((s) => s.active).length;

	return (
		<div
			className="fixed inset-0 z-50 h-full w-full bg-black/70 backdrop-blur-sm flex justify-center items-center p-4"
			onClick={onClose}
		>
			<div
				className="bg-[#181818] border border-[#2C2C2C] rounded-xl shadow-2xl max-h-[90vh] max-w-[90%] w-[440px] min-h-0 overflow-hidden flex flex-col"
				onClick={(e) => e.stopPropagation()}
			>
				{/* Header */}
				<div className="flex items-center justify-between px-5 py-4 border-b border-[#2C2C2C]">
					<div>
						<h3 className="text-lg font-bold text-[rgba(255,255,255,0.92)]">
							Subreddits
						</h3>
						<p className="text-xs text-neutral-500 mt-0.5">
							Choose which subreddits appear on your homepage
						</p>
					</div>
					<span className="text-xs font-semibold text-[#E50914] bg-[#E50914]/10 px-2.5 py-1 rounded-full">
						{activeCount} active
					</span>
				</div>

				{/* List */}
				{loadingSubs && (
					<div className="py-10">
						<Spinner />
					</div>
				)}
				{!loadingSubs && data && (
					<div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col gap-2 p-4 custom-scroll">
						{subreddits.map((sub, i) => (
							<div
								key={`${sub.name}-${i}`}
								onClick={() => toggleSub(sub.name)}
								className={clsx(
									"flex items-center gap-3 px-3 py-2.5 rounded-lg hover:cursor-pointer transition-colors duration-150 border",
									sub.active
										? "bg-[#E50914]/10 border-[#E50914]/40 hover:bg-[#E50914]/15"
										: "bg-[#202020] border-transparent hover:bg-[#2A2A2A]",
								)}
							>
								{sub.active ? (
									<CheckCircle2Icon className="h-5 w-5 shrink-0 text-[#E50914]" />
								) : (
									<Circle className="h-5 w-5 shrink-0 text-neutral-600" />
								)}
								<p
									className={clsx(
										"text-sm font-semibold truncate",
										sub.active
											? "text-[rgba(255,255,255,0.92)]"
											: "text-neutral-400",
									)}
								>
									r/{sub.name}
								</p>
							</div>
						))}
					</div>
				)}

				{/* Footer */}
				<div className="flex justify-end gap-3 px-5 py-4 border-t border-[#2C2C2C]">
					<button
						onClick={onClose}
						className="w-[100px] py-1.5 rounded-lg text-sm font-semibold text-neutral-300 bg-transparent border border-[#2C2C2C] hover:border-[#3A3A3A] hover:bg-[#2A2A2A] transition-colors"
					>
						Cancel
					</button>
					<button
						onClick={handleSubmit}
						className="w-[100px] py-1.5 rounded-lg text-sm font-semibold text-white bg-[#E50914] border border-transparent hover:border-transparent hover:bg-[#f6121d] transition-colors disabled:opacity-60 flex items-center justify-center"
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
