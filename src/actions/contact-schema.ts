import { z } from "zod";
import {
  CONTACT_EMAIL_MAX_LENGTH,
  CONTACT_MESSAGE_MAX_LENGTH,
  CONTACT_NAME_MAX_LENGTH,
  CONTACT_SUBJECT_MAX_LENGTH,
} from "./contact-limits";

export {
  CONTACT_EMAIL_MAX_LENGTH,
  CONTACT_MESSAGE_MAX_LENGTH,
  CONTACT_NAME_MAX_LENGTH,
  CONTACT_SUBJECT_MAX_LENGTH,
};

export const contactFormSchema = z.object({
  nome: z.string().trim().min(1, "Nome obbligatorio").max(CONTACT_NAME_MAX_LENGTH),
  email: z.string().trim().max(CONTACT_EMAIL_MAX_LENGTH).pipe(z.email("Email non valida")),
  oggetto: z.string().trim().max(CONTACT_SUBJECT_MAX_LENGTH).optional(),
  website: z.string().trim().max(500).optional(),
  messaggio: z.string().trim().min(1, "Messaggio obbligatorio").max(CONTACT_MESSAGE_MAX_LENGTH),
});
