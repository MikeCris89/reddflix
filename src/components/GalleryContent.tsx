import { GalleryPost } from "../features/reddit/redditTypes";
import { useKeenSlider } from "keen-slider/react";
import { ContentMode, MODE } from "../utils/types";
import ContentBadge from "./ContentBadge";
import { Layers } from "lucide-react";

const GalleryContent = ({
	post,
	mode,
}: {
	post: GalleryPost;
	mode: ContentMode;
}) => {
	const [sliderRef, slider] = useKeenSlider<HTMLDivElement>({
		loop: true,
	});

	const galleryData =
		post.gallery_data ?? post.crosspost_parent_list?.[0]?.gallery_data;
	const mediaMetadata =
		post.media_metadata ?? post.crosspost_parent_list?.[0]?.media_metadata;

	const images = galleryData.items.map((item) => {
		const media = mediaMetadata[item.media_id];
		const imageUrl = media?.s?.u?.replace(/&amp;/g, "&") || "";

		return imageUrl;
	});

	return (
		<div className="relative w-full max-w-3xl mx-auto">
			{mode === MODE.full && (
				<>
					{/* Slider */}
					<div ref={sliderRef} className="keen-slider">
						{images.map((src, idx) => (
							<div key={idx} className="keen-slider__slide flex justify-center">
								<img
									src={src}
									alt={`Gallery image ${idx + 1}`}
									className="max-h-[500px] object-contain"
								/>
							</div>
						))}
					</div>

					{/* Arrows */}
					<button
						onClick={() => slider.current?.prev()}
						className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white px-3 py-1 rounded hover:bg-black"
					>
						◀
					</button>
					<button
						onClick={() => slider.current?.next()}
						className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white px-3 py-1 rounded hover:bg-black"
					>
						▶
					</button>
				</>
			)}
			{mode === MODE.preview && (
				<>
					<ContentBadge
						badge={
							<div className="flex gap-2">
								<p>1 / {images.length}</p>
								<Layers size={14} />
							</div>
						}
					>
						<img src={images[0]} />
					</ContentBadge>
				</>
			)}
		</div>
	);
};

export default GalleryContent;
