import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface GalleryImage {
  src: {
    src: string;
    width: number;
    height: number;
    format: string;
    [key: string]: any;
  } | string;
  alt: string;
  title: string;
  subtitle: string;
}

interface GalleryViewProps {
  images: GalleryImage[];
}

export default function GalleryView({ images }: GalleryViewProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const thumbnailsRef = useRef<HTMLDivElement>(null);

  // Helper to extract string URL from either string path or Astro ImageMetadata
  const getImgSrc = (src: any): string => {
    if (!src) return "";
    if (typeof src === "string") return src;
    if (src.src) return src.src;
    return "";
  };

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
      <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8 max-w-[1200px] mx-auto">
        {images.map((image, index) => (
          <div
            key={index}
            onClick={() => setActiveIndex(index)}
            className="relative group overflow-hidden rounded-2xl bg-white/5 border border-white/10 break-inside-avoid shadow-lg cursor-pointer transition-all duration-300 hover:border-primary/30"
          >
            <img
              src={getImgSrc(image.src)}
              alt={image.alt}
              loading={index < 2 ? "eager" : "lazy"}
              decoding="async"
              className="w-full h-auto object-contain transition-all duration-700 group-hover:scale-105 group-hover:opacity-60"
            />

            {/* Overlay Gradient on Hover */}
            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none flex flex-col justify-end p-6">
              <h3 className="text-white font-serif font-bold text-xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                {image.title}
              </h3>
              <p className="text-white/70 text-sm italic capitalize transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75 font-serif">
                {image.subtitle}
              </p>
            </div>
          </div>
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
            className="fixed inset-0 bg-black/90 backdrop-blur-xl z-40 flex flex-col justify-between"
            onClick={() => setActiveIndex(null)}
          >
            {/* Top Section - Show Title / Description & Close Button */}
            <div
              className="w-full pt-24 md:pt-28 pb-4 px-6 text-center select-none relative z-50 shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl md:text-4xl font-serif font-bold text-white tracking-wide drop-shadow-md">
                {currentImage.title}
              </h2>
              <p className="text-xs md:text-sm text-primary uppercase tracking-[0.2em] font-bold mt-2 italic font-serif capitalize">
                {currentImage.subtitle}
              </p>

              {/* Close Button: Explicit X at top right under sticky navbar */}
              <button
                onClick={() => setActiveIndex(null)}
                className="absolute top-24 right-4 md:right-8 bg-white/5 hover:bg-primary/20 border border-white/10 hover:border-primary/50 text-white p-2.5 rounded-full backdrop-blur-md transition-all duration-300 shadow-lg cursor-pointer flex items-center justify-center focus:outline-none"
                aria-label="Chiudi galleria"
              >
                <X size={20} />
              </button>
            </div>

            {/* Center Section - Image & Arrow Navigations */}
            <div className="flex-1 flex items-center justify-center relative min-h-0 px-4 md:px-24">
              {/* Previous Arrow */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  showPrev();
                }}
                className="absolute left-4 md:left-8 bg-black/40 hover:bg-primary/20 text-white p-3.5 rounded-full border border-white/10 hover:border-primary/50 transition-all duration-300 backdrop-blur-md shadow-lg cursor-pointer flex items-center justify-center z-50 focus:outline-none"
                aria-label="Immagine precedente"
              >
                <ChevronLeft size={24} />
              </button>

              {/* Central Image Container (fixed-height wrapper prevents screen height shift) */}
              <div className="relative h-[60vh] md:h-[70vh] w-full max-w-[95vw] md:max-w-[85vw] flex items-center justify-center z-10">
                <motion.img
                  key={activeIndex}
                  src={getImgSrc(currentImage.src)}
                  alt={currentImage.alt}
                  initial={{ opacity: 0.7 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="max-h-full max-w-full w-auto h-auto object-contain rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/10 select-none"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>

              {/* Next Arrow */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  showNext();
                }}
                className="absolute right-4 md:right-8 bg-black/40 hover:bg-primary/20 text-white p-3.5 rounded-full border border-white/10 hover:border-primary/50 transition-all duration-300 backdrop-blur-md shadow-lg cursor-pointer flex items-center justify-center z-50 focus:outline-none"
                aria-label="Immagine successiva"
              >
                <ChevronRight size={24} />
              </button>
            </div>

            {/* Bottom Section - Floating Island Thumbnails Row (no stark background, longer span, LTR-safe, constant dimensions) */}
            <div
              className="w-full pb-8 pt-2 px-4 shrink-0 relative z-50 flex justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                ref={thumbnailsRef}
                className="flex gap-3 overflow-x-auto justify-start items-center px-4 py-2 w-full max-w-[95vw] md:max-w-5xl scrollbar-none relative"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {images.map((img, idx) => {
                  const isActive = idx === activeIndex;
                  return (
                    <button
                      key={idx}
                      onClick={() => setActiveIndex(idx)}
                      className={`relative shrink-0 transition-all duration-300 w-12 h-12 md:w-14 md:h-14 rounded-xl overflow-hidden cursor-pointer flex items-center justify-center ${
                        isActive
                          ? "border-2 border-primary scale-110 opacity-100 z-10"
                          : "border border-white/10 opacity-40 hover:opacity-85 hover:scale-105"
                      }`}
                    >
                      <img
                        src={getImgSrc(img.src)}
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
