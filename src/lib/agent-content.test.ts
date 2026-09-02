import { describe, expect, it } from "vitest";
import {
  homepageMarkdown,
  notFoundMarkdown,
  showMarkdown,
} from "./agent-content";

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
    expect(markdown).toContain("https://sergioprocopio.it/llms.txt");
    expect(markdown.length).toBeGreaterThan(500);
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
    expect(markdown).toContain("https://sergioprocopio.it/#contatti");
  });

  it("points a missing path to the sitemap and agent guide", () => {
    const markdown = notFoundMarkdown("/missing");

    expect(markdown).toContain("# Pagina non trovata");
    expect(markdown).toContain("`/missing`");
    expect(markdown).toContain("https://sergioprocopio.it/llms.txt");
    expect(markdown).toContain("https://sergioprocopio.it/sitemap-index.xml");
  });
});
