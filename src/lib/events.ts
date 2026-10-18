import { getCollection } from "astro:content";
import { COURSE_PATH } from "../consts";
import curtain from "../../photoshoot/MyPhoto_198.webp";
import curtainWide from "../../photoshoot/MyPhoto_199.webp";
import curtainPeek from "../../photoshoot/MyPhoto_200.webp";
import coat from "../../photoshoot/MyPhoto_177.webp";
import reach from "../../photoshoot/MyPhoto_186.webp";
import arms from "../../photoshoot/MyPhoto_195.webp";

// Course dates take turns with these photoshoot frames so the list doesn't repeat one picture.
const courseImages = [curtain, coat, curtainWide, reach, curtainPeek, arms];

const normalizeTitle = (title: string) => title.trim().toLowerCase();

// Shows and course dates share one public timeline, each linked to its own page.
export async function getCalendarEvents() {
  const [eventi, dateCorso, shows, corso] = await Promise.all([
    getCollection("eventi"),
    getCollection("dateCorso"),
    getCollection("spettacoli"),
    getCollection("corso"),
  ]);
  const showPages = new Map(
    shows
      .filter((show) => !show.data.draft)
      .map((show) => [
        normalizeTitle(show.data.title),
        { href: `/spettacoli/${show.id}`, image: show.data.image },
      ]),
  );

  const events = [
    ...eventi.map((event) => ({
      kind: "spettacolo" as const,
      href: showPages.get(normalizeTitle(event.data.name))?.href,
      image: showPages.get(normalizeTitle(event.data.name))?.image,
      data: event.data,
    })),
    ...dateCorso.map((event) => ({
      kind: "corso" as const,
      href: corso.length > 0 ? COURSE_PATH : undefined,
      image: undefined as ImageMetadata | undefined,
      data: event.data,
    })),
  ]
    .filter((event) => !event.data.draft && event.data.isPublic)
    .sort((a, b) => a.data.date.getTime() - b.data.date.getTime());

  let courseDates = 0;
  for (const event of events) {
    if (event.kind === "corso") event.image = courseImages[courseDates++ % courseImages.length];
  }
  return events;
}
