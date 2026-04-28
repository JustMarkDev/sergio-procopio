import { c as createActionsProxy, p as pipelineSymbol, A as AstroError, a as ActionCalledFromServerError, d as defineAction } from './entrypoint_CngRjp0A.mjs';
import { z } from 'zod';
import { Resend } from 'resend';

createActionsProxy({
  handleAction: async (param, path, context) => {
    const pipeline = context ? Reflect.get(context, pipelineSymbol) : void 0;
    if (!pipeline) {
      throw new AstroError(ActionCalledFromServerError);
    }
    const action = await pipeline.getAction(path);
    if (!action) throw new Error(`Action not found: ${path}`);
    return action.bind(context)(param);
  }
});

const resend = new Resend("re_dummy_key_for_build");
const server = {
  sendContactEmail: defineAction({
    accept: "form",
    input: z.object({
      nome: z.string().min(1, "Nome obbligatorio"),
      email: z.email("Email non valida"),
      oggetto: z.string().optional(),
      messaggio: z.string().min(1, "Messaggio obbligatorio")
    }),
    handler: async (input) => {
      const { data, error } = await resend.emails.send({
        from: "Sito Web <onboarding@resend.dev>",
        // Change to your verified domain later
        to: "info@sergioprocopio.it",
        // Replace with destination email
        subject: `Nuovo messaggio da: ${input.nome} - ${input.oggetto || "Senza oggetto"}`,
        text: `Nome: ${input.nome}
Email: ${input.email}
Messaggio:
${input.messaggio}`
      });
      if (error) {
        throw new Error(error.message);
      }
      return { success: true, data };
    }
  })
};

export { server };
