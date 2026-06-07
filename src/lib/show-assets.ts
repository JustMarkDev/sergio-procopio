import type { CollectionEntry } from "astro:content";

export function getShowAssetFolder(show: CollectionEntry<"spettacoli">) {
  return show.data.assetFolder || show.id;
}

export function getAssetFolderFromPath(path: string) {
  const parts = path.split("/");
  return parts[parts.length - 2];
}
