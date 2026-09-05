import { generateNotFoundMarkdown } from "@vercel/agent-readability";
import { SITE_DESCRIPTION, SITE_TITLE } from "../consts";
import {
  CONTACT_NAP,
  CONTACT_TRUST_EN,
  CONTACT_TRUST_IT,
} from "./contact-trust";

export const SITE_URL = "https://sergioprocopio.it";

type AgentShow = {
  id: string;
  title: string;
  description: string;
  category: string;
  durata?: string;
  regia?: string;
  eta?: string;
  produzione?: string;
  tecnico?: string;
  requisiti?: string;
  body?: string;
};

type AgentBiography = {
  title: string;
  description: string;
  quote?: string;
  body?: string;
};

type AgentGalleryShow = {
  id: string;
  title: string;
  galleryImageCount: number;
};

export type AgentEvent = {
  title: string;
  date: Date;
  time?: string;
  venue: string;
  city: string;
  address: string;
  googleMapsUrl: string;
};

const link = (path: string) => new URL(path, SITE_URL).toString();

const contentBody = (body?: string) => body?.trim() || "";

export const homepageMarkdown = (shows: readonly AgentShow[]) =>
  [
    `# ${SITE_TITLE.split(" |")[0]}`,
    `> ${SITE_DESCRIPTION}`,
    "",
    "Sergio Procopio è attore, mimo e regista teatrale. Dal 1975 porta in scena il comico senza parole con spettacoli educativi e poetici per scuole, parrocchie, associazioni, comuni, teatri e famiglie. La sua attività unisce clownerie, pantomima, musica, riflessione e coinvolgimento del pubblico.",
    "",
    "## Quando scegliere Sergio Procopio",
    "È una scelta adatta quando serve uno spettacolo teatrale senza dipendere dal linguaggio parlato, oppure un incontro che aiuti bambini, ragazzi e famiglie a riflettere su educazione, tecnologia, bullismo, memoria, ambiente, pace e responsabilità.",
    "",
    "## Spettacoli in evidenza",
    ...shows.map(
      (show) =>
        `- [${show.title}](${link(`/spettacoli/${show.id}`)}): ${show.description}`,
    ),
    "",
    `## Contatti e prenotazioni

Per chiedere disponibilità, un preventivo o uno spettacolo per la propria realtà, scrivi a [info@sergioprocopio.it](mailto:info@sergioprocopio.it) oppure apri la [pagina contatti](${link("/contatti")}).

Telefono: [+39 3805252684](tel:+393805252684).`,
    "",
    "## Dove cercare",
    `- [Tutti gli spettacoli](${link("/spettacoli")})`,
    `- [Calendario degli eventi](${link("/calendario")})`,
    `- [Biografia](${link("/biografia")})`,
    `- [About Sergio Procopio](${link("/about")})`,
    `- [Contatti](${link("/contatti")})`,
    `- [Contact](${link("/contact")})`,
    `- [Privacy](${link("/privacy")})`,
    `- [Galleria](${link("/galleria")})`,
    `- [Guida per agenti (llms.txt)](${link("/llms.txt")})`,
    `- [Sitemap XML](${link("/sitemap.xml")})`,
    `- [Sitemap Markdown](${link("/sitemap.md")})`,
  ].join("\n");

export const biographyMarkdown = (
  biography: AgentBiography,
  heading = biography.title,
) =>
  [
    `# ${heading}`,
    `> ${biography.description}`,
    biography.quote ? `\n> “${biography.quote}”` : "",
    "",
    contentBody(biography.body),
    "",
    `Per spettacoli e incontri, visita la [pagina contatti](${link("/contatti")}).`,
  ].join("\n");

export const showsMarkdown = (shows: readonly AgentShow[]) =>
  [
    "# Spettacoli teatrali",
    "> Catalogo degli spettacoli di Sergio Procopio per scuole, parrocchie, associazioni, teatri e famiglie.",
    "",
    ...shows.map((show) =>
      [
        `## [${show.title}](${link(`/spettacoli/${show.id}`)})`,
        show.description,
        show.durata ? `Durata: ${show.durata}.` : "",
      ]
        .filter(Boolean)
        .join("\n\n"),
    ),
    "",
    `Per una prenotazione, vai ai [contatti](${link("/contatti")}).`,
  ].join("\n\n");

export const showMarkdown = (show: AgentShow) =>
  [
    `# ${show.title}`,
    `> ${show.description}`,
    "",
    "## Scheda dello spettacolo",
    `- Categoria: ${show.category}`,
    show.durata ? `- Durata: ${show.durata}` : "",
    show.regia ? `- Regia: ${show.regia}` : "",
    show.eta ? `- Età consigliata: ${show.eta}` : "",
    show.produzione ? `- Produzione: ${show.produzione}` : "",
    show.tecnico ? `- Tecnico: ${show.tecnico}` : "",
    show.requisiti ? `- Requisiti: ${show.requisiti}` : "",
    "",
    contentBody(show.body),
    "",
    `Per disponibilità e preventivi, apri i [contatti](${link("/contatti")}).`,
  ]
    .filter((line) => line !== "")
    .join("\n");

