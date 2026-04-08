import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const spettacoliCollection = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/spettacoli" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      category: z.string(),
      image: image().optional(),
      duration: z.string().optional(),
      regia: z.string().optional(),
      etaConsigliata: z.string().optional(),
      produzione: z.string().optional(),
      tecnico: z.string().optional(),
      costo: z.string().optional(),
      highlight: z.boolean().optional().default(false),
    }),
});

export const collections = {
  spettacoli: spettacoliCollection,
};
