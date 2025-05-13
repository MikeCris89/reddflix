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
	size?: "sm" | "lg";
}

const InfoBubble = ({
	children,
	icon,
	text,
	onClick,
	size = "lg",
}: InfoProps) => {
	const IconComponent: LucideIcon | undefined = icon
		? bubbleIcons[icon]
		: undefined;
	const iconSize = size === "lg" ? 20 : 14;
	return (
		<div
			className={clsx(
				"rounded-3xl bg-[#242424] box-shadow-thin w-fit",
				onClick ? "cursor-pointer hover:bg-gray-500" : "cursor-default",
				size === "lg" ? "px-3 py-1" : "px-2 py-0.5"
			)}
			onClick={onClick}
		>
			<div className="flex items-center justify-center gap-1">
				{IconComponent && <IconComponent size={iconSize} />}
				<p
					className={clsx(
						"font-semibold",
						size === "lg" ? "text-sm" : "text-xs"
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
