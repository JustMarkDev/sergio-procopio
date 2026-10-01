import { defineConfig } from "vite-plus";

// Astro owns dev and build (astro.config.mjs). Vite+ provides lint, format and test.
export default defineConfig({
  lint: {
    options: { typeAware: true, typeCheck: true },
    ignorePatterns: ["dist/**", ".astro/**", ".vercel/**"],
  },
  fmt: {
    ignorePatterns: ["dist/**", ".astro/**", ".vercel/**"],
  },
});
