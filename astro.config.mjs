// @ts-check
import { readdirSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";
import { defineConfig } from "astro/config";

import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";
import vercel from "@astrojs/vercel";

const siteUrl = "https://sergioprocopio.it";
const showsDirectory = new URL("./src/content/spettacoli/", import.meta.url);
const publicShowPages = readdirSync(showsDirectory)
  .filter((file) => file.endsWith(".md"))
  .flatMap((file) => {
    const source = readFileSync(join(showsDirectory.pathname, file), "utf8");
    if (/^draft:\s*true\s*$/m.test(source)) return [];

    const slug =
      source.match(/^slug:\s*(\S+)\s*$/m)?.[1] ?? basename(file, ".md");

    return [new URL(`/spettacoli/${slug}`, siteUrl).toString()];
  });

// https://astro.build/config
export default defineConfig({
  site: siteUrl,
  output: "server",
  adapter: vercel({
    webAnalytics: { enabled: true },
  }),
  integrations: [react(), sitemap({ customPages: publicShowPages })],
  vite: {
    plugins: [tailwindcss()],
  },
});
