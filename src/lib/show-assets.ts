export function getImageTitleFromPath(path: string) {
  const normalizedPath = path.replaceAll("\\", "/");
  const filename = normalizedPath.split("/").pop() || "";
  const title = filename
    .replace(/\.[A-Za-z0-9_-]{6,}(?=\.[^.]+$)/, "")
    .replace(/\.[^.]+$/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return title ? title.charAt(0).toUpperCase() + title.slice(1) : "";
}
