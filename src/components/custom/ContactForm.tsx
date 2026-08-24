import { useEffect, useRef, useState, useTransition } from "react";
import { AnimatePresence, MotionConfig, motion, useInView } from "framer-motion";
import type { Variants } from "framer-motion";
import { Mail, MapPin, Phone, ReceiptText } from "lucide-react";
import { actions } from "astro:actions";
import {
  DUR,
  EASE_SOFT,
  PAUSA_BATTUTA,
  TAP,
  VIEWPORT,
  battuta,
  fadeUp,
  popIn,
  stagger,
  useMotionSafe,
} from "../../lib/home-motion";

// Keep in sync with src/actions/contact-schema.ts.
const CONTACT_NAME_MAX_LENGTH = 120;
const CONTACT_EMAIL_MAX_LENGTH = 254;
const CONTACT_SUBJECT_MAX_LENGTH = 160;
const CONTACT_MESSAGE_MAX_LENGTH = 4000;

/** Parole del titolo rotante: a livello modulo, così l'effetto del loop non le rivede a ogni render.
 *  VINCOLO: femminili (la riga è «nella tua …») e al massimo 6 caratteri.
 *  La riga è whitespace-nowrap e in 2xl arriva a text-6xl: con parole lunghe
 *  come «parrocchia» o «associazione» sfonda la colonna e finisce sotto il
 *  form. Se ne aggiungi una più lunga, alza anche il min-w qui sotto. */
const rotatingTitles = ["scuola", "chiesa", "sede"];

/* Istanze a livello modulo: la cache WeakMap di mv.v() lavora per identità
   referenziale, quindi i container di stagger devono essere stabili. */
const STAGGER_COLONNE = stagger(0.08);
const STAGGER_RECAPITI = stagger(0.06);

/**
 * Cambio scena form ↔ pannello di conferma (e banner d'errore): composto SOLO
 * dai token del sistema. Con reduced motion mv.v() lo collassa a dissolvenza.
 */
const CAMBIO_SCENA: Variants = {
  initial: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: DUR.sm, ease: EASE_SOFT } },
  exit: { opacity: 0, y: -8, transition: { duration: DUR.sm, ease: EASE_SOFT } },
};

export interface ContactFormProps {
  /** Nella home la sezione contatti usa lo sfondo alternato per staccarsi da «Tre passi». */
  sfondoAlt?: boolean;
}

