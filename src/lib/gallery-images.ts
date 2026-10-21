import { getImage } from "astro:assets";

// Each photo is served at three sizes: lightbox, masonry grid and thumbnail strip.
export async function optimizeGalleryImages<T extends { src: ImageMetadata }>(images: T[]) {
  const unique = [...new Map(images.map((image) => [image.src.src, image])).values()];

  return Promise.all(
    unique.map(async ({ src, ...rest }) => {
      const [large, grid, thumb] = await Promise.all([
        getImage({ src, width: 1200, format: "webp", quality: 80 }),
        getImage({ src, width: 600, format: "webp", quality: 75 }),
        getImage({ src, width: 120, height: 120, format: "webp", quality: 60 }),
      ]);

      return {
        ...rest,
        src: large.src,
        gridSrc: grid.src,
        thumbSrc: thumb.src,
        originalSrc: src.src,
      };
    }),
  );
}
