import { useState } from "react";

const useHoverTouch = () => {
	const [isHovered, setIsHovered] = useState(false);
	const [isClicked, setIsClicked] = useState(false);

	const eventHandlers = {
		onMouseEnter: () => setIsHovered(true),
		onMouseLeave: () => setIsHovered(false),
		onTouchStart: () => setIsClicked(true),
		onTouchEnd: () => {
			setIsClicked(false);
		},
	};
	return { isHovered, isClicked, eventHandlers };
};

export default useHoverTouch;
