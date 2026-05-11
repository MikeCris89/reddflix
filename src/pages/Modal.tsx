import { useLocation, useNavigate } from "react-router-dom";
import PostModal from "../components/PostModal";
import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import useDisplay from "../hooks/useDisplay";
import About from "./About";

const Modal = ({ about = false }: { about?: boolean }) => {
	const [layoutSize, setLayoutSize] = useState<"normal" | "wide">("normal");

	const navigate = useNavigate();
	const { isPortrait } = useDisplay();
	const modalRef = useRef<HTMLDivElement>(null);
	const location = useLocation();
	const state = location.state as { backgroundLocation?: Location };
	const backgroundLocation = state?.backgroundLocation;

	useEffect(() => {
		// Pause preview videos when modal is open
		const videos = document.querySelectorAll("video");
		videos.forEach((vid) => {
			// Skip videos inside the modal
			if (!modalRef.current?.contains(vid)) {
				vid.pause();
			}
		});
	}, []);

	return (
		<div
			className="fixed inset-0 z-40 bg-black/70 flex justify-center items-center p-1"
			onClick={() => navigate(-1)}
		>
			<AnimatePresence mode="wait">
				<motion.div
					layout
					key="modal-shell"
					ref={modalRef}
					initial={{ opacity: 0, scale: 0.95 }}
					animate={{
						opacity: 1,
						scale: 1,
						// width: isPortrait
						// 	? "100%"
						// 	: // : layoutSize === "wide"
						// 	  // ? "95%"
						// 	  "700px",
					}}
					exit={{ opacity: 0, scale: 0.95 }}
					transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
					className={clsx(
						" bg-[#121212] rounded-md p-3  overflow-hidden h-full lg:h-[90%]",
						{
							"w-full": isPortrait || !backgroundLocation,
							"w-[700px]":
								!isPortrait && backgroundLocation && layoutSize === "normal",
							"w-[95%]":
								!isPortrait && backgroundLocation && layoutSize === "wide",
							"w-[500px]": !isPortrait && about,
							"h-[500px]": isPortrait && about,
						},
					)}
					onClick={(e) => e.stopPropagation()}
				>
					{about ? <About /> : <PostModal setLayoutSize={setLayoutSize} />}
				</motion.div>
			</AnimatePresence>
		</div>
	);
};

export default Modal;
