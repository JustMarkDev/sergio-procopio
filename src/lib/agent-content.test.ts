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

  it("provides contact details, the availability form and three booking steps", () => {
    const markdown = contactMarkdown();

    expect(markdown).toMatch(/^# Contatti\n/);
    expect(markdown.length).toBeGreaterThan(500);
    expect(markdown).toContain("[info@sergioprocopio.it](mailto:info@sergioprocopio.it)");
    expect(markdown).toContain("[+39 3805252684](tel:+393805252684)");
    expect(markdown).toContain("https://sergioprocopio.it/contatti");
    expect(markdown).toContain("https://sergioprocopio.it/contact");
    expect(markdown).toContain("1. Scrivimi: raccontami il periodo, il luogo e il pubblico");
    expect(markdown).toContain("2. Ti rispondo io: verifichiamo la disponibilità e definiamo una proposta con un preventivo.");
    expect(markdown).toContain("3. Confermiamo la data: accordiamo i dettagli tecnici");
  });

  it("summarizes privacy trust information", () => {
    const markdown = privacyMarkdown();

    expect(markdown).toMatch(/^# Informativa sulla Privacy\n/);
    expect(markdown.length).toBeGreaterThan(500);
    expect(markdown).toContain("P.IVA 02470860137");
    expect(markdown).toContain("https://sergioprocopio.it/privacy");
    expect(markdown).not.toContain("privacy-policy");
  });

  it.each(["contatti", "contatti/", "contact", "contact/"])(
    "serves %s as Markdown with the negotiated cache headers",
    async (path) => {
      const response = await GET({
        params: { path },
        url: new URL(`/api/markdown/${path}`, "https://sergioprocopio.it"),
      } as unknown as APIContext);

      expect(response.status).toBe(200);
      expect(response.headers.get("Content-Type")).toBe("text/markdown; charset=utf-8");
      expect(response.headers.get("Vary")).toBe("Accept, Accept-Encoding");
      await expect(response.text()).resolves.toBe(`${contactMarkdown()}\n`);
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

    const markdown = await response.text();
    expect(markdown).toContain("# Pagina non trovata");
    expect(markdown).toContain("`/some-path-that-does-not-exist`");
    expect(markdown).toContain("https://sergioprocopio.it/llms.txt");
    expect(markdown).toContain("https://sergioprocopio.it/sitemap-index.xml");
    expect(markdown).toContain("https://sergioprocopio.it/about");
    expect(markdown).toContain("https://sergioprocopio.it/contatti");
    expect(markdown).toContain("https://sergioprocopio.it/contact");
    expect(markdown).toContain("https://sergioprocopio.it/privacy");
  });

  it("points a missing path to the sitemap and agent guide", () => {
    const markdown = notFoundMarkdown("/missing");

    expect(markdown).toContain("# Pagina non trovata");
    expect(markdown).toContain("`/missing`");
    expect(markdown).toContain("https://sergioprocopio.it/llms.txt");
    expect(markdown).toContain("https://sergioprocopio.it/sitemap-index.xml");
    expect(markdown).toContain("https://sergioprocopio.it/about");
    expect(markdown).toContain("https://sergioprocopio.it/contact");
  });
});