export default function ContactForm({ sfondoAlt = false }: ContactFormProps) {
  const mv = useMotionSafe();
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [titleIndex, setTitleIndex] = useState(0);
  // In pausa mentre si legge o si compila (mouse sopra, focus da tastiera):
  // la parola del titolo non deve girare sotto gli occhi — WCAG 2.2.2.
  const [inPausa, setInPausa] = useState(false);

  /* Guinzaglio del loop: la rotazione gira solo con la sezione in viewport
     (senza `once`: serve rilevare anche l'uscita). */
  const sezioneRef = useRef<HTMLElement | null>(null);
  const inView = useInView(sezioneRef, { amount: 0.2 });

  useEffect(() => {
    // Con reduced motion la parola resta fissa (la prima); in pausa (mouse
    // sopra o focus dentro la sezione) e fuori viewport l'interval non parte proprio.
    if (mv.reduced || inPausa || !inView) return;

    let interval: number | null = null;

    const avvia = () => {
      if (interval === null)
        interval = window.setInterval(() => {
          setTitleIndex((current) => (current + 1) % rotatingTitles.length);
        }, 3000);
    };

    const ferma = () => {
      if (interval !== null) {
        window.clearInterval(interval);
        interval = null;
      }
    };

    // In pausa quando la tab è nascosta: riparte al ritorno.
    const suVisibilita = () => (document.hidden ? ferma() : avvia());

    suVisibilita();
    document.addEventListener("visibilitychange", suVisibilita);

    return () => {
      document.removeEventListener("visibilitychange", suVisibilita);
      ferma();
    };
  }, [mv.reduced, inPausa, inView]);

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
    <MotionConfig reducedMotion="user">
      <section
        ref={sezioneRef}
        id="contatti"
        onMouseEnter={() => setInPausa(true)}
        onMouseLeave={() => setInPausa(false)}
        onFocus={() => setInPausa(true)}
        onBlur={() => setInPausa(false)}
        className={`relative pt-32 pb-20 overflow-hidden ${sfondoAlt ? "bg-background-alt" : "bg-background"}`}
      >

        <div className="container relative z-10 mx-auto px-4 md:px-8 lg:px-12">
          {/* Su mobile l'ordine di lettura è: titolo e CTA → form → recapiti.
              Su desktop la card torna sotto il titolo (colonna sinistra, riga 2)
              e il form occupa entrambe le righe a destra. */}
          <motion.div
            variants={mv.v(STAGGER_COLONNE)}
            initial="hidden"
            whileInView="show"
            viewport={VIEWPORT}
            className="grid grid-cols-1 items-stretch gap-12 lg:grid-cols-12 lg:grid-rows-[auto_1fr] lg:gap-x-20 lg:gap-y-8"
          >
            <motion.div
              variants={mv.v(fadeUp)}
              className="flex flex-col lg:col-span-5 lg:col-start-1 lg:row-start-1"
            >
              <h2 className="text-4xl md:text-5xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-serif font-bold text-foreground mb-8 tracking-tight">
                Porta l'emozione <br />
                <span className="whitespace-nowrap">
                  nella tua{" "}
                  {/* align-bottom, non align-baseline: la culla contiene un blocco
                      overflow-hidden, e un inline-block con overflow nascosto
                      espone come baseline il proprio bordo inferiore, non
                      quella del testo. Allineandola alla baseline di «nella
                      tua» la parola saliva di tutto il discendente. Con
                      align-bottom si allineano i fondi: le altezze sono
                      identiche (pb/-mb si annullano), quindi le baseline
                      coincidono. È il pattern delle maschere di tutto il sito. */}
                  <span className="inline-block w-max min-w-[7ch] align-bottom">
                    {/* Graticcia: il telaio overflow-hidden fa uscire la parola
                        vecchia verso l'alto e monta la nuova dalla ribalta.
                        pb salva i discendenti dei corsivi (come maskRiga), pr lo
                        sbalzo laterale: il corsivo sborda dalla larghezza
                        d'avanzamento dell'ultimo glifo e senza quel margine la
                        maschera gli rifila la coda. */}
                    <span className="block overflow-hidden pb-[0.12em] -mb-[0.12em] pr-[0.12em]">
                      <AnimatePresence mode="wait" initial={false}>
                        <motion.span
                          key={rotatingTitles[titleIndex]}
                          variants={mv.v(battuta)}
                          initial="initial"
                          animate="show"
                          exit="exit"
                          className="block italic text-primary"
                        >
                          {rotatingTitles[titleIndex]}
                        </motion.span>
                      </AnimatePresence>
                    </span>
                  </span>
                </span>
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-10 opacity-80">
                Sergio Procopio è a disposizione per spettacoli, laboratori e
                incontri formativi. Compila il modulo o utilizza i riferimenti
                diretti per richiedere un preventivo o una data.
              </p>

              <motion.a
                href="tel:+393805252684"
                whileTap={TAP}
                className="flex min-h-14 w-full items-center justify-center gap-2.5 rounded-full bg-primary-deep px-8 text-base font-bold text-primary-foreground shadow-[0_8px_30px_rgba(232,72,63,0.22)] transition-[background-color,box-shadow] duration-200 hover:bg-primary-deep-hover hover:shadow-[0_10px_40px_rgba(232,72,63,0.38)]"
              >
                <Phone size={18} aria-hidden="true" />
                Chiama ora
              </motion.a>
            </motion.div>

            <motion.div
              variants={mv.v(fadeUp)}
              className="lg:col-span-7 lg:col-start-6 lg:row-span-2 lg:row-start-1 relative flex flex-col p-10 bg-white/2 border border-border rounded-[2.5rem] backdrop-blur-sm"
            >
              <AnimatePresence mode="wait" initial={false}>
                {status === "success" ? (
                  <motion.div
                    key="successo"
                    role="status"
                    variants={mv.v(CAMBIO_SCENA)}
                    initial="initial"
                    animate="show"
                    exit="exit"
                    className="flex flex-1 flex-col items-center justify-center space-y-4 py-12 text-center"
                  >
                    <div className="w-16 h-16 rounded-full bg-primary/20 text-primary flex items-center justify-center mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                    </div>
                    {/* Il focus atterra qui al cambio scena: con mode="wait" il
                        pannello monta dopo l'uscita del form (che portava via il
                        submit button focalizzato), quindi il ref callback scatta
                        al momento giusto. */}
                    <h3
                      ref={(nodo) => nodo?.focus()}
                      tabIndex={-1}
                      className="text-2xl font-bold"
                    >
                      {/* La pausa della battuta: il punto esclamativo si pianta
                          un battito dopo il titolo. Copy identico e contiguo. */}
                      Messaggio Inviato
                      <motion.span
                        variants={mv.v(popIn)}
                        custom={PAUSA_BATTUTA}
                        initial="hidden"
                        animate="show"
                        className="inline-block"
                      >
                        !
                      </motion.span>
                    </h3>
                    <p className="text-muted-foreground">Grazie per avermi contattato. Ti risponderò il prima possibile.</p>
                    <button
                      onClick={() => setStatus("idle")}
                      className="mt-6 text-sm text-primary hover:underline"
                    >
                      Invia un altro messaggio
                    </button>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    variants={mv.v(CAMBIO_SCENA)}
                    initial="initial"
                    animate="show"
                    exit="exit"
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

                    <AnimatePresence>
                      {status === "error" && (
                        <motion.div
                          key="errore"
                          role="alert"
                          variants={mv.v(CAMBIO_SCENA)}
                          initial="initial"
                          animate="show"
                          exit="exit"
                          className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm"
                        >
                          {errorMessage}
                        </motion.div>
                      )}
                    </AnimatePresence>

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
                          className="flex h-14 w-full rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-sm transition-[border-color,background-color] focus:border-primary/50 focus:bg-white/10 outline-none"
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
                          className="flex h-14 w-full rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-sm transition-[border-color,background-color] focus:border-primary/50 focus:bg-white/10 outline-none"
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
                        className="flex h-14 w-full rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-sm transition-[border-color,background-color] focus:border-primary/50 focus:bg-white/10 outline-none"
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
                        className="flex min-h-40 flex-1 w-full rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-sm transition-[border-color,background-color] focus:border-primary/50 focus:bg-white/10 outline-none resize-none"
                        placeholder="Scrivi qui..."
                      ></textarea>
                    </div>

                    <motion.button
                      type="submit"
                      disabled={isPending}
                      whileTap={TAP}
                      className="w-full rounded-2xl bg-primary-deep px-10 py-6 text-primary-foreground font-bold uppercase tracking-widest hover:bg-primary-deep/90 transition-[background-color,box-shadow] shadow-lg shadow-primary/20 disabled:opacity-50 disabled:pointer-events-none flex justify-center items-center gap-2"
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
                    </motion.button>
                  </motion.form>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Card riepilogo: recapiti e dati fiscali in un colpo d'occhio.
                Su mobile segue il form; su desktop torna in colonna sinistra
                (riga 2) e si stira fino al bordo inferiore del form. */}
            <motion.div
              variants={mv.v(fadeUp)}
              className="rounded-3xl border border-border bg-white/3 p-6 lg:col-span-5 lg:col-start-1 lg:row-start-2"
            >
              {/* I quattro recapiti si presentano in scaletta, uno alla volta. */}
              <motion.div variants={mv.v(STAGGER_RECAPITI)} className="space-y-1">
                <motion.a
                  variants={mv.v(popIn)}
                  href="tel:+393805252684"
                  className="flex min-h-10 items-center gap-3 text-muted-foreground transition-colors hover:text-primary"
                >
                  <Phone size={16} aria-hidden="true" className="shrink-0 text-primary/70" />
                  +39 380 5252684
                </motion.a>
                <motion.a
                  variants={mv.v(popIn)}
                  href="mailto:info@sergioprocopio.it"
                  className="flex min-h-10 items-center gap-3 text-muted-foreground transition-colors hover:text-primary"
                >
                  <Mail size={16} aria-hidden="true" className="shrink-0 text-primary/70" />
                  info@sergioprocopio.it
                </motion.a>
                <motion.p
                  variants={mv.v(popIn)}
                  className="flex min-h-10 items-center gap-3 text-muted-foreground"
                >
                  <ReceiptText size={16} aria-hidden="true" className="shrink-0 text-primary/70" />
                  P.IVA 02470860137
                </motion.p>
                <motion.p
                  variants={mv.v(popIn)}
                  className="flex min-h-10 items-center gap-3 text-muted-foreground"
                >
                  <MapPin size={16} aria-hidden="true" className="shrink-0 text-primary/70" />
                  Via Genico, 2
                </motion.p>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </MotionConfig>
  );
}
