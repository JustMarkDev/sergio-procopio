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

const HTML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

export function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]);
}

const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const recentSubmissions = new Map<string, number[]>();

// shortcut: counts live in one serverless instance's memory, so a botnet or a cold start
// resets them; add a Vercel Firewall rate-limit rule (or Turnstile) if spam gets past this.
export function isRateLimited(key: string, now = Date.now()) {
  const recent = (recentSubmissions.get(key) ?? []).filter((at) => now - at < RATE_LIMIT_WINDOW_MS);
  const limited = recent.length >= RATE_LIMIT_MAX;

  if (!limited) recent.push(now);
  if (recent.length === 0) recentSubmissions.delete(key);
  else recentSubmissions.set(key, recent);

  // Drop idle keys so the map cannot grow forever.
  for (const [other, times] of recentSubmissions) {
    if (now - times[times.length - 1] >= RATE_LIMIT_WINDOW_MS) recentSubmissions.delete(other);
  }

  return limited;
}
