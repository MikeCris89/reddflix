const Spinner = ({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
	return (
		<div className="flex items-center justify-center p-4">
			<div className="h-8 w-8 border-4 border-t-transparent border-white rounded-full animate-spin" />
		</div>
	);
};

export default Spinner;
