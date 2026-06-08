import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";

const optionalUrl = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.url().optional(),
);

const folderIndexId = ({ entry }: { entry: string }) =>
  entry.replace(/\/index\.md$/, "").replace(/\.md$/, "");

const spettacoliCollection = defineCollection({
  loader: glob({
    pattern: "**/index.md",
    base: "./src/content/spettacoli",
    generateId: folderIndexId,
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      category: z.string(),
      image: image().optional(),
      galleryImages: z.array(image()).optional().default([]),
      durata: z.string().optional(),
      regia: z.string().optional(),
      eta: z.string().optional(),
      produzione: z.string().optional(),
      tecnico: z.string().optional(),
      cast: z.string().optional(),
      requisiti: z.string().optional(),
      highlight: z.boolean().optional().default(false),
      draft: z.boolean().optional().default(false),
    }),
});

const eventiCollection = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/eventi" }),
  schema: z.object({
    title: z.string(),
    spettacolo: z.string().optional(),
    date: z.coerce.date(),
    time: z.string().optional(),
    venue: z.string(),
    city: z.string(),
    address: z.string().optional(),
    description: z.string().optional(),
    googleMapsUrl: optionalUrl,
    ticketUrl: optionalUrl,
    isPublic: z.boolean().optional().default(true),
    draft: z.boolean().optional().default(false),
  }),
});

const pagesCollection = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/pages" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      quote: z.string().optional(),
      image: image().optional(),
    }),
});

export const collections = {
  spettacoli: spettacoliCollection,
  eventi: eventiCollection,
  pages: pagesCollection,
};
