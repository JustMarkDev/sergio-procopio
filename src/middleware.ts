import { defineMiddleware } from "astro:middleware";
import {
  addVary,
  documentCacheControl,
  documentMarkdownDecision,
  isDocumentPath,
  markdownEndpointPath,
  notAcceptableResponse,
  preferredMediaType,
} from "./lib/content-negotiation";

export const onRequest = defineMiddleware(async (context, next) => {
  const { request } = context;
  const pathname = new URL(request.url).pathname;

  if (!isDocumentPath(pathname) || pathname.startsWith("/api/markdown/")) return next();

  if (preferredMediaType(request.headers.get("accept")) === null) return notAcceptableResponse();

  const decision = documentMarkdownDecision(request);
  const response = decision.serve
    ? await context.rewrite(new URL(markdownEndpointPath(pathname), request.url))
    : await next();

  const headers = new Headers(response.headers);
  addVary(headers, "Accept", "Accept-Encoding");
  // Serve pages from Vercel's CDN; Vary keeps HTML and Markdown cached separately.
  // Short TTL so the upcoming/past split of events rolls over without a redeploy.
  if (request.method === "GET" && response.status === 200 && !headers.has("Cache-Control")) {
    headers.set("Cache-Control", documentCacheControl(decision));
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
});
