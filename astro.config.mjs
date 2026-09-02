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
  .filter(
    (file) =>
      !/^draft:\s*true\s*$/m.test(
        readFileSync(join(showsDirectory.pathname, file), "utf8"),
      ),
  )
  .map(
    (file) =>
      new URL(
        `/spettacoli/${basename(file, ".md")}`,
        siteUrl,
      ).toString(),
  );

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
