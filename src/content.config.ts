import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";

const optionalUrl = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.url().optional(),
);

const spettacoliCollection = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/spettacoli" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      category: z.string(),
      assetFolder: z.string().optional(),
      image: image().optional(),
      galleryImages: z.array(image()).optional().default([]),
      durata: z.string().optional(),
      regia: z.string().optional(),
      eta: z.string().optional(),
      produzione: z.string().optional(),
      tecnico: z.string().optional(),
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
    ticketUrl: optionalUrl,
    isPublic: z.boolean().optional().default(true),
    draft: z.boolean().optional().default(false),
  }),
});

export const collections = {
  spettacoli: spettacoliCollection,
  eventi: eventiCollection,
};
