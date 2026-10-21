import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vite-plus/test";
import { CONTACT_TRUST_EN, CONTACT_TRUST_IT } from "./contact-trust";

describe("contact trust anchors", () => {
  it("keeps Italian and English trust copy above the 500-character bar", () => {
    expect(CONTACT_TRUST_IT.length).toBeGreaterThan(500);
    expect(CONTACT_TRUST_EN.length).toBeGreaterThan(500);
    expect(CONTACT_TRUST_EN).toContain("Contact page");
    expect(CONTACT_TRUST_IT).toContain("sergioprocopio.it");
    expect(CONTACT_TRUST_IT).not.toContain("P.IVA");
    expect(CONTACT_TRUST_EN).toContain("info@sergioprocopio.it");
  });

  it("publishes a Markdown sitemap for agent recovery", () => {
    const sitemapMd = readFileSync(join(process.cwd(), "public/sitemap.md"), "utf8");

    expect(sitemapMd).toContain("# Sergio Procopio — sitemap");
    expect(sitemapMd).toContain("https://sergioprocopio.it/contact");
    expect(sitemapMd).toContain("https://sergioprocopio.it/llms.txt");
    expect(sitemapMd).toContain("https://sergioprocopio.it/sitemap.xml");
  });
});
