import type { CollectionEntry } from "astro:content";

export interface SpecItem {
  label: string;
  value: string;
}

export interface SpecGroup {
  id: "primary" | "requirements";
  label?: string;
  items: SpecItem[];
}

export function getShowSpecs(show: CollectionEntry<"spettacoli">): SpecGroup[] {
  const { data } = show;
  const groups: SpecGroup[] = [];

  // Primary Specs Group
  const primaryItems: SpecItem[] = [];
  if (data.produzione) primaryItems.push({ label: "Produzione", value: data.produzione });
  if (data.regia) primaryItems.push({ label: "Regia", value: data.regia });
  if (data.eta) primaryItems.push({ label: "Età Consigliata", value: data.eta });
  if (data.durata) primaryItems.push({ label: "Durata", value: data.durata });
  if (data.tecnico) primaryItems.push({ label: "Tecnico audio/luci", value: data.tecnico });

  if (primaryItems.length > 0) {
    groups.push({ id: "primary", items: primaryItems });
  }

  // Requirements Group
  const reqItems: SpecItem[] = [];
  if (data.requisiti) reqItems.push({ label: "Requisiti", value: data.requisiti });
  
  if (reqItems.length > 0) {
    groups.push({ id: "requirements", items: reqItems });
  }

  return groups;
}
