import { useEffect, useState } from "react";

interface DisplayInfo {
	width: number;
	height: number;
	isPortrait: boolean;
	isLandscape: boolean;
	isMobile: boolean;
	isTablet: boolean;
	isDesktop: boolean;
}

const useDisplay = (): DisplayInfo => {
	const [isPortrait, setIsPortrait] = useState(
		window.matchMedia("(orientation: portrait)").matches
	);
	const [dimensions, setDimensions] = useState({
		width: window.innerWidth,
		height: window.innerHeight,
		portrait: window.matchMedia("(orientation: portrait)").matches,
	});

	useEffect(() => {
		const handleResize = () => {
			setDimensions({
				width: window.innerWidth,
				height: window.innerHeight,
				portrait: window.matchMedia("(orientation: portrait)").matches,
			});
		};

		window.addEventListener("resize", handleResize);
		return () => {
			window.removeEventListener("resize", handleResize);
		};
	}, []);

	const { width, height, portrait } = dimensions;

	const isMobile = width < 640 || height < 500;

	return {
		width,
		height,
		isPortrait: portrait,
		isLandscape: !portrait,
		isMobile,
		isTablet: !isMobile && width >= 640 && width < 1024,
		isDesktop: width >= 1024,
	};
};

export default useDisplay;
