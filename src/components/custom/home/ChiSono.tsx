import { Fragment, useRef } from "react";
import {
  MotionConfig,
  motion,
  useInView,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import type { Variants } from "framer-motion";

import {
  DUR,
  EASE,
  SCROLL_SPRING,
  SPRING_NODE,
  VIEWPORT,
  fadeUp,
  inViewOnce,
  lineY,
  stagger,
  useMotionSafe,
} from "../../../lib/home-motion";

/* ------------------------------------------------------------------------- *
 * PROPS
 * ------------------------------------------------------------------------- */

interface Ritratto {
  src: string;
  srcset: string;
  width: number;
  height: number;
}

interface Props {
  /** getImage({src: bio.data.image, widths:[480,720,960], format:"webp", quality:75}) in index.astro. */
  ritratto: Ritratto | null;
  /** bio.data.quote da getEntry("pages","biografia"). Se assente il blocco non viene renderizzato. */
  citazione: string | null;
}

/* ------------------------------------------------------------------------- *
 * COPY EDITORIALE (non è contenuto CMS: sta qui per scelta di spec)
 * ------------------------------------------------------------------------- */

const PARAGRAFI = [
  "Sono entrato nel collegio dei Salesiani di Arese nel 1975, a undici anni. Lì ho incontrato don Vittorio Chiari e Bano Ferrari, clown professionista: il primo mi ha insegnato l’educazione, il secondo il mestiere. Nel 1977 abbiamo fondato I Barabba’s Clown: dodici anni insieme e oltre 1.800 rappresentazioni in tutta Italia e nei festival internazionali, fino alla recita in Vaticano davanti a Giovanni Paolo II nel 1989.",
  "Poi la scuola svizzera di Pierre Bayland e la scuola di Marcel Marceau, riconosciuto come il più grande mimo di tutti i tempi. Dal 1990 faccio questo mestiere a tempo pieno con la mia compagnia e con il regista Carlo Rossi: 18 spettacoli scritti e portati in scena, oltre 2.000 repliche. Il mio linguaggio è il mimo, ed è per questo che i miei spettacoli non hanno parole: li capisce un bambino di tre anni e li capisce l’anziano nell’ultima fila.",
  "Da più di vent’anni faccio anche un’altra cosa: incontro giovani e famiglie sui temi educativi della crescita insieme a scuole, associazioni, comuni e oratori, e tengo corsi sulla responsabilità per gli educatori d’oratorio. Sono un ex allievo salesiano e lavoro con i valori che ho imparato lì. Sono padre di tre figli. Quando entro nella vostra sala, so dove sono.",
] as const;

interface Tappa {
  /** Uno o più anni: il display è `anni.join(" e ")`, ma ogni anno resta un <time> a sé. */
  anni: string[];
  testo: string;
}

const TAPPE: Tappa[] = [
  {
    anni: ["1975"],
    testo: "Entro nel collegio dei Salesiani di Arese, a undici anni.",
  },
  {
    anni: ["1977"],
    testo: "Nasce la compagnia «I Barabba’s Clown».",
  },
  {
    anni: ["1989"],
    testo: "Vaticano, davanti a Giovanni Paolo II.",
  },
  {
    anni: ["1990"],
    testo:
      "Nasce la Compagnia Teatrale Sergio Procopio, con la regia di Carlo Rossi.",
  },
  {
    anni: ["1993", "1996"],
    testo:
      "Festival Internazionale del Clown di Milano; al Festival Internazionale del Riso di Bordighera sono il più applaudito.",
  },
  {
    anni: ["2006"],
    testo:
      "Venticinque anni di carriera al Piccolo Teatro Studio di Milano; e il Perù, al teatro Museo della Nazione, davanti al Presidente della Repubblica.",
  },
  {
    anni: ["2020"],
    testo: "Il traguardo dei quarant’anni di attività.",
  },
];

const TELEVISIONE = [
  "«Oro e argento» (Rai 2, 1990)",
  "«Il circolo delle 12» (Rai 3, 1992)",
  "«Caffè Italiano» (Rai 1, 1993)",
  "«Trenta ore per la vita» (Rai 2, 2006).",
] as const;

/* ------------------------------------------------------------------------- *
 * MOVIMENTO
 *
 * Easing, spring, viewport e le varianti fadeUp/lineY/stagger arrivano tutte da
 * src/lib/home-motion.ts: qui non si ridefinisce nulla di quello.
 * Le quattro varianti locali qui sotto esistono solo perché le rivelazioni in
 * clipPath richieste dallo spec di sezione (ritratto, cornice, citazione, firma)
 * non sono esprimibili con le primitive condivise. Usano EASE importato; le
 * durate sono quelle esplicitamente prescritte dallo spec di questa sezione.
 * Tutte passano da ms.v(), così con reduced motion collassano a sola opacità.
 * ------------------------------------------------------------------------- */

const DUR_SEZIONE = {
  ritratto: 1.1,
  cornice: 0.7,
  citazione: 0.8,
  nodo: 0.6,
} as const;

/** Corsa totale della parallasse del ritratto: 60px, ben sotto PARALLAX_MAX. */
const PARALLASSE_RITRATTO: number[] = [30, -30];

/** Ritratto: tendina dal basso verso l’alto + scale 1.05 → 1. */
const ritrattoReveal: Variants = {
  hidden: { clipPath: "inset(0% 0% 100% 0%)", scale: 1.05 },
  show: {
    clipPath: "inset(0% 0% 0% 0%)",
    scale: 1,
    transition: { duration: DUR_SEZIONE.ritratto, ease: EASE },
  },
};

/** Cornice oro sfalsata: si disegna da sinistra a destra. */
const corniceReveal: Variants = {
  hidden: { clipPath: "inset(0% 100% 0% 0%)" },
  show: {
    clipPath: "inset(0% 0% 0% 0%)",
    transition: { duration: DUR_SEZIONE.cornice, ease: EASE, delay: 0.3 },
  },
};

/** Citazione: wipe orizzontale. */
const citazioneWipe: Variants = {
  hidden: { clipPath: "inset(0% 100% 0% 0%)" },
  show: {
    clipPath: "inset(0% 0% 0% 0%)",
    transition: { duration: DUR_SEZIONE.citazione, ease: EASE },
  },
};

/** Firma: opacità + maschera che scorre da sinistra. */
const firmaReveal: Variants = {
  hidden: { opacity: 0, clipPath: "inset(0% 100% 0% 0%)" },
  show: {
    opacity: 1,
    clipPath: "inset(0% 0% 0% 0%)",
    transition: { duration: DUR.lg, ease: EASE },
  },
};

/** Contenitori di stagger: identità stabile, mai ricreati a ogni render. */
const STAGGER_TESTATA = stagger(0.08);
const STAGGER_PARAGRAFI = stagger(0.12);
const STAGGER_TV = stagger(0.05);

/** Alone oro che compare e decade quando il nodo della timeline si accende. */
const ALONE_NODO = [
  "0 0 0 0px rgba(212,162,76,0)",
  "0 0 0 6px rgba(212,162,76,0.12)",
  "0 0 0 12px rgba(212,162,76,0)",
];

/* ------------------------------------------------------------------------- *
 * VOCE DELLA LINEA DEL TEMPO
 * ------------------------------------------------------------------------- */

interface VoceProps {
  tappa: Tappa;
  reduced: boolean;
}

function VoceTimeline({ tappa, reduced }: VoceProps) {
  const ref = useRef<HTMLLIElement>(null);
  // useInView monta e smonta il proprio IntersectionObserver: il cleanup è
  // interno all’hook, quindi regge il rimontaggio imposto da ClientRouter.
  const inView = useInView(ref, inViewOnce(0.6));
  const attivo = reduced || inView;

  return (
    <li ref={ref} className="relative list-none pb-8 pl-8">
      <motion.span
        aria-hidden="true"
        className={`absolute left-0 top-[0.6rem] h-[11px] w-[11px] -translate-x-1/2 rounded-full border-2 transition-colors duration-300 ${
          attivo ? "border-primary bg-primary" : "border-primary/40 bg-background"
        }`}
        initial={reduced ? false : { scale: 0 }}
        animate={
          attivo
            ? reduced
              ? { scale: 1 }
              : { scale: 1, boxShadow: ALONE_NODO }
            : { scale: 0 }
        }
        transition={{
          scale: SPRING_NODE,
          boxShadow: {
            duration: DUR_SEZIONE.nodo,
            ease: EASE,
            times: [0, 0.4, 1],
          },
        }}
      />

      <motion.div
        initial={reduced ? false : { opacity: 0, x: -12 }}
        animate={attivo ? { opacity: 1, x: 0 } : { opacity: 0, x: -12 }}
        transition={{ duration: DUR.md, ease: EASE }}
      >
        <p className="font-serif text-xl text-primary">
          {tappa.anni.map((anno, i) => (
            <Fragment key={anno}>
              {i > 0 ? " e " : null}
              <time dateTime={anno}>{anno}</time>
            </Fragment>
          ))}
        </p>
        <p className="mt-1 max-w-[68ch] text-sm leading-relaxed text-muted-foreground">
          {tappa.testo}
        </p>
      </motion.div>
    </li>
  );
}

/* ------------------------------------------------------------------------- *
 * SEZIONE
 * ------------------------------------------------------------------------- */

export default function ChiSono({ ritratto, citazione }: Props) {
  const ms = useMotionSafe();

  const sectionRef = useRef<HTMLElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  // Parallasse del ritratto. useScroll rimuove da sé i listener di scroll allo
  // smontaggio dell’isola: nessun observer sopravvive alla navigazione.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const yGrezzo = useTransform(scrollYProgress, [0, 1], PARALLASSE_RITRATTO);
  const yRitratto = useSpring(yGrezzo, SCROLL_SPRING);

  // Rail della timeline che si riempie mentre si legge.
  const { scrollYProgress: avanzamentoRail } = useScroll({
    target: timelineRef,
    offset: ["start 75%", "end 55%"],
  });
  const scalaRail = useSpring(avanzamentoRail, SCROLL_SPRING);

  return (
    <MotionConfig reducedMotion="user">
      <section
        ref={sectionRef}
        id="chi-sono"
        aria-labelledby="chi-sono-title"
        className="relative scroll-mt-28 bg-background py-24 md:py-32"
      >
        {/* Decorazioni: strato unico, ritagliato, così i blob non fanno mai
            scrollare il body in orizzontale a 360px. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          <div className="absolute -top-32 -right-24 h-[640px] w-[640px] bg-[radial-gradient(circle_at_center,rgba(212,162,76,0.05)_0%,transparent_70%)]" />
          <div className="absolute top-[26%] -left-16 h-[420px] w-[420px] rounded-full bg-[#c2273d]/12 blur-[140px]" />
        </div>

        <div className="container relative z-10 mx-auto px-4 md:px-8 lg:px-12">
          {/* Testata */}
          <motion.div
            variants={ms.v(STAGGER_TESTATA)}
            initial="hidden"
            whileInView="show"
            viewport={VIEWPORT}
            className="mb-12 max-w-4xl md:mb-16"
          >
            <motion.div
              variants={ms.v(fadeUp)}
              className="mb-6 flex items-center gap-4"
            >
              <span aria-hidden="true" className="h-px w-10 shrink-0 bg-primary/40" />
              <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-primary md:text-xs">
                Chi sono
              </span>
            </motion.div>

            <motion.h2
              id="chi-sono-title"
              variants={ms.v(fadeUp)}
              className="font-serif text-[clamp(2rem,4.2vw,3.5rem)] font-bold leading-[1.03] tracking-tight text-foreground"
            >
              Sono entrato in collegio a undici anni. Ne sono uscito{" "}
              <span className="italic text-primary">clown</span>.
            </motion.h2>
          </motion.div>

          <div className="grid gap-12 lg:grid-cols-12 lg:gap-20">
            {/* ------------------------------------------------------------- *
             * COLONNA SINISTRA — ritratto, citazione, firma
             * ------------------------------------------------------------- */}
            <div className="lg:col-span-5 lg:sticky lg:top-28 lg:self-start">
              {ritratto ? (
                <motion.div
                  initial="hidden"
                  whileInView="show"
                  viewport={VIEWPORT}
                  style={{ y: ms.reduced ? 0 : yRitratto }}
                  className="relative"
                >
                  {/* Cornice oro sfalsata */}
                  <motion.div
                    aria-hidden="true"
                    variants={ms.v(corniceReveal)}
                    className="pointer-events-none absolute inset-0 translate-x-3 translate-y-3 rounded-[2rem] border border-primary/35"
                  />

                  <motion.div
                    variants={ms.v(ritrattoReveal)}
                    className="relative aspect-4/5 w-full overflow-hidden rounded-[2rem] border border-white/10 bg-[var(--card)]"
                  >
                    <img
                      src={ritratto.src}
                      srcSet={ritratto.srcset}
                      sizes="(min-width: 1024px) 40vw, 100vw"
                      width={ritratto.width}
                      height={ritratto.height}
                      alt="Sergio Procopio"
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 h-full w-full object-cover object-top outline-none"
                    />
                  </motion.div>
                </motion.div>
              ) : null}

              {citazione ? (
                <motion.div
                  initial="hidden"
                  whileInView="show"
                  viewport={VIEWPORT}
                  className={`relative pl-5 ${ritratto ? "mt-10" : ""}`}
                >
                  <motion.span
                    aria-hidden="true"
                    variants={ms.v(lineY)}
                    className="absolute left-0 top-0 h-full w-0.5 origin-top bg-primary/50"
                  />
                  <blockquote>
                    <motion.p
                      variants={ms.v(citazioneWipe)}
                      className="font-serif text-xl italic leading-relaxed text-foreground"
                    >
                      {citazione}
                    </motion.p>
                    <cite className="sr-only">Sergio Procopio</cite>
                  </blockquote>
                </motion.div>
              ) : null}

              <motion.div
                initial="hidden"
                whileInView="show"
                viewport={VIEWPORT}
                className="mt-8"
              >
                <motion.p
                  variants={ms.v(firmaReveal)}
                  className="font-serif text-2xl italic text-primary"
                >
                  Sergio Procopio
                </motion.p>
                <motion.p
                  variants={ms.v(fadeUp)}
                  className="mt-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
                >
                  attore, mimo e clown{" "}
                  <span aria-hidden="true" className="text-primary">
                    ·
                  </span>{" "}
                  Teatro Procopio
                </motion.p>
              </motion.div>
            </div>

            {/* ------------------------------------------------------------- *
             * COLONNA DESTRA — racconto, linea del tempo, televisione, CTA
             * ------------------------------------------------------------- */}
            <div className="lg:col-span-7">
              <motion.div
                variants={ms.v(STAGGER_PARAGRAFI)}
                initial="hidden"
                whileInView="show"
                viewport={VIEWPORT}
                className="max-w-[68ch] space-y-6"
              >
                {PARAGRAFI.map((paragrafo) => (
                  <motion.p
                    key={paragrafo.slice(0, 24)}
                    variants={ms.v(fadeUp)}
                    className="text-lg leading-relaxed text-foreground/85"
                  >
                    {paragrafo}
                  </motion.p>
                ))}
              </motion.div>

              <div ref={timelineRef} className="relative mt-16 md:mt-20">
                <div
                  aria-hidden="true"
                  className="absolute left-0 top-0 h-full w-px bg-border"
                />
                <motion.div
                  aria-hidden="true"
                  style={{ scaleY: ms.reduced ? 1 : scalaRail }}
                  className="absolute left-0 top-0 h-full w-px origin-top bg-linear-to-b from-primary to-primary/30"
                />

                <ol className="relative">
                  {TAPPE.map((tappa) => (
                    <VoceTimeline
                      key={tappa.anni.join("-")}
                      tappa={tappa}
                      reduced={ms.reduced}
                    />
                  ))}
                </ol>
              </div>

              <motion.p
                variants={ms.v(STAGGER_TV)}
                initial="hidden"
                whileInView="show"
                viewport={VIEWPORT}
                className="mt-12 flex flex-wrap items-center gap-x-3 gap-y-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
              >
                <motion.span variants={ms.v(fadeUp)}>In televisione:</motion.span>
                {TELEVISIONE.map((voce, i) => (
                  <motion.span
                    key={voce}
                    variants={ms.v(fadeUp)}
                    className="inline-flex items-center gap-3"
                  >
                    {i > 0 ? (
                      <span aria-hidden="true" className="text-primary">
                        ·
                      </span>
                    ) : null}
                    {voce}
                  </motion.span>
                ))}
              </motion.p>

              <motion.div
                variants={ms.v(fadeUp)}
                initial="hidden"
                whileInView="show"
                viewport={VIEWPORT}
                className="mt-10"
              >
                <a
                  href="/biografia"
                  className="inline-flex min-h-11 items-center text-sm font-bold uppercase tracking-wider shadow-[inset_0_-2px_0_rgba(212,162,76,0.3)] transition-[color,box-shadow,scale] duration-150 hover:text-primary hover:shadow-[inset_0_-2px_0_#d4a24c] active:scale-[0.96]"
                >
                  Leggi la biografia completa
                </a>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </MotionConfig>
  );
}
