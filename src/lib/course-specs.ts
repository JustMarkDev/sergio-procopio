import type { CollectionEntry } from "astro:content";
import type { SpecItem } from "./show-specs";

export function getCourseSpecs(data: CollectionEntry<"corso">["data"]): SpecItem[] {
  const items: SpecItem[] = [];

  if (data.docente) items.push({ label: "Docente", value: data.docente });
  if (data.destinatari) items.push({ label: "Per chi", value: data.destinatari });
  if (data.eta) items.push({ label: "Età", value: data.eta });
  if (data.durata) items.push({ label: "Durata", value: data.durata });
  if (data.sede) items.push({ label: "Dove", value: data.sede });
  if (data.costo) items.push({ label: "Costo", value: data.costo });

  return items;
}
