import { GalleryPost } from "../features/reddit/redditTypes";
import { useKeenSlider } from "keen-slider/react";

const GalleryContent = ({ post }: { post: GalleryPost }) => {
	const [sliderRef, slider] = useKeenSlider<HTMLDivElement>({
		loop: true,
	});

	const images = post.gallery_data.items.map((item) => {
		const media = post.media_metadata[item.media_id];
		const imageUrl = media?.s?.u?.replace(/&amp;/g, "&") || "";

		return imageUrl;
	});

	return (
		<div className="relative w-full max-w-3xl mx-auto">
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
		</div>
	);
};

export default GalleryContent;
