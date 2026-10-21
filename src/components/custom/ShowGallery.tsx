import { useState } from "react";
import Lightbox, { type GalleryImage } from "./Lightbox";

interface ShowGalleryProps {
  mainImageSrc: string;
  mainImageSrcSet?: string;
  mainImageWidth: number;
  mainImageHeight: number;
  mainImageOriginalSrc: string;
  images: GalleryImage[];
  alt: string;
}

export default function ShowGallery({
  mainImageSrc,
  mainImageSrcSet,
  mainImageWidth,
  mainImageHeight,
  mainImageOriginalSrc,
  images,
  alt,
}: ShowGalleryProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Open the lightbox on the main image when it is also in the gallery.
  const mainImageIndex = images.findIndex((img) => img.originalSrc === mainImageOriginalSrc);

  const mainImage = (
    <img
      src={mainImageSrc}
      srcSet={mainImageSrcSet}
      sizes="(min-width: 1024px) 1200px, calc(100vw - 32px)"
      width={mainImageWidth}
      height={mainImageHeight}
      alt={alt}
      className="w-full h-auto block transition-all duration-700 group-hover:scale-102 group-hover:opacity-85"
      loading="eager"
      fetchPriority="high"
      decoding="async"
    />
  );

  return (
    <>
      {images.length > 0 ? (
        <button
          type="button"
          onClick={() => setActiveIndex(Math.max(mainImageIndex, 0))}
          className="relative group overflow-hidden bg-secondary cursor-pointer w-full block"
        >
          {mainImage}
          <span className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
            <span className="py-3 px-6 bg-background/85 border border-border text-xs font-medium text-foreground uppercase tracking-[0.18em] scale-95 group-hover:scale-100 transition-all duration-300">
              Visualizza Galleria ({images.length})
            </span>
          </span>
        </button>
      ) : (
        <div className="relative overflow-hidden bg-secondary w-full block">{mainImage}</div>
      )}

      <Lightbox images={images} activeIndex={activeIndex} onChange={setActiveIndex} />
    </>
  );
}
