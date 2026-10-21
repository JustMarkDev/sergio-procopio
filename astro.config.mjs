// @ts-check
import { readdirSync, readFileSync } from "node:fs";
import { basename } from "node:path";
import { defineConfig } from "astro/config";

import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";
import vercel from "@astrojs/vercel";
import { SITE_URL as siteUrl } from "./src/consts";

const showsDirectory = new URL("./src/content/spettacoli/", import.meta.url);
const publicShowPages = readdirSync(showsDirectory)
  .filter((file) => file.endsWith(".md"))
  .flatMap((file) => {
    const source = readFileSync(new URL(file, showsDirectory), "utf8");
    if (/^draft:\s*["']?true["']?\s*$/m.test(source)) return [];

    const slug = source.match(/^slug:\s*["']?([^"'\s]+)["']?\s*$/m)?.[1] ?? basename(file, ".md");

    return [new URL(`/spettacoli/${slug}`, siteUrl).toString()];
  });

// https://astro.build/config
export default defineConfig({
  site: siteUrl,
  output: "server",
  adapter: vercel({
    webAnalytics: { enabled: true },
    // Resize and re-encode (AVIF/WebP) on Vercel's image CDN instead of sharp inside the render function.
    imageService: true,
    imagesConfig: {
      sizes: [
        120, 160, 200, 240, 320, 400, 600, 640, 750, 960, 1000, 1080, 1200, 1280, 1400, 1476, 1500,
        1920, 2048,
      ],
      formats: ["image/avif", "image/webp"],
      // Source URLs are content-hashed, so optimized variants never go stale.
      minimumCacheTTL: 31536000,
    },
  }),
  prefetch: { prefetchAll: true, defaultStrategy: "viewport" },
  integrations: [react(), sitemap({ customPages: publicShowPages })],
  vite: {
    plugins: [tailwindcss()],
  },
});
