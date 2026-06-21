import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";

const optionalUrl = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.url().optional(),
);

const parseEventDateTime = (dateValue: unknown, timeValue: string) => {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(timeValue)) {
    return null;
  }

  if (typeof dateValue === "string") {
    const dayMonthYear = dateValue.match(/^(\d{2})-(\d{2})-(\d{4})$/);

    if (dayMonthYear) {
      const [, day, month, year] = dayMonthYear;

      return {
        date: new Date(Date.UTC(Number(year), Number(month) - 1, Number(day))),
        time: timeValue,
      };
    }

    const yearMonthDay = dateValue.match(/^(\d{4})-(\d{2})-(\d{2})$/);

    if (yearMonthDay) {
      const [, year, month, day] = yearMonthDay;

      return {
        date: new Date(Date.UTC(Number(year), Number(month) - 1, Number(day))),
        time: timeValue,
      };
    }
  }

  if (dateValue instanceof Date && !Number.isNaN(dateValue.getTime())) {
    return {
      date: new Date(
        Date.UTC(
          dateValue.getUTCFullYear(),
          dateValue.getUTCMonth(),
          dateValue.getUTCDate(),
        ),
      ),
      time: timeValue,
    };
  }

  return null;
};

const eventTimeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);

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
      date: z.union([z.string(), z.date()]),
      time: eventTimeSchema,
      venue: z.string(),
      city: z.string(),
      address: z.string(),
      description: z.string().optional(),
      googleMapsUrl: optionalUrl,
      isPublic: z.boolean().optional().default(true),
      draft: z.boolean().optional().default(false),
    })
    .transform((event, ctx) => {
      const dateTime = parseEventDateTime(event.date, event.time);

      if (!dateTime) {
        ctx.addIssue({
          code: "custom",
          message: "Usa data in formato 28-06-2026 e ora in formato 24 ore, esempio: 20:30",
          path: ["date"],
        });

        return z.NEVER;
      }

      return {
        ...event,
        date: dateTime.date,
        time: dateTime.time,
        title: `${event.spettacolo} al ${event.venue}`,
      };
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
