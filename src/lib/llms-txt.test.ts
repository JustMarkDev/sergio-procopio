import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("public/llms.txt", () => {
  const llmsTxt = readFileSync(
    join(process.cwd(), "public/llms.txt"),
    "utf8",
  );

  it("includes when-to-use guidance and how agents should call the site", () => {
    expect(llmsTxt).toContain("## When to use this site");
    expect(llmsTxt).toContain("Accept: text/markdown");
    expect(llmsTxt).toContain("Do **not** invent an API");
    expect(llmsTxt).toContain("https://sergioprocopio.it/contatti");
    expect(llmsTxt).toContain("https://sergioprocopio.it/contact");
    expect(llmsTxt).toContain("https://sergioprocopio.it/about");
    expect(llmsTxt).toContain("https://sergioprocopio.it/privacy");
  });
});
