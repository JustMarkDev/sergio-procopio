export function isHoneypotSubmission(website?: string) {
  return Boolean(website?.trim());
}

export function sanitizeEmailHeader(value: string) {
  return (
    value
      // oxlint-disable-next-line no-control-regex -- strips control characters to block header injection
      .replace(/[\u0000-\u001F\u007F-\u009F]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  );
}
