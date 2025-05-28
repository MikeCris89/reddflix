import { GalleryPost } from "../features/reddit/redditTypes";
import { useKeenSlider } from "keen-slider/react";
import { ContentMode, MODE } from "../utils/types";
import ContentBadge from "./ContentBadge";
import { Layers } from "lucide-react";
import { useState } from "react";

const GalleryContent = ({
	post,
	mode,
}: {
	post: GalleryPost;
	mode: ContentMode;
}) => {
	const [sliderRef, slider] = useKeenSlider<HTMLDivElement>({
		loop: true,
		slideChanged(slider) {
			setPage(slider.track.details.rel + 1);
		},
	});
	const [page, setPage] = useState(1);

	const images = post.gallery_data.items.map((item) => {
		const media = post.media_metadata[item.media_id];
		const imageUrl = media?.s?.u?.replace(/&amp;/g, "&") || "";

		return imageUrl;
	});

	return (
		<>
			{mode === MODE.full && (
				<div className="relative w-full max-h-full max-w-[900px] mx-auto rounded-md">
					<ContentBadge
						badge={
							<div className="flex gap-2">
								<p>
									{page} / {images.length}
								</p>
								<Layers size={14} />
							</div>
						}
					>
						{/* Slider */}
						<div ref={sliderRef} className="keen-slider rounded-md">
							{images.map((src, idx) => {
								return (
									<div
										key={idx}
										className="keen-slider__slide flex justify-center rounded-md "
									>
										<img
											src={src}
											alt={`Gallery image ${idx + 1}`}
											className="max-h-[600px] w-full object-contain rounded-md"
										/>
									</div>
								);
							})}
						</div>

						{/* Arrows */}
						<button
							onClick={() => {
								slider.current?.prev();
							}}
							className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white px-3 py-1 rounded hover:bg-black"
						>
							◀
						</button>
						<button
							onClick={() => {
								slider.current?.next();
							}}
							className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white px-3 py-1 rounded hover:bg-black"
						>
							▶
						</button>
					</ContentBadge>
				</div>
			)}
			{mode === MODE.preview && (
				<>
					<ContentBadge
						badge={
							<div className="flex items-center gap-2">
								<p className="text-xs">{images.length}</p>
								<Layers size={14} />
							</div>
						}
					>
						<img
							src={images[0]}
							className="w-full h-full object-cover rounded-md"
							alt={`Gallery image`}
							loading="lazy"
						/>
					</ContentBadge>
				</>
			)}
		</>
	);
};

export default GalleryContent;
