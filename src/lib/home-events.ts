const dataLungaFormatter = new Intl.DateTimeFormat("it-IT", {
  timeZone: "Europe/Rome",
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function formatDataLunga(date: Date): string {
  return dataLungaFormatter.format(date);
}

/** Restituisce l'orario solo se valido; il campo è opzionale nello schema eventi. */
export function formatOrario(time?: string | null): string | null {
  if (!time) return null;
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(time) ? time : null;
}

/**
 * Deduce il tipo di ente ospitante dal nome della sede.
 * Serve a dire al committente «lo ospitano enti come il vostro» senza
 * inventare classificazioni che nel contenuto non esistono.
 */
export function getTipoEnte(venue: string, city?: string): string {
  const testo = `${venue} ${city ?? ""}`.toLowerCase();

  if (/\borator/.test(testo)) return "Oratorio";
  if (/parrocchia|parrocchial|chiesa|santuario|duomo/.test(testo)) return "Parrocchia";
  if (/\bteatro\b|auditorium|cine ?teatro/.test(testo)) return "Teatro";
  if (/comune|municip|piazza|sala civica|biblioteca/.test(testo)) return "Comune";
  if (/scuola|istituto|liceo|circolo didattico/.test(testo)) return "Scuola";
  if (/alpini|\bana\b|sezione/.test(testo)) return "Gruppo alpini";

  return "Ente ospitante";
}

/**
 * L'indirizzo grezzo non è pubblicabile: alcune schede evento contengono
 * segnaposto come «Via -----presto indicazione precisa». In home si mostrano
 * solo sede e città.
 */
export function indirizzoPubblicabile(address?: string | null): boolean {
  if (!address) return false;
  return !/-{3,}|presto indicazione|da definire|tbd/i.test(address);
}
