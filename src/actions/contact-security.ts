export function isHoneypotSubmission(website?: string) {
  return Boolean(website?.trim());
}

export function sanitizeEmailHeader(value: string) {
  return value
    .replace(/[\u0000-\u001F\u007F-\u009F]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
