import { useState } from "react";
import Lightbox, { type GalleryImage as LightboxPhoto } from "./Lightbox";

export interface GalleryImage extends LightboxPhoto {
  showId: string;
}

interface GalleryViewProps {
  images: GalleryImage[];
}

interface GalleryCardProps {
  image: GalleryImage;
  index: number;
  onOpen: () => void;
}

function GalleryCard({ image, index, onOpen }: GalleryCardProps) {
  return (
    <div
      className="relative group mb-6 md:mb-8 overflow-hidden bg-secondary break-inside-avoid transition-all duration-300 ring-1 ring-border hover:ring-primary-soft/50"
      style={{ aspectRatio: `${image.width} / ${image.height}` }}
    >
      <div className="skeleton absolute inset-0" aria-hidden="true" />

      <img
        src={image.gridSrc}
        alt=""
        loading={index === 0 ? "eager" : "lazy"}
        fetchPriority={index === 0 ? "high" : undefined}
        decoding="async"
        width={image.width}
        height={image.height}
        className="absolute inset-0 h-full w-full object-cover transition-all duration-500 group-hover:scale-105 group-hover:opacity-60 group-focus-within:opacity-60"
      />

      <div className="absolute inset-0 bg-linear-to-t from-background via-background/30 to-transparent opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none flex flex-col justify-end p-6">
        <h3 className="text-foreground uppercase tracking-[0.02em] text-xl transform translate-y-4 group-hover:translate-y-0 group-focus-within:translate-y-0 transition-transform duration-300">
          {image.title}
        </h3>
        <p className="text-foreground/70 text-sm font-light capitalize transform translate-y-4 group-hover:translate-y-0 group-focus-within:translate-y-0 transition-transform duration-300 delay-75">
          {image.subtitle}
        </p>
      </div>

      <button
        type="button"
        onClick={onOpen}
        aria-label={`Apri: ${image.alt}`}
        className="absolute inset-0 z-10 cursor-pointer focus-visible:outline-offset-[-3px]"
      />
    </div>
  );
}

export default function GalleryView({ images }: GalleryViewProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <>
      {/* Masonry Columns Gallery */}
      <div className="columns-1 md:columns-2 lg:columns-3 gap-6 md:gap-8 space-y-6 md:space-y-8 max-w-[1200px] mx-auto">
        {images.map((image, index) => (
          <GalleryCard
            key={`${image.showId}-${image.originalSrc}`}
            image={image}
            index={index}
            onOpen={() => setActiveIndex(index)}
          />
        ))}
      </div>

      <Lightbox images={images} activeIndex={activeIndex} onChange={setActiveIndex} />
    </>
  );
}
