const Spinner = ({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
	const iconSize =
		size === "sm" ? "h-6 w-6" : size === "md" ? "h-8 w-8" : "h-10 w-10";
	return (
		<div className="flex items-center justify-center">
			<div
				className={`${iconSize} border-4 border-t-transparent border-white rounded-full animate-spin`}
			/>
		</div>
	);
};

export default Spinner;