export const galleryMarkdown = (shows: readonly AgentGalleryShow[]) =>
  [
    "# Galleria",
    "> Immagini dagli spettacoli teatrali di Sergio Procopio.",
    "",
    ...shows.map(
      (show) =>
        `- [${show.title}](${link(`/spettacoli/${show.id}`)}): ${show.galleryImageCount} immagini`,
    ),
    "",
    `Per conoscere gli spettacoli, consulta il [catalogo](${link("/spettacoli")}).`,
  ].join("\n");

export const calendarMarkdown = (events: readonly AgentEvent[]) => {
  const dateFormatter = new Intl.DateTimeFormat("it-IT", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return [
    "# Calendario ufficiale",
    "> Date pubbliche, spettacoli e appuntamenti in programma.",
    "",
    ...(events.length > 0
      ? events.map((event) => {
          const when = `${dateFormatter.format(event.date)}${event.time ? ` alle ${event.time}` : ""}`;
          return `- **${when}** — ${event.title}, ${event.venue}, ${event.city}. ${event.address}. [Mappa](${event.googleMapsUrl})`;
        })
      : ["Non ci sono eventi pubblici in calendario."]),
    "",
    `Per organizzare uno spettacolo, usa i [contatti](${link("/contatti")}).`,
  ].join("\n");
};

export const contactMarkdown = (locale: "it" | "en" = "it") => {
  const isEnglish = locale === "en";
  const trust = isEnglish ? CONTACT_TRUST_EN : CONTACT_TRUST_IT;

  return [
    isEnglish ? "# Contact" : "# Contatti",
    isEnglish
      ? "> Official Contact page for Sergio Procopio."
      : "> Parliamo della prossima data.",
    "",
    trust,
    "",
    `Email: [${CONTACT_NAP.email}](mailto:${CONTACT_NAP.email}).`,
    `Telefono: [${CONTACT_NAP.telephoneDisplay}](tel:${CONTACT_NAP.telephone}).`,
    `Indirizzo: ${CONTACT_NAP.streetAddress}. P.IVA ${CONTACT_NAP.vat}.`,
    "",
    `Compila il [modulo Contatti](${link("/contatti")}) oppure la pagina inglese [Contact](${link("/contact")}).`,
    "",
    isEnglish ? "## How we organise" : "## Come ci organizziamo",
    isEnglish
      ? "1. Write to me: tell me the period, the venue and the audience you want to involve."
      : "1. Scrivimi: raccontami il periodo, il luogo e il pubblico che vorresti coinvolgere.",
    isEnglish
      ? "2. I reply: we check availability and define a proposal with a quote."
      : "2. Ti rispondo io: verifichiamo la disponibilità e definiamo una proposta con un preventivo.",
    isEnglish
      ? "3. We confirm the date: we agree the technical details so the show can come to you."
      : "3. Confermiamo la data: accordiamo i dettagli tecnici per portare lo spettacolo da te.",
  ].join("\n");
};

export const privacyMarkdown = () =>
  [
    "# Informativa sulla Privacy",
    "> Informativa sul trattamento dei dati personali del sito sergioprocopio.it.",
    "",
    "Il titolare del trattamento è Sergio Procopio (P.IVA 02470860137), con sede fiscale in Via Genico, 2. Per domande sulla privacy o per esercitare i propri diritti (accesso, rettifica, cancellazione, limitazione, opposizione, portabilità), scrivere a [info@sergioprocopio.it](mailto:info@sergioprocopio.it).",
    "",
    "Il sito utilizza dati di navigazione aggregati per il funzionamento e l'analisi statistica. I dati inviati tramite il modulo di contatto — nome, email, oggetto e messaggio — vengono usati esclusivamente per rispondere alla richiesta e conservati per il tempo necessario o previsto dalla legge. Non sono ceduti a terzi per finalità di marketing.",
    "",
    "Base giuridica principale: legittimo interesse per la navigazione tecnica e consenso o misure precontrattuali per le richieste di contatto. I dettagli completi su cookie, analitica e diritti dell'interessato sono nella pagina privacy estesa.",
    "",
    `Leggi la [pagina privacy](${link("/privacy")}).`,
  ].join("\n");

export const notFoundMarkdown = (pathname: string) => {
  const path = pathname.startsWith("/") ? pathname : `/${pathname || ""}`;
  const standard = generateNotFoundMarkdown(path || "/", {
    baseUrl: SITE_URL,
    sitemapUrl: "/sitemap.md",
    indexUrl: "/llms.txt",
    exampleUrl: "/spettacoli",
  });

  return [
    standard.trimEnd(),
    "",
    "## Where to look next on this site",
    `- [Sitemap XML](${link("/sitemap.xml")})`,
    `- [Home](${link("/")})`,
    `- [About Sergio Procopio](${link("/about")})`,
    `- [Contact](${link("/contact")})`,
    `- [Contatti](${link("/contatti")})`,
    `- [Privacy](${link("/privacy")})`,
    `- [Catalogo spettacoli](${link("/spettacoli")})`,
    `- [Calendario](${link("/calendario")})`,
  ].join("\n");
};
