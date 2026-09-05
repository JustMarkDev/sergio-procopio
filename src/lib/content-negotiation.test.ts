import { describe, expect, it } from "vitest";
import {
  addVary,
  isDocumentPath,
  markdownEndpointPath,
  markdownResponse,
  notAcceptableResponse,
  preferredMediaType,
  shouldServeDocumentMarkdown,
} from "./content-negotiation";

const requestWith = (headers: Record<string, string | null>) => ({
  headers: {
    get: (name: string) => headers[name.toLowerCase()] ?? headers[name] ?? null,
  },
});

describe("preferredMediaType", () => {
  it("defaults to HTML when Accept is absent", () => {
    expect(preferredMediaType(null)).toBe("text/html");
  });

  it("selects Markdown when it is explicitly requested", () => {
    expect(preferredMediaType("text/markdown")).toBe("text/markdown");
    expect(preferredMediaType("TEXT/MARKDOWN")).toBe("text/markdown");
  });

  it("honors quality values and client order", () => {
    expect(preferredMediaType("text/html;q=0.5, text/markdown;q=0.9")).toBe(
      "text/markdown",
    );
    expect(preferredMediaType("text/markdown, text/html")).toBe(
      "text/markdown",
    );
    expect(preferredMediaType("text/html, text/markdown")).toBe("text/html");
  });

  it("lets a specific rejection override a wildcard", () => {
    expect(preferredMediaType("text/html;q=0, */*;q=1")).toBe(
      "text/markdown",
    );
    expect(preferredMediaType("text/*;q=0, */*;q=1")).toBeNull();
  });

  it("returns no representation for unsupported media types", () => {
    expect(preferredMediaType("application/json")).toBeNull();
    expect(preferredMediaType("text/html;q=0, text/markdown;q=0")).toBeNull();
  });

  it("treats q parameter names case-insensitively and rejects invalid values", () => {
    expect(preferredMediaType("text/markdown;Q=0, text/html;q=0")).toBeNull();
    expect(preferredMediaType("text/markdown;q=invalid")).toBeNull();
  });
});

describe("shouldServeDocumentMarkdown", () => {
  it("serves Markdown for known AI agents when Accept does not prefer HTML", () => {
    expect(
      shouldServeDocumentMarkdown(
        requestWith({ "user-agent": "ClaudeBot/1.0", accept: "*/*" }),
      ),
    ).toBe(true);
    expect(
      shouldServeDocumentMarkdown(
        requestWith({ "user-agent": "GPTBot", accept: null }),
      ),
    ).toBe(true);
  });

  it("still honors an explicit HTML preference from an agent", () => {
    expect(
      shouldServeDocumentMarkdown(
        requestWith({
          "user-agent": "ClaudeBot/1.0",
          accept: "text/html,application/xhtml+xml",
        }),
      ),
    ).toBe(false);
  });

  it("serves Markdown when Accept explicitly prefers it", () => {
    expect(
      shouldServeDocumentMarkdown(
        requestWith({
          "user-agent": "Mozilla/5.0",
          accept: "text/markdown",
        }),
      ),
    ).toBe(true);
  });
});

describe("document path negotiation", () => {
  it("negotiates HTML document paths and skips APIs, assets and llms.txt", () => {
    expect(isDocumentPath("/")).toBe(true);
    expect(isDocumentPath("/about")).toBe(true);
    expect(isDocumentPath("/contact")).toBe(true);
    expect(isDocumentPath("/privacy")).toBe(true);
    expect(isDocumentPath("/index.html")).toBe(true);
    expect(isDocumentPath("/api/markdown/home")).toBe(false);
    expect(isDocumentPath("/llms.txt")).toBe(false);
    expect(isDocumentPath("/robots.txt")).toBe(false);
    expect(isDocumentPath("/_image")).toBe(false);
  });

  it("maps document URLs onto the Markdown endpoint", () => {
    expect(markdownEndpointPath("/")).toBe("/api/markdown/home");
    expect(markdownEndpointPath("/contact")).toBe("/api/markdown/contact");
    expect(markdownEndpointPath("/privacy/")).toBe("/api/markdown/privacy");
    expect(markdownEndpointPath("/spettacoli/comico")).toBe(
      "/api/markdown/spettacoli/comico",
    );
  });
});

describe("response headers", () => {
  it("adds each Vary token once", () => {
    const headers = new Headers({ Vary: "Accept-Encoding" });

    addVary(headers, "Accept", "Accept-Encoding");

    expect(headers.get("Vary")).toBe("Accept-Encoding, Accept");
  });

  it("returns a Markdown response with the negotiated cache key", async () => {
    const response = markdownResponse("# Home", { status: 404 });

    expect(response.status).toBe(404);
    expect(response.headers.get("Content-Type")).toBe(
      "text/markdown; charset=utf-8",
    );
    expect(response.headers.get("Vary")).toBe("Accept, Accept-Encoding");
    expect(response.headers.get("X-Robots-Tag")).toContain("noindex");
    await expect(response.text()).resolves.toBe("# Home\n");
  });

  it("returns 406 with the same cache variation", async () => {
    const response = notAcceptableResponse();

    expect(response.status).toBe(406);
    expect(response.headers.get("Vary")).toBe("Accept, Accept-Encoding");
    await expect(response.text()).resolves.toContain("text/markdown");
  });
});
