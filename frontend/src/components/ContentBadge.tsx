import clsx from "clsx";

const ContentBadge = ({
	children,
	badge,
	video = false,
}: {
	children: React.ReactNode;
	badge?: React.ReactNode;
	video?: boolean;
}) => {
	return (
		<div className="relative w-full h-full">
			{badge && (
				<span
					className={clsx(
						"absolute top-1 right-1 bg-black text-white/80 text-xs bg-opacity-50 rounded-sm p-1",
						video && "top-[50%] right-[50%] -translate-y-1/2 translate-x-1/2 ",
					)}
				>
					{badge}
				</span>
			)}
			{children}
		</div>
	);
};

export default ContentBadge;
