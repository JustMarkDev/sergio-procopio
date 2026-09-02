import { SITE_DESCRIPTION, SITE_TITLE } from "../consts";

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

Per chiedere disponibilità, un preventivo o uno spettacolo per la propria realtà, scrivi a [info@sergioprocopio.it](mailto:info@sergioprocopio.it) oppure apri la [sezione contatti](${link("/#contatti")}).

Telefono: [+39 3805252684](tel:+393805252684).`,
    "",
    "## Dove cercare",
    `- [Tutti gli spettacoli](${link("/spettacoli")})`,
    `- [Calendario degli eventi](${link("/calendario")})`,
    `- [Biografia](${link("/biografia")})`,
    `- [Galleria](${link("/galleria")})`,
    `- [Guida per agenti (llms.txt)](${link("/llms.txt")})`,
    `- [Sitemap XML](${link("/sitemap-index.xml")})`,
  ].join("\n");

export const biographyMarkdown = (biography: AgentBiography) =>
  [
    `# ${biography.title}`,
    `> ${biography.description}`,
    biography.quote ? `\n> “${biography.quote}”` : "",
    "",
    contentBody(biography.body),
    "",
    `Per spettacoli e incontri, visita la [sezione contatti](${link("/#contatti")}).`,
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
    `Per una prenotazione, vai ai [contatti](${link("/#contatti")}).`,
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
    `Per disponibilità e preventivi, apri i [contatti](${link("/#contatti")}).`,
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
    `Per organizzare uno spettacolo, usa i [contatti](${link("/#contatti")}).`,
  ].join("\n");
};

export const privacyMarkdown = () =>
  [
    "# Informativa sulla Privacy",
    "> Informativa sul trattamento dei dati personali del sito sergioprocopio.it.",
    "",
    "Il titolare del trattamento è Sergio Procopio (P.IVA 02470860137), con sede fiscale in Via Genico, 2. Per domande o per esercitare i propri diritti, scrivere a [info@sergioprocopio.it](mailto:info@sergioprocopio.it).",
    "",
    "Il sito utilizza dati di navigazione aggregati per il funzionamento e l'analisi statistica. I dati inviati tramite il modulo di contatto vengono usati esclusivamente per rispondere alla richiesta e conservati per il tempo necessario o previsto dalla legge.",
    "",
    `Leggi anche la [pagina privacy completa](${link("/privacy-policy")}).`,
  ].join("\n");

export const notFoundMarkdown = (pathname: string) =>
  [
    "# Pagina non trovata",
    "",
    `Il percorso \`${pathname || "/"}\` non esiste su sergioprocopio.it.`,
    "",
    "## Dove cercare",
    `- [Guida per agenti](${link("/llms.txt")})`,
    `- [Sitemap XML](${link("/sitemap-index.xml")})`,
    `- [Home](${link("/")})`,
    `- [Catalogo spettacoli](${link("/spettacoli")})`,
    `- [Calendario](${link("/calendario")})`,
  ].join("\n");
