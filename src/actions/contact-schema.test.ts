import { describe, expect, it } from "vitest";
import {
  CONTACT_EMAIL_MAX_LENGTH,
  CONTACT_MESSAGE_MAX_LENGTH,
  CONTACT_NAME_MAX_LENGTH,
  CONTACT_SUBJECT_MAX_LENGTH,
  contactFormSchema,
} from "./contact-schema";

describe("contactFormSchema", () => {
  it("accepts valid minimal input", () => {
    const result = contactFormSchema.safeParse({
      nome: "Sergio",
      email: "sergio@example.com",
      messaggio: "Ciao",
    });

    expect(result.success).toBe(true);
  });

  it("rejects an invalid email", () => {
    const result = contactFormSchema.safeParse({
      nome: "Sergio",
      email: "non-valida",
      messaggio: "Ciao",
    });

    expect(result.success).toBe(false);
  });

  it("rejects missing nome", () => {
    const result = contactFormSchema.safeParse({
      email: "sergio@example.com",
      messaggio: "Ciao",
    });

    expect(result.success).toBe(false);
  });

  it("rejects missing messaggio", () => {
    const result = contactFormSchema.safeParse({
      nome: "Sergio",
      email: "sergio@example.com",
    });

    expect(result.success).toBe(false);
  });

  it("allows oggetto to be absent", () => {
    const result = contactFormSchema.parse({
      nome: "Sergio",
      email: "sergio@example.com",
      messaggio: "Ciao",
    });

    expect(result.oggetto).toBeUndefined();
  });

  it("accepts an empty or populated honeypot for server-side filtering", () => {
    const baseInput = {
      nome: "Sergio",
      email: "sergio@example.com",
      messaggio: "Ciao",
    };

    expect(contactFormSchema.safeParse({ ...baseInput, website: "" }).success).toBe(true);
    expect(
      contactFormSchema.safeParse({ ...baseInput, website: "https://spam.example" }).success,
    ).toBe(true);
  });

  it("rejects a name over 120 characters", () => {
    const result = contactFormSchema.safeParse({
      nome: "a".repeat(CONTACT_NAME_MAX_LENGTH + 1),
      email: "sergio@example.com",
      messaggio: "Ciao",
    });

    expect(result.success).toBe(false);
  });

  it("rejects an email over 254 characters", () => {
    const longLocalPart = "a".repeat(CONTACT_EMAIL_MAX_LENGTH - "@example.com".length + 1);
    const result = contactFormSchema.safeParse({
      nome: "Sergio",
      email: `${longLocalPart}@example.com`,
      messaggio: "Ciao",
    });

    expect(result.success).toBe(false);
  });

  it("rejects a subject over 160 characters", () => {
    const result = contactFormSchema.safeParse({
      nome: "Sergio",
      email: "sergio@example.com",
      oggetto: "a".repeat(CONTACT_SUBJECT_MAX_LENGTH + 1),
      messaggio: "Ciao",
    });

    expect(result.success).toBe(false);
  });

  it("rejects a message over 4000 characters", () => {
    const result = contactFormSchema.safeParse({
      nome: "Sergio",
      email: "sergio@example.com",
      messaggio: "a".repeat(CONTACT_MESSAGE_MAX_LENGTH + 1),
    });

    expect(result.success).toBe(false);
  });

  it("accepts valid boundary-length values", () => {
    const email = `${"a".repeat(CONTACT_EMAIL_MAX_LENGTH - "@example.com".length)}@example.com`;
    const result = contactFormSchema.safeParse({
      nome: "a".repeat(CONTACT_NAME_MAX_LENGTH),
      email,
      oggetto: "a".repeat(CONTACT_SUBJECT_MAX_LENGTH),
      messaggio: "a".repeat(CONTACT_MESSAGE_MAX_LENGTH),
    });

    expect(result.success).toBe(true);
  });
});
