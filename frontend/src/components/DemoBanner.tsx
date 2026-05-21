import { Link, useLocation } from "react-router-dom";
import { Info } from "lucide-react";

const DemoBanner = () => {
	const location = useLocation();

	return (
		<div className="bg-[#1a1a1a] border-b border-[#2C2C2C] px-4 py-1.5 text-xs text-zinc-400 flex items-center justify-center gap-2">
			<Info size={12} className="text-[#E50914]" />
			<span>Demo mode — rate limited to 2 req / 15s</span>
			<Link
				to="/about"
				state={{ backgroundLocation: location }}
				className="text-[#E50914] hover:underline font-medium"
			>
				Learn more
			</Link>
		</div>
	);
};

export default DemoBanner;
