import { useEffect, useState } from "react";

const useDisplay = () => {
	const [isPortrait, setIsPortrait] = useState(
		window.matchMedia("(orientation: portrait)").matches
	);
	const [width, setWidth] = useState(window.innerWidth);

	useEffect(() => {
		const handleResize = () => {
			setWidth(window.innerWidth);
			setIsPortrait(window.matchMedia("(orientation: portrait)").matches);
		};

		window.addEventListener("resize", handleResize);
		return () => {
			window.removeEventListener("resize", handleResize);
		};
	}, []);

	return {
		width,
		isPortrait,
		isLandscape: !isPortrait,
		isMobile: width < 640,
		isTablet: width >= 640 && width < 1024,
		isDesktop: width >= 1024,
	};
};

export default useDisplay;
