import { z } from "zod";

export const CONTACT_NAME_MAX_LENGTH = 120;
export const CONTACT_EMAIL_MAX_LENGTH = 254;
export const CONTACT_SUBJECT_MAX_LENGTH = 160;
export const CONTACT_MESSAGE_MAX_LENGTH = 4000;

export const contactFormSchema = z.object({
  nome: z.string().trim().min(1, "Nome obbligatorio").max(CONTACT_NAME_MAX_LENGTH),
  email: z.string().trim().max(CONTACT_EMAIL_MAX_LENGTH).pipe(z.email("Email non valida")),
  oggetto: z.string().trim().max(CONTACT_SUBJECT_MAX_LENGTH).optional(),
  website: z.string().trim().max(500).optional(),
  messaggio: z
    .string()
    .trim()
    .min(1, "Messaggio obbligatorio")
    .max(CONTACT_MESSAGE_MAX_LENGTH),
});
