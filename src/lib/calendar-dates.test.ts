import { describe, expect, it } from "vitest";
import { splitEventsByDate } from "./calendar-dates";

function eventOn(date: string) {
  return {
    data: {
      date: new Date(date),
    },
  };
}

describe("splitEventsByDate", () => {
  it("keeps events on the same Rome day as today upcoming", () => {
    const today = new Date("2026-06-16T10:00:00.000Z");
    const event = eventOn("2026-06-16T20:00:00.000Z");

    const { upcomingEvents, pastEvents } = splitEventsByDate([event], today);

    expect(upcomingEvents).toEqual([event]);
    expect(pastEvents).toEqual([]);
  });

  it("keeps events whose UTC timestamp is previous day but Rome date is today upcoming", () => {
    const today = new Date("2026-06-15T22:30:00.000Z");
    const event = eventOn("2026-06-15T22:15:00.000Z");

    const { upcomingEvents, pastEvents } = splitEventsByDate([event], today);

    expect(upcomingEvents).toEqual([event]);
    expect(pastEvents).toEqual([]);
  });

  it("moves events before today's Rome date into past", () => {
    const today = new Date("2026-06-15T22:30:00.000Z");
    const event = eventOn("2026-06-15T21:59:59.000Z");

    const { upcomingEvents, pastEvents } = splitEventsByDate([event], today);

    expect(upcomingEvents).toEqual([]);
    expect(pastEvents).toEqual([event]);
  });

  it("returns past events newest first", () => {
    const today = new Date("2026-06-15T22:30:00.000Z");
    const older = eventOn("2026-06-10T00:00:00.000Z");
    const newer = eventOn("2026-06-15T21:59:59.000Z");

    const { pastEvents } = splitEventsByDate([older, newer], today);

    expect(pastEvents).toEqual([newer, older]);
  });
});
