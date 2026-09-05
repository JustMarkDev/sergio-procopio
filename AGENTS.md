# Repository Guidelines

## Project Structure & Module Organization
This repository is an Astro 6 site with React islands. Core application code lives in `src/`.

- `src/pages/`: route entry points such as `index.astro`, `galleria.astro`, and dynamic show pages in `spettacoli/[slug].astro`
- `src/components/`: shared UI; `src/components/custom/` contains site-specific React and Astro components
- `src/actions/`: server action entry points, such as `sendContactEmail` utilizing Resend
- `src/content/spettacoli/`: Markdown content for shows, validated by `src/content.config.ts`
- `src/assets/`: optimized images used by Astro content and pages
- `src/layouts/`, `src/lib/`, `src/styles/`: layout shells, helpers, and global styles
- `public/`: static files served as-is

## Build, Test, and Development Commands
- `bun install`: install dependencies; use Node `>=22.12.0` from `package.json`
- `bun run dev`: start the local Astro dev server on `http://localhost:4321`
- `bun run build`: generate the production build in `dist/`
- `bun run preview`: serve the built site locally for a final check
- `bunx astro check`: run Astro's project checks when validating routes, content, and typings

For the contribution workflow, content locations, and Pull Request expectations, see [`CONTRIBUTING.md`](CONTRIBUTING.md).

## Coding Style & Naming Conventions
Use TypeScript, Astro components, and functional React components. Follow the existing file naming pattern: PascalCase for components (`HeroSection.tsx`, `Layout.astro`), lowercase or slug-style names for routes and content files (`privacy.astro`, `la-grande-guerra.md`).

Use 2-space indentation in React/TypeScript files and 4-space indentation inside `.astro` frontmatter blocks, keeping markup indentation consistent within each component. Avoid reformatting unrelated lines. Keep utility logic in `src/lib/` and content schema changes in `src/content.config.ts`.
The contact form at `src/components/custom/ContactForm.tsx` is wired with a real submission flow using Astro Actions (`actions.sendContactEmail`) and Resend. Keep this wiring in place and ensure any future enhancements preserve server-side validation and secure Resend integration.

This project uses Tailwind CSS v4 configured via `@tailwindcss/vite` plugin. Modern theme overrides, keyframes, custom utility classes, and custom fonts (Inter for sans, Playfair Display for serif) should be added in `src/styles/globals.css` using the `@theme` directive, avoiding old-style `tailwind.config.js`.

## Testing Guidelines
Run `bun run build` before opening a PR; for content or route changes, also run `bunx astro check`. Verify dynamic show pages, gallery pages, and contact form UI manually in `bun run dev`.

## Commit & Pull Request Guidelines
Recent commits use short, imperative subjects such as `image optimization` and `Bun Migration & bump dependencies`. Keep commit titles brief, specific, and focused on one change.

Pull requests should include a concise description, linked issue when relevant, and screenshots for visible UI updates. Call out content-schema edits, new assets under `src/assets/`, and any deployment-impacting config changes such as `astro.config.mjs`.
