import { defineConfig } from "vite-plus";

// Astro owns dev and build (astro.config.mjs). Vite+ provides lint, format and test.
export default defineConfig({
  staged: {
    "*": "vp check --fix",
  },
  lint: {
    jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
    rules: { "vite-plus/prefer-vite-plus-imports": "error" },
    options: { typeAware: true, typeCheck: true },
    ignorePatterns: ["dist/**", ".astro/**", ".vercel/**"],
  },
  fmt: {
    ignorePatterns: ["dist/**", ".astro/**", ".vercel/**"],
  },
});
