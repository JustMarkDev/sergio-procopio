import type { APIContext } from "astro";
import { describe, expect, it, vi } from "vitest";
import {
  biographyMarkdown,
  contactMarkdown,
  homepageMarkdown,
  notFoundMarkdown,
  privacyMarkdown,
  showMarkdown,
} from "./agent-content";
import { contactTrustPlainText } from "./contact-trust";
import { GET } from "../pages/api/markdown/[...path]";

vi.mock("astro:content", () => ({
  getCollection: vi.fn(),
  getEntry: vi.fn(),
}));

describe("agent content", () => {
  it("gives the homepage a useful Markdown overview and recovery links", () => {
    const markdown = homepageMarkdown([
      {
        id: "comico",
        title: "Comico",
        description: "Uno spettacolo poetico per tutte le età.",
        category: "Tutti",
        durata: "1 ora",
      },
    ]);

    expect(markdown).toContain("# Sergio Procopio");
    expect(markdown).toContain("## Quando scegliere Sergio Procopio");
    expect(markdown).toContain(
      "https://sergioprocopio.it/spettacoli/comico",
    );
    expect(markdown).toContain("https://sergioprocopio.it/about");
    expect(markdown).toContain("https://sergioprocopio.it/llms.txt");
    expect(markdown).toContain("https://sergioprocopio.it/sitemap.xml");
    expect(markdown.length).toBeGreaterThan(500);
  });

  it("can present the verified biography under the About heading", () => {
    const markdown = biographyMarkdown(
      {
        title: "Biografia",
        description: "La storia di Sergio Procopio.",
        body: "## Una vita dedicata all'arte\n\nUna lunga esperienza teatrale.",
      },
      "About Sergio Procopio",
    );

    expect(markdown).toMatch(/^# About Sergio Procopio\n/);
    expect(markdown).toContain("## Una vita dedicata all'arte");
  });

  it("keeps show metadata and editorial body together", () => {
    const markdown = showMarkdown({
      id: "comico",
      title: "Comico",
      description: "Uno spettacolo poetico.",
      category: "Tutti",
      durata: "1 ora",
      body: "## Trama\n\nUna storia comica e coinvolgente.",
    });

    expect(markdown).toContain("- Categoria: Tutti");
    expect(markdown).toContain("## Trama");
    expect(markdown).toContain("https://sergioprocopio.it/contatti");
  });

  it("provides Italian and English contact trust pages over 500 characters", () => {
    const italian = contactMarkdown("it");
    const english = contactMarkdown("en");

    expect(italian).toMatch(/^# Contatti\n/);
    expect(english).toMatch(/^# Contact\n/);
    expect(italian.length).toBeGreaterThan(500);
    expect(english.length).toBeGreaterThan(500);
    expect(contactTrustPlainText("it").length).toBeGreaterThan(500);
    expect(contactTrustPlainText("en").length).toBeGreaterThan(500);
    expect(italian).toContain("[info@sergioprocopio.it](mailto:info@sergioprocopio.it)");
    expect(italian).toContain("[+39 3805252684](tel:+393805252684)");
    expect(italian).toContain("Via Genico, 2");
    expect(english).toContain("official Contact page");
    expect(italian).toContain("https://sergioprocopio.it/contatti");
    expect(italian).toContain("https://sergioprocopio.it/contact");
    expect(italian).toContain("1. Scrivimi: raccontami il periodo, il luogo e il pubblico");
    expect(english).toContain("1. Write to me: tell me the period, the venue and the audience");
  });

  it("summarizes privacy trust information", () => {
    const markdown = privacyMarkdown();

    expect(markdown).toMatch(/^# Informativa sulla Privacy\n/);
    expect(markdown.length).toBeGreaterThan(500);
    expect(markdown).toContain("P.IVA 02470860137");
    expect(markdown).toContain("https://sergioprocopio.it/privacy");
    expect(markdown).not.toContain("privacy-policy");
  });

  it.each([
    ["contatti", "it"],
    ["contatti/", "it"],
    ["contact", "en"],
    ["contact/", "en"],
  ] as const)(
    "serves %s as Markdown with the negotiated cache headers",
    async (path, locale) => {
      const response = await GET({
        params: { path },
        url: new URL(`/api/markdown/${path}`, "https://sergioprocopio.it"),
      } as unknown as APIContext);

      expect(response.status).toBe(200);
      expect(response.headers.get("Content-Type")).toBe("text/markdown; charset=utf-8");
      expect(response.headers.get("Vary")).toBe("Accept, Accept-Encoding");
      await expect(response.text()).resolves.toBe(`${contactMarkdown(locale)}\n`);
    },
  );

  it("serves privacy as Markdown trust content", async () => {
    const response = await GET({
      params: { path: "privacy" },
      url: new URL("/api/markdown/privacy", "https://sergioprocopio.it"),
    } as unknown as APIContext);

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("text/markdown; charset=utf-8");
    expect(response.headers.get("Vary")).toBe("Accept, Accept-Encoding");
    await expect(response.text()).resolves.toBe(`${privacyMarkdown()}\n`);
  });

  it("returns 404 Markdown for the removed privacy-policy path", async () => {
    const response = await GET({
      params: { path: "privacy-policy" },
      url: new URL("/api/markdown/privacy-policy", "https://sergioprocopio.it"),
    } as unknown as APIContext);

    expect(response.status).toBe(404);
    expect(response.headers.get("X-Robots-Tag")).toContain("noindex");
  });

  it("returns a Markdown 404 with sitemap and trust-page recovery links", async () => {
    const response = await GET({
      params: { path: "some-path-that-does-not-exist" },
      url: new URL(
        "/api/markdown/some-path-that-does-not-exist",
        "https://sergioprocopio.it",
      ),
    } as unknown as APIContext);

    expect(response.status).toBe(404);
    expect(response.headers.get("Content-Type")).toBe("text/markdown; charset=utf-8");
    expect(response.headers.get("Vary")).toBe("Accept, Accept-Encoding");
    expect(response.headers.get("X-Robots-Tag")).toContain("noindex");

    const markdown = await response.text();
    expect(markdown).toContain("# Page Not Found");
    expect(markdown).toContain("`/some-path-that-does-not-exist`");
    expect(markdown).toContain("https://sergioprocopio.it/llms.txt");
    expect(markdown).toContain("https://sergioprocopio.it/sitemap.md");
    expect(markdown).toContain("https://sergioprocopio.it/sitemap.xml");
    expect(markdown).toContain("https://sergioprocopio.it/about");
    expect(markdown).toContain("https://sergioprocopio.it/contatti");
    expect(markdown).toContain("https://sergioprocopio.it/contact");
    expect(markdown).toContain("https://sergioprocopio.it/privacy");
  });

  it("points a missing path to the sitemap and agent guide", () => {
    const markdown = notFoundMarkdown("/missing");

    expect(markdown).toContain("# Page Not Found");
    expect(markdown).toContain("`/missing`");
    expect(markdown).toContain("https://sergioprocopio.it/llms.txt");
    expect(markdown).toContain("https://sergioprocopio.it/sitemap.md");
    expect(markdown).toContain("https://sergioprocopio.it/sitemap.xml");
    expect(markdown).toContain("https://sergioprocopio.it/about");
    expect(markdown).toContain("https://sergioprocopio.it/contact");
  });
});
