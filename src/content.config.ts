import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";

const spettacoliCollection = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/spettacoli" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      category: z.string(),
      image: image().optional(),
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

export const collections = {
  spettacoli: spettacoliCollection,
};
