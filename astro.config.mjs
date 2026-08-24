// @ts-check
import { defineConfig } from "astro/config";

import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";
import vercel from "@astrojs/vercel";

// https://astro.build/config
export default defineConfig({
  site: "https://sergioprocopio.it",
  output: "static",
  adapter: vercel({
    webAnalytics: { enabled: true },
  }),
  integrations: [react(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
    // Pre-bundle in fase di avvio invece di scoprirle alla prima isola che le
    // importa. Senza questo, in dev Vite ri-ottimizza a metà sessione e i moduli
    // già serviti al browser diventano irraggiungibili: le isole non si idratano
    // e le sezioni, servite con opacity:0, restano invisibili.
    optimizeDeps: {
      include: [
        "react",
        "react-dom",
        "react-dom/client",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        "framer-motion",
        "lucide-react",
      ],
    },
  },
});
