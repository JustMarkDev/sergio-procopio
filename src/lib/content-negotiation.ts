import {
  shouldServeMarkdown as detectShouldServeMarkdown,
  type MinimalRequest,
} from "@vercel/agent-readability";

export const PRODUCED_MEDIA_TYPES = ["text/html", "text/markdown"] as const;

export type ProducedMediaType = (typeof PRODUCED_MEDIA_TYPES)[number];

const hasFileExtension = (pathname: string) =>
  /\/[^/]*\.[^/]+$/.test(pathname);

/** Paths that participate in HTML/Markdown Accept negotiation. */
export const isDocumentPath = (pathname: string) =>
  !pathname.startsWith("/api/") &&
  !pathname.startsWith("/_") &&
  (!hasFileExtension(pathname) || pathname.toLowerCase().endsWith(".html"));

/** Map a document URL to the internal Markdown representation endpoint. */
export const markdownEndpointPath = (pathname: string) => {
  const normalized = pathname.replace(/^\/+|\/+$/g, "");
  return `/api/markdown/${normalized || "home"}`;
};

/**
 * Prefer Markdown when Accept asks for it, or when an AI agent sends an
 * Accept header that does not distinguish HTML from Markdown.
 */
export const shouldServeDocumentMarkdown = (request: MinimalRequest) =>
  detectShouldServeMarkdown(request).serve;

type AcceptEntry = {
  type: string;
  q: number;
  specificity: number;
  position: number;
};

const qualityValuePattern = /^(?:0(?:\.\d{0,3})?|1(?:\.0{0,3})?)$/;

const parseAccept = (header: string): AcceptEntry[] =>
  header
    .split(",")
    .map((raw, position) => {
      const parts = raw.trim().split(";").map((part) => part.trim());
      const type = parts[0].toLowerCase();
      let q = 1;

      for (const parameter of parts.slice(1)) {
        const separator = parameter.indexOf("=");
        const name = (separator === -1
          ? parameter
          : parameter.slice(0, separator)
        ).trim();

        if (name.toLowerCase() !== "q") continue;

        const value =
          separator === -1 ? "" : parameter.slice(separator + 1).trim();
        q = qualityValuePattern.test(value) ? Number(value) : 0;
        break;
      }

      return {
        type,
        q,
        specificity:
          type === "*/*" ? 0 : type.endsWith("/*") ? 1 : 2,
        position,
      };
    });

const matches = (entry: AcceptEntry, candidate: string) => {
  if (entry.type === "*/*") return true;
  if (entry.type.endsWith("/*")) {
    return candidate.startsWith(entry.type.slice(0, -1));
  }
  return entry.type === candidate;
};

/** Select a representation according to RFC 9110 quality and specificity rules. */
export const preferredMediaType = (
  header: string | null,
): ProducedMediaType | null => {
  if (header === null) return "text/html";

  const entries = parseAccept(header);
  if (entries.length === 0) return "text/html";

  let best: ProducedMediaType | null = null;
  let bestQ = -1;
  let bestPosition = Number.POSITIVE_INFINITY;

  for (const candidate of PRODUCED_MEDIA_TYPES) {
    let matched: AcceptEntry | null = null;

    for (const entry of entries) {
      if (!matches(entry, candidate)) continue;

      if (
        matched === null ||
        entry.specificity > matched.specificity ||
        (entry.specificity === matched.specificity &&
          entry.position < matched.position)
      ) {
        matched = entry;
      }
    }

    if (matched === null || matched.q <= 0) continue;

    if (
      matched.q > bestQ ||
      (matched.q === bestQ && matched.position < bestPosition)
    ) {
      best = candidate;
      bestQ = matched.q;
      bestPosition = matched.position;
    }
  }

  return best;
};

export const addVary = (headers: Headers, ...values: string[]) => {
  const existing = headers.get("Vary");
  const tokens = existing
    ? existing.split(",").map((token) => token.trim()).filter(Boolean)
    : [];

  if (tokens.some((token) => token === "*")) return;

  for (const value of values) {
    if (!tokens.some((token) => token.toLowerCase() === value.toLowerCase())) {
      tokens.push(value);
    }
  }

  headers.set("Vary", tokens.join(", "));
};

export const markdownResponse = (
  body: string,
  init: ResponseInit = {},
): Response => {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "text/markdown; charset=utf-8");
  addVary(headers, "Accept", "Accept-Encoding");

  const status = init.status ?? 200;
  if (
    (status === 404 || status === 410) &&
    !/\bnoindex\b/i.test(headers.get("X-Robots-Tag") ?? "")
  ) {
    headers.append("X-Robots-Tag", "noindex");
  }

  return new Response(`${body.trimEnd()}\n`, {
    ...init,
    headers,
  });
};

export const notAcceptableResponse = () => {
  const headers = new Headers({ "Content-Type": "text/plain; charset=utf-8" });
  addVary(headers, "Accept", "Accept-Encoding");

  return new Response(
    "Not Acceptable\nThis site serves text/html and text/markdown.\n",
    { status: 406, headers },
  );
};
