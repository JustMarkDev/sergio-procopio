import { describe, expect, it } from "vitest";
import {
  normalizeEventAddress,
  normalizeEventLabel,
} from "./text-normalization";

describe("normalizeEventLabel", () => {
  it("capitalizes the first letter", () => {
    expect(normalizeEventLabel("castrocaro")).toBe("Castrocaro");
    expect(normalizeEventLabel("teatro oratorio don bosco")).toBe(
      "Teatro oratorio don bosco",
    );
    expect(normalizeEventLabel("via Paglico")).toBe("Via Paglico");
  });

  it("trims and collapses whitespace", () => {
    expect(normalizeEventLabel("  teatro   sociale ")).toBe("Teatro sociale");
  });

  it("preserves capitalization in the rest of the value", () => {
    expect(normalizeEventLabel("oratorio di Suello LC")).toBe(
      "Oratorio di Suello LC",
    );
  });

  it("supports an accented first letter", () => {
    expect(normalizeEventLabel("église municipale")).toBe(
      "Église municipale",
    );
  });
});

describe("normalizeEventAddress", () => {
  it("separates a final civic number with a comma", () => {
    expect(normalizeEventAddress("Via Roma 1")).toBe("Via Roma, 1");
    expect(normalizeEventAddress("Via Roma,21")).toBe("Via Roma, 21");
    expect(normalizeEventAddress("Via Roma ,21")).toBe("Via Roma, 21");
    expect(normalizeEventAddress("Via Roma 12/A")).toBe("Via Roma, 12/A");
  });

  it("keeps addresses without a final civic number unchanged", () => {
    expect(normalizeEventAddress("via Pagliulico")).toBe("Via Pagliulico");
    expect(
      normalizeEventAddress(
        "Via Stefano Morcelli, 1, 23032 Bormio SO",
      ),
    ).toBe("Via Stefano Morcelli, 1, 23032 Bormio SO");
  });
});
