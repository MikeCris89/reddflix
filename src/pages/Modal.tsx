import { useNavigate } from "react-router-dom";
import PostModal from "../components/PostModal";
import { useEffect, useRef } from "react";
import clsx from "clsx";

const Modal = () => {
	const navigate = useNavigate();
	const modalRef = useRef<HTMLDivElement>(null);

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
			className="fixed inset-0 z-40 bg-black/40 flex justify-center items-center p-2"
			onClick={() => navigate(-1)}
		>
			<div
				ref={modalRef}
				className={clsx(
					"flex flex-col h-full bg-[#121212] rounded-md p-3 box-shadow-thin overflow-hidden min-w-full lg:min-w-[900px] z-60"
					//{ "w-full": showComments }
				)}
				onClick={(e) => e.stopPropagation()}
			>
				<PostModal />
			</div>
		</div>
	);
};

export default Modal;
