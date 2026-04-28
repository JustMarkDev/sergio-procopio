import { defineAction } from "astro:actions";
import { z } from "zod";
import { Resend } from "resend";

const resend = new Resend(import.meta.env.RESEND_API_KEY || 're_dummy_key_for_build');

export const server = {
  sendContactEmail: defineAction({
    accept: "form",
    input: z.object({
      nome: z.string().min(1, "Nome obbligatorio"),
      email: z.email("Email non valida"),
      oggetto: z.string().optional(),
      messaggio: z.string().min(1, "Messaggio obbligatorio"),
    }),
    handler: async (input) => {
      const { data, error } = await resend.emails.send({
        from: "Sito Web <onboarding@resend.dev>", // Change to your verified domain later
        to: "info@sergioprocopio.it", // Replace with destination email
        subject: `Nuovo messaggio da: ${input.nome} - ${input.oggetto || "Senza oggetto"}`,
        text: `Nome: ${input.nome}\nEmail: ${input.email}\nMessaggio:\n${input.messaggio}`,
      });

      if (error) {
        throw new Error(error.message);
      }

      return { success: true, data };
    },
  }),
};
