import { describe, expect, it } from "vite-plus/test";
import {
  escapeHtml,
  isHoneypotSubmission,
  isRateLimited,
  sanitizeEmailHeader,
} from "./contact-security";

describe("contact security helpers", () => {
  it("only flags a populated honeypot", () => {
    expect(isHoneypotSubmission()).toBe(false);
    expect(isHoneypotSubmission("")).toBe(false);
    expect(isHoneypotSubmission("   ")).toBe(false);
    expect(isHoneypotSubmission("https://spam.example")).toBe(true);
  });

  it("removes control characters from email header values", () => {
    expect(sanitizeEmailHeader("Mario\r\nBcc: victim@example.com")).toBe(
      "Mario Bcc: victim@example.com",
    );
    expect(sanitizeEmailHeader("Mario\u0000\tRossi")).toBe("Mario Rossi");
  });

  it("escapes every character that can open HTML", () => {
    expect(escapeHtml(`<img src=x onerror="1">&'`)).toBe(
      "&lt;img src=x onerror=&quot;1&quot;&gt;&amp;&#39;",
    );
  });

  it("blocks a sixth submission in ten minutes and allows it again afterwards", () => {
    const start = 1_000_000;
    for (let i = 0; i < 5; i++) expect(isRateLimited("1.2.3.4", start + i)).toBe(false);
    expect(isRateLimited("1.2.3.4", start + 10)).toBe(true);
    expect(isRateLimited("5.6.7.8", start + 10)).toBe(false);
    expect(isRateLimited("1.2.3.4", start + 11 * 60 * 1000)).toBe(false);
  });
});
