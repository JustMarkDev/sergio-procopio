import { motion } from "framer-motion";

// The lightbox photo is requested at this width, so the skeleton can match its final size.
const LIGHTBOX_WIDTH = 1200;

interface Props {
  src: string;
  alt: string;
  width: number;
  height: number;
  loading: boolean;
  onLoad: () => void;
}

// While the photo loads, a shimmering block with its exact proportions holds the space.
export default function LightboxImage({ src, alt, width, height, loading, onLoad }: Props) {
  const placeholder = `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${LIGHTBOX_WIDTH}" height="${Math.round((LIGHTBOX_WIDTH * height) / width)}"/>`,
  )}`;

  return (
    <>
      {loading && (
        <img
          src={placeholder}
          alt=""
          aria-hidden="true"
          className="skeleton max-h-full max-w-full w-auto h-auto border border-border select-none"
          onClick={(e) => e.stopPropagation()}
        />
      )}
      <motion.img
        src={src}
        alt={alt}
        onLoad={onLoad}
        initial={{ opacity: 0 }}
        animate={{ opacity: loading ? 0 : 1 }}
        transition={{ duration: 0.25 }}
        className={`max-h-full max-w-full w-auto h-auto object-contain border border-border select-none ${
          loading ? "absolute" : ""
        }`}
        onClick={(e) => e.stopPropagation()}
      />
    </>
  );
}
