import { useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, MotionConfig, motion, type Variants } from "framer-motion";
import { Plus } from "lucide-react";
import {
  DUR,
  EASE,
  EASE_SOFT,
  SPRING,
  VIEWPORT,
  fadeUp,
  lineY,
  stagger,
  useMotionSafe,
} from "../../../lib/home-motion";

/**
 * SEZIONE 6 — «Le domande che mi fanno tutti».
 *
 * Ultimo ostacolo prima del modulo: le obiezioni che nessuno scrive nel form
 * (volgarità in sala parrocchiale, ragazzi che non stanno fermi, niente tecnico,
 * mezza sala vuota) messe nero su bianco con la risposta.
 *
 * Le voci arrivano da src/lib/home-faq.ts via index.astro e sono LA STESSA
 * fonte del JSON-LD FAQPage emesso lato server: con l'accordion chiuso il
 * pannello è smontato, quindi il testo è indicizzabile solo dallo structured
 * data. Nessun copy è scritto a mano qui dentro, a parte occhiello, titolo e
 * riga di chiusura.
 */

export interface Faq {
  q: string;
  a: string;
}

export interface DomandeCommittentiProps {
  faq: Faq[];
}

/* ------------------------------------------------------------------------- *
 * MICRO-INTERAZIONI DI RIGA
 * Composte solo con i token importati da home-motion (DUR, EASE, SPRING):
 * nessun easing e nessuna durata ridefiniti in locale.
 *
 * NOTA TECNICA: chi usa queste varianti dichiara `initial="rest"` su sé stesso
 * e non si accontenta della propagazione dal bottone. A hover finito Framer
 * ripristina i valori leggendo `getBaseTarget`, che guarda la prop `initial`
 * del singolo componente: senza quella prop la hairline resterebbe accesa.
 * ------------------------------------------------------------------------- */

/** Hairline oro che cresce da sinistra sul bordo alto della riga in hover. */
const HAIRLINE_HOVER: Variants = {
  rest: { scaleX: 0 },
  hover: { scaleX: 1, transition: { duration: DUR.sm, ease: EASE } },
};

/** La domanda trasla di 3px in hover; il colore passa a oro via CSS. */
const QUESTION_HOVER: Variants = {
  rest: { x: 0 },
  hover: { x: 3, transition: SPRING },
};

/* ------------------------------------------------------------------------- *
 * EVIDENZIAZIONE DELLE RISPOSTE
 * ------------------------------------------------------------------------- */

/**
 * Le risposte arrivano come testo semplice, senza markup: finiscono anche
 * dentro JSON.stringify per il FAQPage, quindi in home-faq.ts non possono
 * contenere HTML. Per ottenere «nomi propri e date in text-foreground» chiesti
 * dallo spec senza duplicare qui una lista di nomi (che divergerebbe dal copy
 * al primo ritocco), si evidenzia per FORMA e non per elenco:
 *   1. i titoli e le citazioni fra virgolette basse «...»
 *   2. le cifre e gli anni (1989, 1.800, 120)
 *   3. le sequenze di due o più parole con l'iniziale maiuscola
 *      (Marcel Marceau, Giovanni Paolo II, Prima Guerra Mondiale)
 *   4. le sigle tutte maiuscole (RAI)
 * La punteggiatura interrompe le sequenze, così un inizio di frase non viene
 * mai scambiato per un nome proprio; le virgolette basse sono limitate a 60
 * caratteri, così una « spaiata non può evidenziare mezza risposta.
 */
const HIGHLIGHT_RE =
  /«[^»]{1,60}»|\d+(?:[.,]\d+)*|\p{Lu}[\p{L}'’]*(?:\s\p{Lu}[\p{L}'’]*)+|\p{Lu}{2,}/gu;

function highlightAnswer(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let cursor = 0;

  for (const match of text.matchAll(HIGHLIGHT_RE)) {
    const start = match.index ?? 0;

    if (start > cursor) nodes.push(text.slice(cursor, start));

    nodes.push(
      <span key={`${start}-${match[0]}`} className="text-foreground">
        {match[0]}
      </span>,
    );

    cursor = start + match[0].length;
  }

  if (cursor < text.length) nodes.push(text.slice(cursor));

  return nodes;
}

/* ------------------------------------------------------------------------- *
 * COMPONENTE
 * ------------------------------------------------------------------------- */

