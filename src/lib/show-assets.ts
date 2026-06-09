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

export function getImageTitleFromPath(path: string | { src: string }) {
  const rawPath = typeof path === "string" ? path : path.src;
  const normalizedPath = rawPath.replaceAll("\\", "/");
  const filename = normalizedPath.split("/").pop() || "";
  const title = filename
    .replace(/\.[^.]+$/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return title ? title.charAt(0).toUpperCase() + title.slice(1) : "";
}
