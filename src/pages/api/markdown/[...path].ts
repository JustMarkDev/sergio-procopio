import type { APIRoute } from "astro";
import { getCollection, getEntry } from "astro:content";
import {
  biographyMarkdown,
  calendarMarkdown,
  contactMarkdown,
  courseMarkdown,
  galleryMarkdown,
  homepageMarkdown,
  notFoundMarkdown,
  privacyMarkdown,
  showMarkdown,
  showsMarkdown,
  type AgentEvent,
} from "../../../lib/agent-content";
import { markdownResponse } from "../../../lib/content-negotiation";
import { COURSE_PATH } from "../../../consts";

const normalizePath = (path: string | undefined) => (path ?? "").replace(/^\/+|\/+$/g, "");

const publicShows = async () =>
  (await getCollection("spettacoli"))
    .filter((show) => !show.data.draft)
    .map((show) => ({
      id: show.id,
      title: show.data.title,
      description: show.data.description,
      category: show.data.category,
      durata: show.data.durata,
      regia: show.data.regia,
      eta: show.data.eta,
      produzione: show.data.produzione,
      tecnico: show.data.tecnico,
      requisiti: show.data.requisiti,
      costo: show.data.costo,
      body: show.body,
    }));

const publicEvents = async (): Promise<AgentEvent[]> =>
  [
    ...(await getCollection("eventi")).map((event) => ({
      kind: "spettacolo" as const,
      data: event.data,
    })),
    ...(await getCollection("dateCorso")).map((event) => ({
      kind: "corso" as const,
      data: event.data,
    })),
  ]
    .filter((event) => !event.data.draft && event.data.isPublic)
    .sort((a, b) => a.data.date.getTime() - b.data.date.getTime())
    .map((event) => ({
      kind: event.kind,
      title: event.data.title,
      date: event.data.date,
      time: event.data.time,
      venue: event.data.venue,
      city: event.data.city,
      address: event.data.address,
      googleMapsUrl: event.data.googleMapsUrl,
    }));

export const GET: APIRoute = async ({ params, url }) => {
  const path = normalizePath(params.path);

  if (path === "" || path === "home") {
    return markdownResponse(homepageMarkdown(await publicShows()));
  }

  if (path === "biografia" || path === "about") {
    const biography = await getEntry("pages", "biografia");
    if (biography) {
      return markdownResponse(
        biographyMarkdown(
          {
            title: biography.data.title,
            description: biography.data.description,
            quote: biography.data.quote,
            body: biography.body,
          },
          path === "about" ? "About Sergio Procopio" : undefined,
        ),
      );
    }
  }

  if (path === "spettacoli") {
    return markdownResponse(showsMarkdown(await publicShows()));
  }

  if (path.startsWith("spettacoli/")) {
    const slug = path.slice("spettacoli/".length);
    const show = await getEntry("spettacoli", slug);

    if (show && !show.data.draft) {
      return markdownResponse(
        showMarkdown({
          id: show.id,
          title: show.data.title,
          description: show.data.description,
          category: show.data.category,
          durata: show.data.durata,
          regia: show.data.regia,
          eta: show.data.eta,
          produzione: show.data.produzione,
          tecnico: show.data.tecnico,
          requisiti: show.data.requisiti,
          costo: show.data.costo,
          body: show.body,
        }),
      );
    }
  }

  if (path === COURSE_PATH.slice(1)) {
    const corso = (await getCollection("corso"))[0];

    if (corso) {
      return markdownResponse(
        courseMarkdown({
          title: corso.data.title,
          description: corso.data.description,
          docente: corso.data.docente,
          destinatari: corso.data.destinatari,
          eta: corso.data.eta,
          durata: corso.data.durata,
          sede: corso.data.sede,
          costo: corso.data.costo,
          body: corso.body,
        }),
      );
    }
  }

  if (path === "galleria") {
    const shows = (await getCollection("spettacoli"))
      .filter((show) => !show.data.draft)
      .map((show) => ({
        id: show.id,
        title: show.data.title,
        galleryImageCount: show.data.galleryImages.length,
      }));

    return markdownResponse(galleryMarkdown(shows));
  }

  if (path === "calendario") {
    return markdownResponse(calendarMarkdown(await publicEvents()));
  }

  if (path === "contatti") {
    return markdownResponse(contactMarkdown("it"));
  }

  if (path === "contact") {
    return markdownResponse(contactMarkdown("en"));
  }

  if (path === "privacy") {
    return markdownResponse(privacyMarkdown());
  }

  return markdownResponse(notFoundMarkdown(url.pathname.replace(/^\/api\/markdown/, "")), {
    status: 404,
  });
};