export default function DomandeCommittenti({ faq }: DomandeCommittentiProps) {
  const safe = useMotionSafe();

  /** Accordion a stato singolo: la chiusura di una voce e l'apertura dell'altra
   *  avvengono nello stesso frame. */
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  /** Memoizzato: `stagger()` costruisce un oggetto nuovo a ogni chiamata e
   *  `safe.v()` indicizza la sua cache per identità referenziale. */
  const listStagger = useMemo(() => stagger(0.05), []);

  /**
   * height 0→auto NON è una trasformazione: `<MotionConfig reducedMotion="user">`
   * non la ferma. Con reduced motion `safe.t()` la porta a { duration: 0 } e
   * l'apertura diventa istantanea.
   */
  const panelTransition = safe.t({ duration: DUR.sm, ease: EASE_SOFT });

  return (
    <MotionConfig reducedMotion="user">
      <section
        id="domande"
        aria-labelledby="domande-title"
        className="scroll-mt-28 bg-background py-24 md:py-32"
      >
        <div className="container mx-auto px-4 md:px-8 lg:px-12">
          <motion.div
            variants={safe.v(listStagger)}
            initial="hidden"
            whileInView="show"
            viewport={VIEWPORT}
            className="mx-auto max-w-3xl"
          >
            <motion.div
              variants={safe.v(fadeUp)}
              className="mb-6 flex items-center gap-4"
            >
              <span aria-hidden="true" className="h-px w-10 bg-primary/40" />
              <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-primary md:text-xs">
                Prima di decidere
              </span>
            </motion.div>

            <motion.h2
              id="domande-title"
              variants={safe.v(fadeUp)}
              className="mb-12 font-serif text-[clamp(2rem,4.2vw,3.5rem)] font-bold leading-[1.03] tracking-tight text-foreground md:mb-16"
            >
              Le domande che mi fanno tutti.
            </motion.h2>

            <motion.ul
              variants={safe.v(listStagger)}
              className="border-b border-border"
            >
              {faq.map((item, index) => {
                const isOpen = openIndex === index;
                const numero = String(index + 1).padStart(2, "0");
                const buttonId = `faq-button-${index + 1}`;
                const panelId = `faq-panel-${index + 1}`;

                return (
                  <motion.li
                    key={item.q}
                    variants={safe.v(fadeUp)}
                    className="relative border-t border-border"
                  >
                    {/* Barra oro della voce aperta: scaleY dall'alto, in leggero ritardo. */}
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.span
                          key="barra"
                          aria-hidden="true"
                          variants={safe.v(lineY)}
                          custom={0.06}
                          initial="hidden"
                          animate="show"
                          exit="hidden"
                          className="pointer-events-none absolute left-0 top-0 h-full w-0.5 origin-top bg-primary"
                        />
                      )}
                    </AnimatePresence>

                    <motion.button
                      type="button"
                      id={buttonId}
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => setOpenIndex(isOpen ? null : index)}
                      initial="rest"
                      whileHover="hover"
                      className="group relative flex min-h-16 w-full items-center gap-4 py-6 pl-4 pr-1 text-left transition-transform duration-150 active:scale-[0.99] md:gap-6 md:pl-6"
                    >
                      {/* Con reduced motion la hairline non viene proprio montata. */}
                      {!safe.reduced && (
                        <motion.span
                          aria-hidden="true"
                          variants={HAIRLINE_HOVER}
                          initial="rest"
                          className="pointer-events-none absolute inset-x-0 top-0 h-px origin-left bg-primary/70"
                        />
                      )}

                      <span
                        aria-hidden="true"
                        className="shrink-0 font-serif text-base font-bold tabular-nums text-primary/45 md:text-lg"
                      >
                        {numero}
                      </span>

                      <motion.span
                        variants={QUESTION_HOVER}
                        initial="rest"
                        className="grow text-[17px] font-semibold leading-snug text-foreground transition-colors duration-200 group-hover:text-primary md:text-lg"
                      >
                        {item.q}
                      </motion.span>

                      <motion.span
                        aria-hidden="true"
                        initial={false}
                        animate={{ rotate: isOpen ? 45 : 0 }}
                        transition={safe.t(SPRING)}
                        className="grid size-5 shrink-0 place-items-center text-primary"
                      >
                        <Plus size={20} strokeWidth={2} />
                      </motion.span>
                    </motion.button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          key="pannello"
                          id={panelId}
                          role="region"
                          aria-labelledby={buttonId}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={panelTransition}
                          className="overflow-hidden"
                        >
                          <p className="max-w-[68ch] pb-7 pl-4 pr-1 text-[15px] leading-relaxed text-muted-foreground md:pl-6">
                            {highlightAnswer(item.a)}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.li>
                );
              })}
            </motion.ul>

            <motion.p
              variants={safe.v(fadeUp)}
              className="mt-10 text-center text-sm text-muted-foreground"
            >
              Non c'è la vostra domanda? Chiedetemela al telefono,{" "}
              <a
                href="tel:+393805252684"
                className="inline-flex min-h-11 items-center align-middle font-semibold whitespace-nowrap text-primary underline decoration-primary/40 underline-offset-4 transition-[text-decoration-color,scale] duration-200 hover:decoration-primary active:scale-[0.96]"
              >
                380 5252684
              </a>
              , oppure scrivetela nel modulo qui sotto.
            </motion.p>
          </motion.div>
        </div>
      </section>
    </MotionConfig>
  );
}
