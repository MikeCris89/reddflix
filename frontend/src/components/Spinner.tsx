const Spinner = ({ size = "md" }: { size?: "xs" | "sm" | "md" | "lg" }) => {
	const iconSize =
		size === "xs"
			? "h-3 w-3"
			: size === "sm"
				? "h-6 w-6"
				: size === "md"
					? "h-8 w-8"
					: "h-10 w-10";
	const borderSize = size === "xs" ? "border-2" : "border-4";
	return (
		<div className="flex items-center justify-center">
			<div
				className={`${iconSize} ${borderSize} border-t-transparent border-white rounded-full animate-spin`}
			/>
		</div>
	);
};

export default Spinner;
