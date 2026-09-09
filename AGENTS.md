# Agent guide

## Sources of truth

- Use Bun and the scripts in `package.json`. Treat `package.json`, `astro.config.mjs`, and `src/content.config.ts` as authoritative for the runtime, deployment, and content schemas.
- Read the relevant implementation and tests before changing behavior. Match nearby code instead of introducing a second pattern.
- Keep changes scoped. Preserve unrelated work already present in the working tree.

## Architecture

- Build pages and layouts with Astro. Add a React island only when the browser needs state or interaction.
- Put reusable domain logic in `src/lib/` and cover it with colocated Vitest tests.
- Store editorial data in `src/content/`. Update `src/content.config.ts` when a collection shape changes, then update every affected Markdown entry.
- Import images that Astro should optimize from `src/assets/`. Reserve `public/` for files that must keep a fixed URL or pass through unchanged.
- Keep public copy in Italian unless the route is explicitly English. Preserve established names, dates, and show details unless the task supplies replacements.

## Public content parity

The site serves both HTML and agent-readable Markdown. When a public route, field, filter, or piece of editorial content changes, inspect these paths and update every affected representation:

- HTML routes in `src/pages/`
- Markdown generation in `src/pages/api/markdown/[...path].ts` and `src/lib/agent-content.ts`
- content negotiation in `src/middleware.ts` and `src/lib/content-negotiation.ts`
- discovery files `public/llms.txt` and `public/sitemap.md`

The change is complete when HTML and Markdown expose the same public facts and the negotiation tests cover any new route behavior.

## Contact form boundary

`src/components/custom/ContactForm.tsx` submits to the `sendContactEmail` Astro Action. Keep validation and email delivery on the server.

When changing a contact field or limit, update the client form and `src/actions/contact-schema.ts` together. Preserve the honeypot response, email-header sanitization, HTML escaping, and server-only `RESEND_API_KEY` access. Extend the schema or security tests for every changed trust rule.

## Styling and accessibility

- Use Tailwind CSS v4 through the existing Vite plugin. Define theme tokens, fonts, animations, and shared CSS in `src/styles/globals.css` with `@theme` and the existing layers.
- Preserve visible focus states, semantic labels, keyboard access, and reduced-motion behavior when editing interactive UI.
- Match the local format: two spaces in TypeScript and TSX; four spaces in Astro frontmatter and markup. Avoid formatting unrelated lines.

## Verification

For code or content changes, run:

```sh
bun run test
bun run check
bun run build
```

For a visible change, also run `bun run dev` and inspect every affected route at mobile and desktop widths. Exercise loading, empty, success, and error states that the change touches.

Before handing off, run `git diff --check` and review the final diff for unrelated edits. Report each validation command and any failure that remains.
