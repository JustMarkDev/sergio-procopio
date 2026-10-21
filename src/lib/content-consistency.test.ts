import { readdirSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";
import { describe, expect, it } from "vite-plus/test";

const root = process.cwd();
const field = (source: string, name: string) =>
  source.match(new RegExp(`^${name}:\\s*["']?(.*?)["']?\\s*$`, "m"))?.[1]?.trim();
const readAll = (dir: string) =>
  readdirSync(join(root, dir))
    .filter((file) => file.endsWith(".md"))
    .map((file) => ({ file, source: readFileSync(join(root, dir, file), "utf8") }));

const shows = readAll("src/content/spettacoli").map(({ file, source }) => ({
  id: field(source, "slug") ?? basename(file, ".md"),
  title: field(source, "title")!,
  draft: field(source, "draft") === "true",
}));

describe("content consistency", () => {
  it("ties every event to an existing show by title", () => {
    const titles = new Set(shows.map((show) => show.title.toLowerCase()));
    const orphans = readAll("src/content/eventi")
      .map(({ file, source }) => ({ file, name: field(source, "spettacolo")! }))
      .filter(({ name }) => !titles.has(name.toLowerCase()));

    expect(orphans).toEqual([]);
  });

  it.each(["public/llms.txt", "public/sitemap.md"])("lists every public show in %s", (path) => {
    const text = readFileSync(join(root, path), "utf8");
    const missing = shows
      .filter((show) => !show.draft)
      .filter((show) => !text.includes(`https://sergioprocopio.it/spettacoli/${show.id}`));

    expect(missing).toEqual([]);
  });
});
