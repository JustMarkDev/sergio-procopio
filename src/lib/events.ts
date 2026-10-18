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
  const showHrefs = new Map(
    shows
      .filter((show) => !show.data.draft)
      .map((show) => [normalizeTitle(show.data.title), `/spettacoli/${show.id}`]),
  );

  return [
    ...eventi.map((event) => ({
      kind: "spettacolo" as const,
      href: showHrefs.get(normalizeTitle(event.data.name)),
      data: event.data,
    })),
    ...dateCorso.map((event) => ({
      kind: "corso" as const,
      href: corso.length > 0 ? COURSE_PATH : undefined,
      data: event.data,
    })),
  ]
    .filter((event) => !event.data.draft && event.data.isPublic)
    .sort((a, b) => a.data.date.getTime() - b.data.date.getTime());
}
