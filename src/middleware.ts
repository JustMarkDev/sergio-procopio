import { defineMiddleware } from "astro:middleware";
import {
  addVary,
  isDocumentPath,
  markdownEndpointPath,
  notAcceptableResponse,
  preferredMediaType,
  shouldServeDocumentMarkdown,
} from "./lib/content-negotiation";

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
    shouldNegotiate && shouldServeDocumentMarkdown(request)
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
