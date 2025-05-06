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
				<span className="absolute top-0 right-1 bg-black text-white text-xs">
					{badge}
				</span>
			)}
			{children}
		</div>
	);
};

export default ContentBadge;
