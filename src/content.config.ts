import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";

const optionalUrl = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.url().optional(),
);

const parseEventDate = (value: unknown) => {
  if (typeof value === "string") {
    const dayMonthYear = value.match(/^(\d{2})-(\d{2})-(\d{4})$/);

    if (dayMonthYear) {
      const [, day, month, year] = dayMonthYear;
      return `${year}-${month}-${day}`;
    }
  }

  return value;
};

const eventTimeSchema = z.preprocess((value) => {
  if (value instanceof Date) {
    return value.toLocaleTimeString("it-IT", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }

  return value === "" ? undefined : value;
}, z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).optional());

const spettacoliCollection = defineCollection({
  loader: glob({
    pattern: "*.md",
    base: "./src/content/spettacoli",
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
      requisiti: z.string().optional(),
      highlight: z.boolean().optional().default(false),
      draft: z.boolean().optional().default(false),
    }),
});

const eventiCollection = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/eventi" }),
  schema: z
    .object({
      title: z.string().optional(),
      spettacolo: z.string(),
      date: z.preprocess(parseEventDate, z.coerce.date()),
      time: eventTimeSchema,
      venue: z.string(),
      city: z.string(),
      address: z.string(),
      description: z.string().optional(),
      googleMapsUrl: optionalUrl,
      isPublic: z.boolean().optional().default(true),
      draft: z.boolean().optional().default(false),
    })
    .transform((event) => ({
      ...event,
      title: `${event.spettacolo} al ${event.venue}`,
    })),
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
