import clsx from "clsx";
import {
	ArrowBigUp,
	ExternalLink,
	MessageCircle,
	Share2,
	LucideIcon,
} from "lucide-react";
import { formatCounts } from "../utils/helpers";

const bubbleIcons = {
	score: ArrowBigUp,
	chat: MessageCircle,
	share: Share2,
	link: ExternalLink,
} as const;

export type BubbleIcon = keyof typeof bubbleIcons;

interface InfoProps {
	children?: React.ReactNode;
	icon?: BubbleIcon;
	text?: string | number;
	onClick?: () => void;
	size?: "sm" | "md" | "lg";
	className?: string;
}

const InfoBubble = ({
	children,
	icon,
	text,
	onClick,
	size = "lg",
	className,
}: InfoProps) => {
	const IconComponent: LucideIcon | undefined = icon
		? bubbleIcons[icon]
		: undefined;
	const iconSize = size === "lg" ? 18 : size === "md" ? 14 : 12;
	return (
		<div
			className={clsx(
				"rounded-3xl   w-fit",
				onClick
					? "cursor-pointer hover:bg-gray-500 box-shadow-thin"
					: "cursor-default",
				size === "lg" ? "px-3 py-1 bg-[#242424]" : "px-2 py-0.5",
				className,
			)}
			onClick={onClick}
		>
			<div className="flex items-center justify-center gap-1">
				{IconComponent && <IconComponent size={iconSize} />}
				<p
					className={clsx(
						"font-semibold",
						size === "lg" ? "text-sm" : "text-xs",
					)}
				>
					{typeof text === "number" ? formatCounts(text) : text}
				</p>
				{children}
			</div>
		</div>
	);
};

export default InfoBubble;
