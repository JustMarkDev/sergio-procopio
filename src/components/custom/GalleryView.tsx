import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface GalleryImage {
  src: string;         // 1200px optimized WebP
  gridSrc: string;     // 600px optimized WebP
  thumbSrc: string;    // 120px optimized WebP
  originalSrc: string; // Original unresolved asset path string
  alt: string;
  showId: string;
  title: string;
  subtitle: string;
  width: number;
  height: number;
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
      onClick={onOpen}
      className="relative group mb-6 md:mb-8 overflow-hidden rounded-2xl bg-zinc-900 break-inside-avoid cursor-pointer transition-all duration-300 ring-1 ring-white/6 hover:ring-primary/40"
      style={{ aspectRatio: `${image.width} / ${image.height}` }}
    >
      <div
        className="absolute inset-0 bg-linear-to-br from-white/3 via-white/8 to-white/3"
        aria-hidden="true"
      />

      <img
        src={image.gridSrc}
        alt={image.alt}
        loading={index === 0 ? "eager" : "lazy"}
        fetchPriority={index === 0 ? "high" : undefined}
        decoding="async"
        width={image.width}
        height={image.height}
        className="absolute inset-0 h-full w-full object-cover transition-all duration-500 group-hover:scale-105 group-hover:opacity-60"
      />

      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none flex flex-col justify-end p-6">
        <h3 className="text-white font-serif font-bold text-xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
          {image.title}
        </h3>
        <p className="text-white/70 text-sm italic capitalize transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75 font-serif">
          {image.subtitle}
        </p>
      </div>
    </div>
  );
}

