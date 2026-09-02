import { defineMiddleware } from "astro:middleware";
import {
  addVary,
  notAcceptableResponse,
  preferredMediaType,
} from "./lib/content-negotiation";

const hasFileExtension = (pathname: string) =>
  /\/[^/]*\.[^/]+$/.test(pathname);

const isDocumentPath = (pathname: string) =>
  !pathname.startsWith("/api/") &&
  !pathname.startsWith("/_") &&
  (!hasFileExtension(pathname) || pathname.toLowerCase().endsWith(".html"));

const markdownEndpointPath = (pathname: string) => {
  const normalized = pathname.replace(/^\/+|\/+$/g, "");
  return `/api/markdown/${normalized || "home"}`;
};

export const onRequest = defineMiddleware(async (context, next) => {
  const { request } = context;
  const pathname = new URL(request.url).pathname;
  const isInternalMarkdownRequest = pathname.startsWith("/api/markdown/");
  const shouldNegotiate = isDocumentPath(pathname) && !isInternalMarkdownRequest;
  const preferred = shouldNegotiate
    ? preferredMediaType(request.headers.get("accept"))
    : "text/html";

  if (shouldNegotiate && preferred === null) {
    return notAcceptableResponse();
  }

  const response =
    shouldNegotiate && preferred === "text/markdown"
      ? await context.rewrite(
          new URL(markdownEndpointPath(pathname), request.url),
        )
      : await next();

  const headers = new Headers(response.headers);
  if (shouldNegotiate) {
    addVary(headers, "Accept", "Accept-Encoding");
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
});
