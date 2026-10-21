import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import LightboxImage from "./LightboxImage";

export interface GalleryImage {
  src: string; // 1200px optimized WebP
  gridSrc: string; // 600px optimized WebP
  thumbSrc: string; // 120px optimized WebP
  originalSrc: string; // Original unresolved asset path string
  alt: string;
  title: string;
  subtitle: string;
  width: number;
  height: number;
}

interface Props {
  images: GalleryImage[];
  /** Index of the photo on show, or null while the lightbox is closed. */
  activeIndex: number | null;
  onChange: (index: number | null) => void;
}

const arrowClassName =
  "absolute bg-background/60 hover:bg-primary/30 text-foreground p-2.5 md:p-3.5 border border-border hover:border-primary-soft/60 transition-all duration-300 backdrop-blur-md shadow-lg cursor-pointer flex items-center justify-center z-50 focus:outline-none focus-visible:border-primary-soft";

export default function Lightbox({ images, activeIndex, onChange }: Props) {
  const [isImageLoading, setIsImageLoading] = useState(true);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const thumbnailsRef = useRef<HTMLDivElement>(null);
  const isOpen = activeIndex !== null;

  const showNext = () => onChange(((activeIndex ?? 0) + 1) % images.length);
  const showPrev = () => onChange(((activeIndex ?? 0) - 1 + images.length) % images.length);

  // The header hides itself while a lightbox is open.
  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("gallery-lightbox-change", {
        detail: { isOpen },
      }),
    );

    return () => {
      if (isOpen) {
        window.dispatchEvent(
          new CustomEvent("gallery-lightbox-change", { detail: { isOpen: false } }),
        );
      }
    };
  }, [isOpen]);

  // Move focus into the dialog, and hand it back to the photo that opened it.
  useEffect(() => {
    if (!isOpen) return;
    const opener = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    return () => opener?.focus();
  }, [isOpen]);

  // Reset loading state whenever the active index changes
  useEffect(() => {
    if (activeIndex !== null) {
      setIsImageLoading(true);
    }
  }, [activeIndex]);

  // Proactive Background Preloading: caches adjacent images (next/prev) in background memory
  useEffect(() => {
    if (activeIndex === null || images.length <= 1) return;

    const nextImg = new Image();
    nextImg.src = images[(activeIndex + 1) % images.length].src;

    const prevImg = new Image();
    prevImg.src = images[(activeIndex - 1 + images.length) % images.length].src;
  }, [activeIndex, images]);

  // Prevent parent page scrolling while image is maximized
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow || "";
    };
  }, [isOpen]);

  // Keyboard: Escape closes, arrows browse, Tab stays inside the dialog.
  useEffect(() => {
    if (activeIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onChange(null);
      } else if (e.key === "ArrowRight") {
        onChange((activeIndex + 1) % images.length);
      } else if (e.key === "ArrowLeft") {
        onChange((activeIndex - 1 + images.length) % images.length);
      } else if (e.key === "Tab") {
        const buttons = dialogRef.current?.querySelectorAll<HTMLElement>("button");
        if (!buttons?.length) return;
        const first = buttons[0];
        const last = buttons[buttons.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeIndex, images.length, onChange]);

  // Keep the active thumbnail centered in its strip without scrolling the page.
  // Runs at once when the dialog is already sized; on first open it waits for the entry
  // transition to settle so the measurements are right.
  useEffect(() => {
    if (activeIndex === null || !thumbnailsRef.current) return;

    const container = thumbnailsRef.current;
    const activeElement = container.children[activeIndex] as HTMLElement;
    if (!activeElement) return;

    const runScroll = () => {
      const containerWidth = container.offsetWidth;
      if (containerWidth > 0) {
        container.scrollLeft = Math.max(
          0,
          activeElement.offsetLeft - containerWidth / 2 + activeElement.offsetWidth / 2,
        );
      }
    };

    if (container.offsetWidth > 0) {
      runScroll();
    } else {
      const timer = setTimeout(runScroll, 200);
      return () => clearTimeout(timer);
    }
  }, [activeIndex]);

  const currentImage = activeIndex !== null ? images[activeIndex] : null;

  return (
    <AnimatePresence>
      {activeIndex !== null && currentImage && (
        <motion.div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label="Galleria immagini"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 h-[100dvh] bg-background/95 backdrop-blur-xl z-40 flex flex-col overflow-hidden"
          onClick={() => onChange(null)}
        >
          {/* Top Section - Show Title / Description & Close Button */}
          <div
            className="w-full pt-3 md:pt-4 pb-2 px-16 md:px-20 text-center select-none relative z-50 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            {isImageLoading ? (
              <div aria-hidden="true" className="flex flex-col items-center">
                <div className="skeleton h-6 w-2/3 max-w-md md:h-9" />
                <div className="skeleton mt-2 h-3 w-1/3 max-w-48 md:mt-3 md:h-4" />
              </div>
            ) : (
              <>
                <h2 className="text-lg sm:text-2xl md:text-4xl uppercase tracking-[0.04em] text-foreground truncate">
                  {currentImage.title}
                </h2>
                <p className="text-[10px] md:text-sm text-primary-soft uppercase tracking-[0.18em] font-medium mt-1 md:mt-2 truncate">
                  {currentImage.subtitle}
                </p>
              </>
            )}

            <button
              ref={closeRef}
              onClick={() => onChange(null)}
              className="absolute top-3 md:top-4 right-4 md:right-8 bg-background/60 hover:bg-primary/30 border border-border hover:border-primary-soft/60 text-foreground p-2.5 backdrop-blur-md transition-[background-color,border-color,scale] duration-300 shadow-lg cursor-pointer flex items-center justify-center focus:outline-none focus-visible:border-primary-soft active:scale-[0.96]"
              aria-label="Chiudi galleria"
            >
              <X size={20} />
            </button>
          </div>

          {/* Center Section - Image & Arrow Navigations */}
          <div className="flex-1 flex items-center justify-center relative min-h-0 px-14 md:px-24 py-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                showPrev();
              }}
              className={`${arrowClassName} left-2 md:left-8`}
              aria-label="Immagine precedente"
            >
              <ChevronLeft size={22} />
            </button>

            {/* Fixed-height wrapper prevents screen height shift */}
            <div className="relative h-full w-full flex items-center justify-center z-10">
              <LightboxImage
                key={activeIndex}
                src={currentImage.src}
                alt={currentImage.alt}
                width={currentImage.width}
                height={currentImage.height}
                loading={isImageLoading}
                onLoad={() => setIsImageLoading(false)}
              />
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                showNext();
              }}
              className={`${arrowClassName} right-2 md:right-8`}
              aria-label="Immagine successiva"
            >
              <ChevronRight size={22} />
            </button>
          </div>

          {/* Bottom Section - thumbnails strip */}
          <div
            className="w-full pb-3 md:pb-6 pt-1 px-3 shrink-0 relative z-50 flex justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              ref={thumbnailsRef}
              className="flex gap-2 md:gap-3 overflow-x-auto justify-start items-center px-3 py-2 w-fit max-w-[95vw] md:max-w-5xl scrollbar-none relative"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {images.map((img, idx) => {
                const isActive = idx === activeIndex;
                return (
                  <button
                    key={idx}
                    onClick={() => onChange(idx)}
                    aria-label={`Immagine ${idx + 1} di ${images.length}`}
                    aria-current={isActive ? "true" : undefined}
                    className={`relative shrink-0 transition-all duration-300 w-10 h-10 md:w-14 md:h-14 overflow-hidden cursor-pointer flex items-center justify-center ${
                      isActive
                        ? "border-2 border-primary-soft scale-110 opacity-100 z-10"
                        : "border border-border opacity-40 hover:opacity-85 hover:scale-105"
                    }`}
                  >
                    <img
                      src={img.thumbSrc}
                      alt=""
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
  );
}