export default function GalleryView({ images }: GalleryViewProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const thumbnailsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("gallery-lightbox-change", {
        detail: { isOpen: activeIndex !== null },
      }),
    );

    return () => {
      if (activeIndex !== null) {
        window.dispatchEvent(
          new CustomEvent("gallery-lightbox-change", { detail: { isOpen: false } }),
        );
      }
    };
  }, [activeIndex]);

  // Reset loading state whenever the active index changes
  useEffect(() => {
    if (activeIndex !== null) {
      setIsImageLoading(true);
    }
  }, [activeIndex]);

  // Proactive Background Preloading: caches adjacent images (next/prev) in background memory
  useEffect(() => {
    if (activeIndex === null || images.length <= 1) return;

    // Preload next image
    const nextIdx = (activeIndex + 1) % images.length;
    const nextImg = new Image();
    nextImg.src = images[nextIdx].src;

    // Preload previous image
    const prevIdx = (activeIndex - 1 + images.length) % images.length;
    const prevImg = new Image();
    prevImg.src = images[prevIdx].src;
  }, [activeIndex, images]);

  // Prevent parent page scrolling while image is maximized
  useEffect(() => {
    if (activeIndex !== null) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow || "";
      };
    }
  }, [activeIndex]);

  // Keyboard navigation event listeners
  useEffect(() => {
    if (activeIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveIndex(null);
      } else if (e.key === "ArrowRight") {
        setActiveIndex((prev) => (prev === null ? 0 : (prev + 1) % images.length));
      } else if (e.key === "ArrowLeft") {
        setActiveIndex((prev) => (prev === null ? 0 : (prev - 1 + images.length) % images.length));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeIndex, images.length]);

  // Auto-scroll the active thumbnail into view and keep it centered without impacting parent viewport.
  // Optimizes switching: executes instantly if the modal is already open (offsetWidth > 0) to prevent jank on fast clicks,
  // and only uses a layout delay on initial open to allow accurate bounding calculations.
  useEffect(() => {
    if (activeIndex === null || !thumbnailsRef.current) return;

    const container = thumbnailsRef.current;
    const activeElement = container.children[activeIndex] as HTMLElement;
    if (!activeElement) return;

    const runScroll = () => {
      const containerWidth = container.offsetWidth;
      const elementLeft = activeElement.offsetLeft;
      const elementWidth = activeElement.offsetWidth;
      
      if (containerWidth > 0) {
        // Calculate centered scroll position, explicitly clamping to >= 0
        const targetScrollLeft = Math.max(0, elementLeft - containerWidth / 2 + elementWidth / 2);
        container.scrollLeft = targetScrollLeft;
      }
    };

    // If modal container is already open and sized, perform scroll centering instantly!
    if (container.offsetWidth > 0) {
      runScroll();
    } else {
      // Fallback: wait for the initial modal layout entry transition to settle
      const timer = setTimeout(runScroll, 200);
      return () => clearTimeout(timer);
    }
  }, [activeIndex]);

  const showNext = () => {
    setActiveIndex((prev) => (prev === null ? 0 : (prev + 1) % images.length));
  };

  const showPrev = () => {
    setActiveIndex((prev) => (prev === null ? 0 : (prev - 1 + images.length) % images.length));
  };

  const currentImage = activeIndex !== null ? images[activeIndex] : null;

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

      {/* Premium Lightbox Modal overlay */}
      <AnimatePresence>
        {activeIndex !== null && currentImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 h-[100dvh] bg-black/90 backdrop-blur-xl z-40 flex flex-col overflow-hidden"
            onClick={() => setActiveIndex(null)}
          >
            {/* Top Section - Show Title / Description & Close Button */}
            <div
              className="w-full pt-3 md:pt-4 pb-2 px-16 md:px-20 text-center select-none relative z-50 shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-lg sm:text-2xl md:text-4xl font-serif font-bold text-white tracking-wide drop-shadow-md truncate">
                {currentImage.title}
              </h2>
              <p className="text-[10px] md:text-sm text-primary uppercase tracking-[0.18em] font-bold mt-1 md:mt-2 italic font-serif capitalize truncate">
                {currentImage.subtitle}
              </p>

              {/* Close Button */}
              <button
                onClick={() => setActiveIndex(null)}
                className="absolute top-3 md:top-4 right-4 md:right-8 bg-white/5 hover:bg-primary/20 border border-white/10 hover:border-primary/50 text-white p-2.5 rounded-full backdrop-blur-md transition-[background-color,border-color,scale] duration-300 shadow-lg cursor-pointer flex items-center justify-center focus:outline-none active:scale-[0.96]"
                aria-label="Chiudi galleria"
              >
                <X size={20} />
              </button>
            </div>

            {/* Center Section - Image & Arrow Navigations */}
            <div className="flex-1 flex items-center justify-center relative min-h-0 px-14 md:px-24 py-2">
              {/* Previous Arrow */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  showPrev();
                }}
                className="absolute left-2 md:left-8 bg-black/55 hover:bg-primary/20 text-white p-2.5 md:p-3.5 rounded-full border border-white/10 hover:border-primary/50 transition-all duration-300 backdrop-blur-md shadow-lg cursor-pointer flex items-center justify-center z-50 focus:outline-none"
                aria-label="Immagine precedente"
              >
                <ChevronLeft size={22} />
              </button>

              {/* Central Image Container (fixed-height wrapper prevents screen height shift) */}
              <div className="relative h-full w-full flex items-center justify-center z-10">
                {/* Premium Centered Loader */}
                {isImageLoading && (
                  <div
                    className="absolute w-28 h-28 md:w-44 md:h-44 bg-zinc-900/60 border border-white/5 rounded-2xl flex items-center justify-center shadow-xl backdrop-blur-md animate-pulse"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="w-10 h-10 border-4 border-white/10 border-t-primary rounded-full animate-spin"></div>
                  </div>
                )}

                <motion.img
                  key={activeIndex}
                  src={currentImage.src}
                  alt={currentImage.alt}
                  onLoad={() => setIsImageLoading(false)}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isImageLoading ? 0 : 1 }}
                  transition={{ duration: 0.25 }}
                  className="max-h-full max-w-full w-auto h-auto object-contain rounded-xl md:rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/10 select-none"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>

              {/* Next Arrow */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  showNext();
                }}
                className="absolute right-2 md:right-8 bg-black/55 hover:bg-primary/20 text-white p-2.5 md:p-3.5 rounded-full border border-white/10 hover:border-primary/50 transition-all duration-300 backdrop-blur-md shadow-lg cursor-pointer flex items-center justify-center z-50 focus:outline-none"
                aria-label="Immagine successiva"
              >
                <ChevronRight size={22} />
              </button>
            </div>

            {/* Bottom Section - Floating Island Thumbnails Row (no stark background, longer span, LTR-safe, constant dimensions) */}
            <div
              className="w-full pb-3 md:pb-6 pt-1 px-3 shrink-0 relative z-50 flex justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                ref={thumbnailsRef}
                className="flex gap-2 md:gap-3 overflow-x-auto justify-start items-center px-3 py-2 w-full max-w-[95vw] md:max-w-5xl scrollbar-none relative"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {images.map((img, idx) => {
                  const isActive = idx === activeIndex;
                  return (
                    <button
                      key={idx}
                      onClick={() => setActiveIndex(idx)}
                      className={`relative shrink-0 transition-all duration-300 w-10 h-10 md:w-14 md:h-14 rounded-lg md:rounded-xl overflow-hidden cursor-pointer flex items-center justify-center ${
                        isActive
                          ? "border-2 border-primary scale-110 opacity-100 z-10"
                          : "border border-white/10 opacity-40 hover:opacity-85 hover:scale-105"
                      }`}
                    >
                      <img
                        src={img.thumbSrc}
                        alt={img.alt}
                        className="w-full h-full object-cover select-none"
                        loading="lazy"
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
