import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";
import { createGoogleMapsSearchUrl } from "./lib/google-maps";
import {
  normalizeEventAddress,
  normalizeEventLabel,
} from "./lib/text-normalization";

const parseEventDateTime = (dateValue: unknown, timeValue?: string) => {
  if (timeValue && !/^([01]\d|2[0-3]):[0-5]\d$/.test(timeValue)) {
    return null;
  }

  if (typeof dateValue === "string") {
    const dayMonthYearTime = dateValue.match(
      /^(\d{2})-(\d{2})-(\d{4})\s+([01]\d|2[0-3]):([0-5]\d)$/,
    );

    if (dayMonthYearTime) {
      const [, day, month, year, hour, minute] = dayMonthYearTime;

      return {
        date: new Date(Date.UTC(Number(year), Number(month) - 1, Number(day))),
        time: `${hour}:${minute}`,
      };
    }

    const dayMonthYear = dateValue.match(/^(\d{2})-(\d{2})-(\d{4})$/);

    if (dayMonthYear && timeValue) {
      const [, day, month, year] = dayMonthYear;

      return {
        date: new Date(Date.UTC(Number(year), Number(month) - 1, Number(day))),
        time: timeValue,
      };
    }

    const yearMonthDay = dateValue.match(/^(\d{4})-(\d{2})-(\d{2})$/);

    if (yearMonthDay && timeValue) {
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
      time:
        timeValue ??
        dateValue.toLocaleTimeString("it-IT", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
          timeZone: "UTC",
        }),
    };
  }

  return null;
};

const eventTimeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/)
  .optional();

const eventLabelSchema = z.string().transform(normalizeEventLabel);
const eventAddressSchema = z.string().transform(normalizeEventAddress);

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
      produzione: z.string().optional().default("Teatro Procopio"),
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
      venue: eventLabelSchema,
      city: eventLabelSchema,
      address: eventAddressSchema,
      isPublic: z.boolean().optional().default(true),
      draft: z.boolean().optional().default(false),
    })
    .transform((event, ctx) => {
      const dateTime = parseEventDateTime(event.date, event.time);

      if (!dateTime) {
        ctx.addIssue({
          code: "custom",
          message: "Usa data e ora in formato 28-06-2026 20:30",
          path: ["date"],
        });

        return z.NEVER;
      }

      return {
        ...event,
        date: dateTime.date,
        time: dateTime.time,
        title: `${event.spettacolo} al ${event.venue}`,
        googleMapsUrl: createGoogleMapsSearchUrl(event.address, event.city),
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
