import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import FeaturedShows from "./FeaturedShows";
import GalleryView from "./GalleryView";
import ShowGallery from "./ShowGallery";

const image = {
  src: "/large.webp",
  gridSrc: "/grid.webp",
  thumbSrc: "/thumb.webp",
  originalSrc: "/original.webp",
  alt: "Show photograph",
  title: "Show",
  subtitle: "Scene",
  showId: "show",
  width: 1000,
  height: 1333,
};

describe("server-rendered image loading", () => {
  it("reserves the show image's aspect ratio before it loads", () => {
    const html = renderToStaticMarkup(createElement(ShowGallery, {
      mainImageSrc: image.src,
      mainImageOriginalSrc: image.originalSrc,
      mainImageWidth: image.width,
      mainImageHeight: image.height,
      images: [image],
      alt: image.alt,
    }));
    const img = html.match(/<img\b[^>]*>/)?.[0];
    expect(img).toContain('width="1000"');
    expect(img).toContain('height="1333"');
  });

  it("keeps below-fold featured images lazy and responsive", () => {
    const html = renderToStaticMarkup(createElement(FeaturedShows, {
      shows: [{
        id: "show", title: "Show", category: "Theatre", description: "Description",
        image: { src: "/card.webp", srcSet: "/small.webp 400w, /card.webp 800w", width: 800, height: 600 },
      }],
    }));
    const img = html.match(/<img\b[^>]*>/)?.[0];
    expect(img).toContain('loading="lazy"');
    expect(img).not.toContain('fetchPriority="high"');
    expect(img).toContain('srcSet="/small.webp 400w, /card.webp 800w"');
    expect(img).toContain('sizes="');
  });

  it("shows gallery photos without hydration and prioritizes only the first", () => {
    const html = renderToStaticMarkup(createElement(GalleryView, {
      images: [image, { ...image, originalSrc: "/second.webp" }],
    }));
    const images = html.match(/<img\b[^>]*>/g)!;
    expect(images).toHaveLength(2);
    expect(images[0]).toContain('fetchPriority="high"');
    expect(images[0]).toContain('loading="eager"');
    expect(images[1]).not.toContain('fetchPriority="high"');
    expect(images[1]).toContain('loading="lazy"');
    for (const img of images) expect(img).not.toContain("opacity-0");
  });
});
