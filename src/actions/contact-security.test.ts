import { describe, expect, it } from "vitest";
import { isHoneypotSubmission, sanitizeEmailHeader } from "./contact-security";

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
});
