import { LucideSettings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useDisplay from "../hooks/useDisplay";
import clsx from "clsx";
import { useEffect, useState } from "react";
import SubredditModal from "./SubredditModal";

const nav2 =
	"bg-[#121212] border-b border-[#2C2C2C] shadow-sm px-4  items-center";

const Navbar = () => {
	const [openModal, setOpenModal] = useState(false);
	const navigate = useNavigate();
	const { isMobile } = useDisplay();

	useEffect(() => {
		if (openModal) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "";
		}

		// Cleanup on unmount
		return () => {
			document.body.style.overflow = "";
		};
	}, [openModal]);

	return (
		<nav className={nav2}>
			{openModal && <SubredditModal onClose={() => setOpenModal(false)} />}
			<div className="p-1  flex justify-between items-center max-w-[1200px] mx-auto">
				<div
					className={clsx(
						"cursor-pointer hover:bg-[#E50914] hover:text-[#121212] text-2xl text-[#E50914] font-extrabold rounded-lg p-1 w-fit",
						isMobile && "text-lg"
					)}
					onClick={() => navigate("/")}
				>
					<h2 className="">reddflix</h2>
				</div>

				<div className="flex justify-end gap-10 justify-self-end w-fit">
					<div
						className="hover:bg-red-700 hover:text-black text-sm font-semibold p-1 rounded-md cursor-pointer"
						onClick={() => setOpenModal(true)}
					>
						subreddits
					</div>
					{/* <button >Home</button> */}
					<div
						className="cursor-pointer  hover:bg-[#E50914] hover:text-[#121212] p-1 rounded-full"
						onClick={() => navigate("/settings")}
					>
						<LucideSettings size={isMobile ? 18 : 22} />
					</div>
				</div>
			</div>
		</nav>
	);
};

export default Navbar;
