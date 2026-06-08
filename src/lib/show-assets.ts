import type { CollectionEntry } from "astro:content";

export function getShowAssetFolder(show: CollectionEntry<"spettacoli">) {
  return show.id;
}

export function getAssetFolderFromPath(path: string) {
  const normalizedPath = path.replaceAll("\\", "/");
  const marker = "/spettacoli/";
  const markerIndex = normalizedPath.indexOf(marker);

  if (markerIndex === -1) {
    const parts = normalizedPath.split("/");
    return parts[parts.length - 3] || "";
  }

  const afterMarker = normalizedPath.slice(markerIndex + marker.length);
  return afterMarker.split("/")[0] || "";
}
