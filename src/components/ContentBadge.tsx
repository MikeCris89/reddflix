const ContentBadge = ({
	children,
	badge,
}: {
	children: React.ReactNode;
	badge?: React.ReactNode;
}) => {
	return (
		<div className="relative w-full h-full">
			{badge && (
				<span className="absolute top-1 right-1 bg-black text-white text-xs bg-opacity-50 rounded-sm p-1">
					{badge}
				</span>
			)}
			{children}
		</div>
	);
};

export default ContentBadge;
