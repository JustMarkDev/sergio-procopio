import { describe, expect, it } from "vitest";
import { getImageTitleFromPath } from "./show-assets";

describe("getImageTitleFromPath", () => {
  it("creates a title from an asset path", () => {
    expect(getImageTitleFromPath("src/assets/spettacoli/pino-4-0/la salita.jpg")).toBe(
      "La salita",
    );
  });

  it("strips Astro image hashes", () => {
    expect(getImageTitleFromPath("foto.ABC123.jpg")).toBe("Foto");
  });

  it("normalizes Windows separators", () => {
    expect(getImageTitleFromPath("src\\assets\\spettacoli\\comico\\la_pausa.png")).toBe(
      "La pausa",
    );
  });

  it("returns an empty title for empty or extension-only input", () => {
    expect(getImageTitleFromPath("")).toBe("");
    expect(getImageTitleFromPath(".jpg")).toBe("");
  });
});
