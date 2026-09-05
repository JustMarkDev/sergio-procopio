import { useEffect, useRef, useState, useTransition } from "react";
import { actions } from "astro:actions";

// Keep in sync with src/actions/contact-schema.ts.
const CONTACT_NAME_MAX_LENGTH = 120;
const CONTACT_EMAIL_MAX_LENGTH = 254;
const CONTACT_SUBJECT_MAX_LENGTH = 160;
const CONTACT_MESSAGE_MAX_LENGTH = 4000;

const inputClassName = "block h-12 w-full rounded-2xl border border-zinc-600 bg-white/5 px-4 text-base text-zinc-50 placeholder:text-zinc-400 transition-colors outline-none focus:border-blue-400 focus:bg-white/10 focus-visible:ring-2 focus-visible:ring-blue-400";

export default function ContactForm() {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const successHeadingRef = useRef<HTMLHeadingElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const focusNameOnReset = useRef(false);

  useEffect(() => {
    if (status === "success") successHeadingRef.current?.focus();
    if (status === "idle" && focusNameOnReset.current) {
      nameInputRef.current?.focus();
      focusNameOnReset.current = false;
    }
  }, [status]);

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isPending) return;
    const form = e.currentTarget;
    const formData = new FormData(form);
    setStatus("idle");
    setErrorMessage("");

    startTransition(async () => {
      try {
        const { error } = await actions.sendContactEmail(formData);
        if (error) {
          setErrorMessage(error.message || "Errore durante l'invio. Riprova.");
          setStatus("error");
          return;
        }
        form.reset();
        setStatus("success");
      } catch {
        setErrorMessage("Invio non riuscito. Controlla la connessione e riprova, oppure contattami per telefono o email.");
        setStatus("error");
      }
    });
  };

  return (
    <section aria-labelledby="contact-form-title" className="relative flex h-full flex-col rounded-[2rem] border border-white/10 bg-white/2 p-6 sm:p-8">
      {status === "success" ? (
        <div className="my-auto space-y-5 py-8">
          <h2 id="contact-form-title" ref={successHeadingRef} tabIndex={-1} className="rounded text-2xl font-serif text-zinc-50 focus-visible:outline-2 focus-visible:outline-blue-400">
            Messaggio inviato
          </h2>
          <p className="text-zinc-300" role="status">Grazie per avermi scritto. Ti risponderò all'indirizzo email che hai indicato.</p>
          <button
            type="button"
            onClick={() => {
              focusNameOnReset.current = true;
              setErrorMessage("");
              setStatus("idle");
            }}
            className="min-h-11 rounded-full border border-zinc-500 px-5 text-sm font-medium text-zinc-50 hover:bg-zinc-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-400"
          >
            Invia un altro messaggio
          </button>
        </div>
      ) : (
        <>
          <h2 id="contact-form-title" className="mb-5 text-2xl font-serif text-zinc-50">Scrivimi del tuo evento</h2>
          <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-5" aria-busy={isPending}>
            <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
              <label htmlFor="website">Non compilare questo campo</label>
              <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
            </div>

            {status === "error" && (
              <p role="alert" className="rounded-lg border border-red-400/40 bg-red-950/40 p-3 text-sm text-red-200">
                {errorMessage}
              </p>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="nome" className="block text-sm font-medium text-zinc-200">Nome</label>
                <input ref={nameInputRef} id="nome" name="nome" autoComplete="name" required maxLength={CONTACT_NAME_MAX_LENGTH} placeholder="Mario Rossi" className={inputClassName} />
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-zinc-200">Email</label>
                <input id="email" name="email" type="email" autoComplete="email" required maxLength={CONTACT_EMAIL_MAX_LENGTH} placeholder="mario@email.it" className={inputClassName} />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="oggetto" className="block text-sm font-medium text-zinc-200">Oggetto <span className="font-normal text-zinc-400">(facoltativo)</span></label>
              <input id="oggetto" name="oggetto" maxLength={CONTACT_SUBJECT_MAX_LENGTH} placeholder="Uno spettacolo per la nostra scuola" className={inputClassName} />
            </div>

            <div className="flex flex-1 flex-col gap-2">
              <label htmlFor="messaggio" className="block text-sm font-medium text-zinc-200">Messaggio</label>
              <textarea id="messaggio" name="messaggio" required maxLength={CONTACT_MESSAGE_MAX_LENGTH} placeholder="Ciao Sergio, vorremmo organizzare uno spettacolo a... nel mese di... Il pubblico sarà composto da..." className={`${inputClassName} min-h-48 flex-1 resize-none py-4`} />
            </div>

            <button type="submit" disabled={isPending} className="flex min-h-14 w-full items-center justify-center whitespace-nowrap rounded-2xl bg-primary px-6 text-sm font-semibold text-primary-foreground transition-[background-color,transform] hover:bg-blue-700 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-400 disabled:cursor-wait disabled:opacity-70">
              <span role="status" aria-live="polite">{isPending ? "Invio in corso..." : "Invia messaggio"}</span>
            </button>
          </form>
        </>
      )}
    </section>
  );
}
