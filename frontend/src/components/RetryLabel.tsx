import Spinner from "./Spinner";

const RetryLabel = ({ remainingMs }: { remainingMs: number }) => {
	return (
		<span className="flex items-center gap-1 text-[#E50914] text-xs">
			<Spinner size="xs" />
			Retrying in {Math.ceil(remainingMs / 1000)}s
		</span>
	);
};

export default RetryLabel;
