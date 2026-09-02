import { describe, expect, it } from "vitest";
import {
  addVary,
  markdownResponse,
  notAcceptableResponse,
  preferredMediaType,
} from "./content-negotiation";

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
    await expect(response.text()).resolves.toBe("# Home\n");
  });

  it("returns 406 with the same cache variation", async () => {
    const response = notAcceptableResponse();

    expect(response.status).toBe(406);
    expect(response.headers.get("Vary")).toBe("Accept, Accept-Encoding");
    await expect(response.text()).resolves.toContain("text/markdown");
  });
});
