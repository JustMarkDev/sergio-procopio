import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { contactTrustPlainText } from "./contact-trust";

describe("contact trust anchors", () => {
  it("keeps Italian and English trust copy above the 500-character bar", () => {
    expect(contactTrustPlainText("it").length).toBeGreaterThan(500);
    expect(contactTrustPlainText("en").length).toBeGreaterThan(500);
    expect(contactTrustPlainText("en")).toContain("Contact page");
    expect(contactTrustPlainText("it")).toContain("sergioprocopio.it");
    expect(contactTrustPlainText("it")).toContain("Via Genico, 2");
    expect(contactTrustPlainText("en")).toContain("info@sergioprocopio.it");
  });

  it("publishes a Markdown sitemap for agent recovery", () => {
    const sitemapMd = readFileSync(
      join(process.cwd(), "public/sitemap.md"),
      "utf8",
    );

    expect(sitemapMd).toContain("# Sergio Procopio — sitemap");
    expect(sitemapMd).toContain("https://sergioprocopio.it/contact");
    expect(sitemapMd).toContain("https://sergioprocopio.it/llms.txt");
    expect(sitemapMd).toContain("https://sergioprocopio.it/sitemap.xml");
  });
});
