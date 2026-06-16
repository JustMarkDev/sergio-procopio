export type CalendarDateEvent = {
  data: {
    date: Date;
  };
};

const romeDateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Europe/Rome",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function getRomeDateKey(date: Date) {
  const parts = romeDateFormatter.formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return `${values.year}-${values.month}-${values.day}`;
}

export function splitEventsByDate<TEvent extends CalendarDateEvent>(
  events: TEvent[],
  now = new Date(),
) {
  const todayKey = getRomeDateKey(now);

  return {
    upcomingEvents: events.filter((event) => getRomeDateKey(event.data.date) >= todayKey),
    pastEvents: events.filter((event) => getRomeDateKey(event.data.date) < todayKey).reverse(),
  };
}
