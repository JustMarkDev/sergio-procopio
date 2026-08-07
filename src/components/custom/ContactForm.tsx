import { useEffect, useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Mail, MapPin, Phone, ReceiptText } from "lucide-react";
import { actions } from "astro:actions";

// Keep in sync with src/actions/contact-schema.ts.
const CONTACT_NAME_MAX_LENGTH = 120;
const CONTACT_EMAIL_MAX_LENGTH = 254;
const CONTACT_SUBJECT_MAX_LENGTH = 160;
const CONTACT_MESSAGE_MAX_LENGTH = 4000;

export default function ContactForm() {
  const rotatingTitles = ["scuola", "parrocchia", "associazione"];
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [titleIndex, setTitleIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setTitleIndex((current) => (current + 1) % rotatingTitles.length);
    }, 3000);

    return () => window.clearInterval(interval);
  }, [rotatingTitles.length]);

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      const { error } = await actions.sendContactEmail(formData);
      
      if (error) {
        setStatus("error");
        setErrorMessage(error.message || "Errore durante l'invio.");
        return;
      }
      
      setStatus("success");
      (e.target as HTMLFormElement).reset();
    });
  };

  return (
    <section
      id="contatti"
      className="relative pt-32 pb-20 overflow-hidden bg-background"
    >

      <div className="container relative z-10 mx-auto px-4 md:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-stretch">
          <motion.div
            className="lg:col-span-5 flex flex-col"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-serif font-bold text-foreground mb-8 tracking-tight">
              Porta l'emozione <br />
              <span className="whitespace-nowrap">
                nella tua{" "}
                <span className="inline-block min-w-[12ch] align-baseline">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={rotatingTitles[titleIndex]}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ duration: 0.35 }}
                      className="italic text-primary inline-block"
                    >
                      {rotatingTitles[titleIndex]}
                    </motion.span>
                  </AnimatePresence>
                </span>
              </span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-10 opacity-80">
              Sergio Procopio è a disposizione per spettacoli, laboratori e
              incontri formativi. Compila il modulo o utilizza i riferimenti
              diretti per richiedere un preventivo o una data.
            </p>

            <a
              href="tel:+393805252684"
              className="flex min-h-14 w-full items-center justify-center gap-2.5 rounded-full bg-primary px-8 text-base font-bold text-primary-foreground shadow-[0_8px_30px_rgba(212,162,76,0.22)] transition-[background-color,box-shadow,scale] duration-200 hover:bg-[#e8b44a] hover:shadow-[0_10px_40px_rgba(212,162,76,0.38)] active:scale-[0.96]"
            >
              <Phone size={18} aria-hidden="true" />
              Chiama ora
            </a>

            {/* Card riepilogo: recapiti e dati fiscali in un colpo d'occhio.
                `flex-1` la fa arrivare al fondo della colonna, così il suo bordo
                inferiore coincide sempre con quello del form a destra. */}
            <div className="mt-8 flex-1 space-y-1 rounded-3xl border border-white/10 bg-white/3 p-6">
              <a
                href="tel:+393805252684"
                className="flex min-h-10 items-center gap-3 text-muted-foreground transition-colors hover:text-primary"
              >
                <Phone size={16} aria-hidden="true" className="shrink-0 text-primary/70" />
                +39 380 5252684
              </a>
              <a
                href="mailto:info@sergioprocopio.it"
                className="flex min-h-10 items-center gap-3 text-muted-foreground transition-colors hover:text-primary"
              >
                <Mail size={16} aria-hidden="true" className="shrink-0 text-primary/70" />
                info@sergioprocopio.it
              </a>
              <p className="flex min-h-10 items-center gap-3 text-muted-foreground">
                <ReceiptText size={16} aria-hidden="true" className="shrink-0 text-primary/70" />
                P.IVA 02470860137
              </p>
              <p className="flex min-h-10 items-center gap-3 text-muted-foreground">
                <MapPin size={16} aria-hidden="true" className="shrink-0 text-primary/70" />
                Via Genico, 2
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-7 relative flex flex-col p-10 bg-white/2 border border-white/10 rounded-[2.5rem] backdrop-blur-sm"
          >
            {status === "success" ? (
              <div className="flex flex-1 flex-col items-center justify-center space-y-4 py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/20 text-primary flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                </div>
                <h3 className="text-2xl font-bold">Messaggio Inviato!</h3>
                <p className="text-muted-foreground">Grazie per avermi contattato. Ti risponderò il prima possibile.</p>
                <button 
                  onClick={() => setStatus("idle")}
                  className="mt-6 text-sm text-primary hover:underline"
                >
                  Invia un altro messaggio
                </button>
              </div>
            ) : (
              <form
                className="flex flex-1 flex-col gap-6"
                onSubmit={handleSubmit}
              >
                <div
                  className="absolute -left-[9999px] h-px w-px overflow-hidden"
                  aria-hidden="true"
                >
                  <label htmlFor="website">Non compilare questo campo</label>
                  <input
                    id="website"
                    name="website"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>

                {status === "error" && (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                    {errorMessage}
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label
                      htmlFor="nome"
                      className="text-xs font-bold uppercase tracking-widest opacity-60 ml-1"
                    >
                      Nome
                    </label>
                    <input
                      id="nome"
                      name="nome"
                      required
                      maxLength={CONTACT_NAME_MAX_LENGTH}
                      className="flex h-14 w-full rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-sm transition-all focus:border-primary/50 focus:bg-white/10 outline-none"
                      placeholder="Mario Rossi"
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="email"
                      className="text-xs font-bold uppercase tracking-widest opacity-60 ml-1"
                    >
                      Email
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      maxLength={CONTACT_EMAIL_MAX_LENGTH}
                      className="flex h-14 w-full rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-sm transition-all focus:border-primary/50 focus:bg-white/10 outline-none"
                      placeholder="mario@email.it"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="oggetto"
                    className="text-xs font-bold uppercase tracking-widest opacity-60 ml-1"
                  >
                    Oggetto
                  </label>
                  <input
                    id="oggetto"
                    name="oggetto"
                    maxLength={CONTACT_SUBJECT_MAX_LENGTH}
                    className="flex h-14 w-full rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-sm transition-all focus:border-primary/50 focus:bg-white/10 outline-none"
                    placeholder="Richiesta informazioni..."
                  />
                </div>

                {/* La textarea assorbe la differenza di altezza tra le colonne:
                    è lei ad allungarsi finché il form chiude alla stessa quota
                    della card di sinistra. */}
                <div className="flex flex-1 flex-col space-y-2">
                  <label
                    htmlFor="messaggio"
                    className="text-xs font-bold uppercase tracking-widest opacity-60 ml-1"
                  >
                    Messaggio
                  </label>
                  <textarea
                    id="messaggio"
                    name="messaggio"
                    required
                    maxLength={CONTACT_MESSAGE_MAX_LENGTH}
                    className="flex min-h-40 flex-1 w-full rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-sm transition-all focus:border-primary/50 focus:bg-white/10 outline-none resize-none"
                    placeholder="Scrivi qui..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full rounded-2xl bg-primary px-10 py-6 text-primary-foreground font-bold uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex justify-center items-center gap-2"
                >
                  {isPending ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Invio in corso...
                    </>
                  ) : (
                    "Invia Messaggio"
                  )}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
