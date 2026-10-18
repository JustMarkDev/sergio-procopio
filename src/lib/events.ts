import { getCollection } from "astro:content";
import { COURSE_PATH } from "../consts";

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

  return [
    ...eventi.map((event) => ({
      kind: "spettacolo" as const,
      href: showPages.get(normalizeTitle(event.data.name))?.href,
      image: showPages.get(normalizeTitle(event.data.name))?.image,
      data: event.data,
    })),
    ...dateCorso.map((event) => ({
      kind: "corso" as const,
      href: corso.length > 0 ? COURSE_PATH : undefined,
      image: corso[0]?.data.image,
      data: event.data,
    })),
  ]
    .filter((event) => !event.data.draft && event.data.isPublic)
    .sort((a, b) => a.data.date.getTime() - b.data.date.getTime());
}
