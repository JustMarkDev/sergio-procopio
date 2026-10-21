import { ActionError, defineAction } from "astro:actions";
import { Resend } from "resend";
import { contactFormSchema } from "./contact-schema";
import {
  escapeHtml,
  isHoneypotSubmission,
  isRateLimited,
  sanitizeEmailHeader,
} from "./contact-security";

export const server = {
  sendContactEmail: defineAction({
    accept: "form",
    input: contactFormSchema,
    handler: async (input, context) => {
      // Return a normal success response so bots cannot learn that the trap fired.
      if (isHoneypotSubmission(input.website)) {
        return { success: true, data: null };
      }

      if (isRateLimited(context.clientAddress)) {
        throw new ActionError({
          code: "TOO_MANY_REQUESTS",
          message: "Troppi invii ravvicinati. Riprova tra qualche minuto.",
        });
      }

      // L'integrazione di Vercel espone la chiave come RESEND_API_KEY.
      // Cerchiamo in import.meta.env (Astro) e process.env (Node/Vercel runtime)
      const apiKey =
        import.meta.env.RESEND_API_KEY || (globalThis as any).process?.env?.RESEND_API_KEY;

      if (!apiKey) {
        console.error("Errore: RESEND_API_KEY non trovata nell'ambiente.");
        throw new Error("Configurazione server incompleta (API Key mancante).");
      }

      const safeNome = escapeHtml(input.nome);
      const safeSubjectName = sanitizeEmailHeader(input.nome) || "contatto";
      const safeEmail = escapeHtml(input.email);
      const safeOggetto = escapeHtml(input.oggetto || "Nessun oggetto");
      const safeMessaggio = escapeHtml(input.messaggio);

      const resend = new Resend(apiKey);
      const { data, error } = await resend.emails.send({
        from: "Sito Web <sito@contatti.sergioprocopio.it>",
        to: "info@sergioprocopio.it",
        replyTo: input.email,
        subject: `Nuovo contatto dal sito web da ${safeSubjectName}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">Nuovo contatto dal sito web</h2>
            <p><strong>Nome:</strong> ${safeNome}</p>
            <p><strong>Email:</strong> ${safeEmail}</p>
            <p><strong>Oggetto:</strong> ${safeOggetto}</p>
            <div style="margin-top: 20px; padding: 15px; background-color: #f9fafb; border-radius: 5px;">
              <p><strong>Messaggio:</strong></p>
              <p style="white-space: pre-wrap;">${safeMessaggio}</p>
            </div>
          </div>
        `,
        text: `Nuovo contatto dal sito web\n\nNome: ${input.nome}\nEmail: ${input.email}\nOggetto: ${input.oggetto || "Nessun oggetto"}\n\nMessaggio:\n${input.messaggio}`,
      });

      if (error) {
        console.error("Resend Error:", error);
        throw new Error(error.message);
      }

      return { success: true, data };
    },
  }),
};
