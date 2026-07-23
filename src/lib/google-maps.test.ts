import { describe, expect, it } from "vitest";
import { createGoogleMapsSearchUrl } from "./google-maps";

describe("createGoogleMapsSearchUrl", () => {
  it("creates a Google Maps search URL from address and city", () => {
    const result = createGoogleMapsSearchUrl("Via Roma 1", "Castrocaro");
    const url = new URL(result);

    expect(url.origin).toBe("https://www.google.com");
    expect(url.pathname).toBe("/maps/search/");
    expect(url.searchParams.get("api")).toBe("1");
    expect(url.searchParams.get("query")).toBe("Via Roma 1, Castrocaro");
  });

  it("removes whitespace around address and city", () => {
    const result = createGoogleMapsSearchUrl(
      "  Via S. Francesco 1 ",
      " Castrocaro Terme ",
    );
    const url = new URL(result);

    expect(url.searchParams.get("query")).toBe(
      "Via S. Francesco 1, Castrocaro Terme",
    );
  });

  it("encodes accented characters safely", () => {
    const result = createGoogleMapsSearchUrl("Piazza Libertà 2", "Forlì");
    const url = new URL(result);

    expect(url.searchParams.get("query")).toBe("Piazza Libertà 2, Forlì");
  });
});
