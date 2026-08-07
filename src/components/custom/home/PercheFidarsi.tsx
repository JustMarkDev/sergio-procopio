import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  MotionConfig,
  motion,
  useMotionValue,
  useTransform,
} from "framer-motion";
import type { PanInfo } from "framer-motion";

import {
  DUR,
  DUR_REDUCED,
  EASE,
  VIEWPORT,
  fadeUp,
  lineX,
  stagger,
  useMotionSafe,
} from "../../../lib/home-motion";

/**
 * PERCHÉ FIDARSI — recensioni a rotazione con foto, sei credenziali.
 *
 * Serve al committente per convincere qualcun altro: il consiglio pastorale,
 * il collegio docenti, il direttivo della sezione alpini.
 *
 * ⚠ SEGNAPOSTO: i testi in RECENSIONI sono finti, scritti solo per vedere il
 * carosello in funzione. Vanno sostituiti con recensioni vere (testo, fonte,
 * contesto) prima di pubblicare. Le foto arrivano da index.astro, già
 * ottimizzate con getImage.
 */

/* ------------------------------------------------------------------------- *
 * CONTENUTO
 * ------------------------------------------------------------------------- */

/** Testi SEGNAPOSTO (vedi avviso in testa al file). La firma della card è il
 *  titolo dello spettacolo da cui viene la foto abbinata, per indice. */
const RECENSIONI: readonly string[] = [
  "Bellissimo spettacolo, un'ora volata senza mai guardare l'orologio: ridevano i bambini in prima fila e ridevano i nonni in fondo alla sala. Alla fine nessuno voleva tornare a casa.",
  "Un'emozione dall'inizio alla fine, senza bisogno di una sola parola: solo gesti, musica e silenzi che arrivano dritti al cuore. Il pubblico è rimasto incantato dal primo minuto all'ultimo.",
  "I ragazzi ne hanno parlato per giorni: è arrivato dove le lezioni non arrivano. Un modo intelligente e delicato di toccare temi difficili, riuscendo persino a far sorridere.",
  "Organizzazione impeccabile: è arrivato, ha montato luci e audio in autonomia e la serata è filata liscia dall'inizio alla fine. Per noi organizzatori non c'è stato un solo pensiero.",
  "Poesia e risate insieme, come non capita spesso di vedere: il pubblico è uscito con il sorriso e con una domanda su cui riflettere. Uno spettacolo che resta addosso.",
  "La serata più riuscita della nostra festa: sala piena, applausi lunghi e tante famiglie a ringraziare all'uscita. Lo riprenderemmo anche domani, a occhi chiusi.",
];

interface Credenziale {
  readonly chiave: string;
  readonly dettaglio: string;
}

const CREDENZIALI: readonly Credenziale[] = [
  {
    chiave: "Vaticano, 1989",
    dettaglio:
      "Esibizione davanti a Giovanni Paolo II, a chiusura dei dodici anni con I Barabba's Clown.",
  },
  {
    chiave: "Scuola di Marcel Marceau",
    dettaglio:
      "Formazione con il maestro riconosciuto come il più grande mimo di tutti i tempi, e alla scuola svizzera di Pierre Bayland.",
  },
  {
    chiave: "Piccolo Teatro Studio, Milano, 2006",
    dettaglio:
      "I venticinque anni di carriera festeggiati nel teatro simbolo della prosa italiana.",
  },
  {
    chiave: "Università Bocconi, Milano",
    dettaglio:
      "Da oltre vent'anni si esibisce regolarmente davanti a un pubblico adulto e istituzionale.",
  },
  {
    chiave: "RAI, 1990–2006",
    dettaglio:
      "Oro e argento (Rai 2), Il circolo delle 12 (Rai 3), Caffè Italiano (Rai 1), Trenta ore per la vita (Rai 2).",
  },
  {
    chiave: "Perù, 2006",
    dettaglio: "Teatro Museo della Nazione, davanti al Presidente della Repubblica.",
  },
];

/* ------------------------------------------------------------------------- *
 * MOVIMENTO — istanze stabili: `v()` di useMotionSafe indicizza per identità
 * ------------------------------------------------------------------------- */

const STAGGER_TESTA = stagger(0.07);
const STAGGER_CREDENZIALI = stagger(0.07);

/** Quanto resta in scena ogni recensione prima di passare alla successiva. */
const INTERVALLO_ROTAZIONE_MS = 6000;

/** Oltre questa corsa (o con abbastanza velocità) il trascinamento cambia card. */
const SOGLIA_SWIPE_PX = 80;
const SOGLIA_SWIPE_VELOCITA = 400;

/* ------------------------------------------------------------------------- *
 * CAROSELLO RECENSIONI
 * ------------------------------------------------------------------------- */

export interface FotoRecensione {
  src: string;
  srcset: string;
  width: number;
  height: number;
  /** Titolo dello spettacolo da cui viene la foto: firma la card. */
  titolo: string;
  /** Slug dello spettacolo: il titolo nella firma porta alla sua scheda. */
  id: string;
}

interface CaroselloProps {
  readonly foto: FotoRecensione[];
}

function CaroselloRecensioni({ foto }: CaroselloProps) {
  const { reduced, v } = useMotionSafe();
  const [indice, setIndice] = useState(0);
  const [inPausa, setInPausa] = useState(false);

  const multiple = RECENSIONI.length > 1;

  // La rotazione si ferma con il mouse sopra (si sta leggendo) e con
  // reduced motion (si naviga con i trattini).
  useEffect(() => {
    if (!multiple || reduced || inPausa) return;

    const timer = window.setInterval(
      () => setIndice((i) => (i + 1) % RECENSIONI.length),
      INTERVALLO_ROTAZIONE_MS,
    );

    return () => window.clearInterval(timer);
  }, [multiple, reduced, inPausa]);

  const recensione = RECENSIONI[indice];
  const fotoAttiva = foto.length > 0 ? foto[indice % foto.length] : null;

  const vai = (delta: number) =>
    setIndice((i) => (i + delta + RECENSIONI.length) % RECENSIONI.length);

  // La corsa del trascinamento pilota anche l'opacità: più tiri, più la card
  // diventa trasparente. Il MotionValue è condiviso tra card uscente ed
  // entrante (mode="wait"), quindi entrata e uscita restano coerenti.
  const x = useMotionValue(0);
  const opacitaDrag = useTransform(
    x,
    [-SOGLIA_SWIPE_PX * 2, 0, SOGLIA_SWIPE_PX * 2],
    [0.2, 1, 0.2],
  );

  // La card cambia SOLO al rilascio: finché il tasto resta premuto si può
  // tirare quanto si vuole e anche ripensarci tornando al centro. Il flag
  // serve a sopprimere il click sul link della firma a fine trascinamento.
  const trascinandoRef = useRef(false);

  const fineTrascinamento = (_evento: unknown, info: PanInfo) => {
    window.setTimeout(() => {
      trascinandoRef.current = false;
    }, 0);

    if (!multiple) return;

    if (info.offset.x < -SOGLIA_SWIPE_PX || info.velocity.x < -SOGLIA_SWIPE_VELOCITA) {
      vai(1);
    } else if (info.offset.x > SOGLIA_SWIPE_PX || info.velocity.x > SOGLIA_SWIPE_VELOCITA) {
      vai(-1);
    }
  };

  return (
    <motion.div
      variants={v(fadeUp)}
      initial="hidden"
      whileInView="show"
      viewport={VIEWPORT}
      onMouseEnter={() => setInPausa(true)}
      onMouseLeave={() => setInPausa(false)}
      className="mx-auto max-w-5xl"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.figure
          key={indice}
          style={reduced ? undefined : { x, opacity: opacitaDrag }}
          initial={
            reduced
              ? { opacity: 0 }
              : { x: SOGLIA_SWIPE_PX * 2, scale: 0.98 }
          }
          animate={reduced ? { opacity: 1 } : { x: 0, scale: 1 }}
          exit={
            reduced
              ? { opacity: 0 }
              : { x: -SOGLIA_SWIPE_PX * 2, scale: 0.98 }
          }
          transition={{
            duration: reduced ? DUR_REDUCED : DUR.md,
            ease: EASE,
          }}
          drag={multiple ? "x" : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.25}
          onDragStart={() => {
            setInPausa(true);
            trascinandoRef.current = true;
          }}
          onDragEnd={fineTrascinamento}
          className={`relative flex flex-col overflow-hidden rounded-4xl border border-white/10 bg-[var(--card)] transition-[border-color,box-shadow] duration-500 hover:border-primary/50 hover:shadow-[0_0_30px_rgba(212,162,76,0.15)] md:min-h-[26rem] md:flex-row ${
            multiple ? "cursor-grab active:cursor-grabbing select-none" : ""
          }`}
        >
          {fotoAttiva && (
            <div className="relative aspect-16/9 w-full shrink-0 overflow-hidden bg-secondary/20 md:aspect-auto md:w-2/5">
              <img
                src={fotoAttiva.src}
                srcSet={fotoAttiva.srcset}
                sizes="(min-width: 768px) 40vw, 100vw"
                alt=""
                width={fotoAttiva.width}
                height={fotoAttiva.height}
                loading="lazy"
                decoding="async"
                draggable={false}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent md:bg-linear-to-r"
              />
            </div>
          )}

          <div className="relative flex flex-col justify-center p-8 md:p-12">
            {/* Glifo virgolette: ornamento, non contenuto. */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute top-0 left-6 font-serif text-[6rem] leading-none text-primary/10 select-none"
            >
              &ldquo;
            </span>

            <blockquote className="relative font-serif text-xl leading-relaxed text-foreground italic md:text-2xl">
              {recensione}
            </blockquote>

            {fotoAttiva && (
              <figcaption className="relative mt-8">
                <span className="block text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
                  Su{" "}
                  <a
                    href={`/spettacoli/${fotoAttiva.id}`}
                    draggable={false}
                    onClick={(e) => {
                      // Niente navigazione accidentale a fine trascinamento.
                      if (trascinandoRef.current) e.preventDefault();
                    }}
                    className="text-primary shadow-[inset_0_-1px_0_rgba(212,162,76,0.35)] transition-[color,box-shadow] duration-150 hover:text-[#e8b44a] hover:shadow-[inset_0_-1px_0_#e8b44a]"
                  >
                    «{fotoAttiva.titolo}»
                  </a>
                </span>
              </figcaption>
            )}
          </div>
        </motion.figure>
      </AnimatePresence>

      {multiple && (
        <div
          role="group"
          aria-label="Scegli la recensione da leggere"
          className="mt-4 flex justify-center gap-2"
        >
          {RECENSIONI.map((voce, i) => (
            <button
              key={voce.slice(0, 24)}
              type="button"
              aria-label={`Recensione ${i + 1} di ${RECENSIONI.length}`}
              aria-current={i === indice}
              onClick={() => setIndice(i)}
              className={`flex h-11 w-8 items-center transition-opacity duration-200 ${
                i === indice ? "opacity-100" : "opacity-40 hover:opacity-70"
              }`}
            >
              <span className="block h-1 w-full rounded-full bg-primary" />
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
}

/* ------------------------------------------------------------------------- *
 * SEZIONE
 * ------------------------------------------------------------------------- */

export interface PercheFidarsiProps {
  /** Foto di scena già ottimizzate da index.astro, una per recensione (cicliche). */
  readonly foto?: FotoRecensione[];
  /**
   * Classi aggiuntive sul <section>. index.astro monta l'isola con le sole
   * foto (`<PercheFidarsi client:visible foto={...} />`).
   */
  readonly className?: string;
}

export default function PercheFidarsi({ foto = [], className = "" }: PercheFidarsiProps) {
  const { v } = useMotionSafe();

  return (
    <MotionConfig reducedMotion="user">
      <section
        id="perche-fidarsi"
        aria-labelledby="perche-fidarsi-title"
        className={`relative scroll-mt-28 overflow-hidden bg-background-alt py-24 md:py-32 ${className}`}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,162,76,0.05)_0%,transparent_70%)]"
        />

        <div className="relative z-10 container mx-auto px-4 md:px-8 lg:px-12">
          <motion.div
            variants={v(STAGGER_TESTA)}
            initial="hidden"
            whileInView="show"
            viewport={VIEWPORT}
          >
            <motion.div variants={v(fadeUp)} className="mb-6 flex items-center gap-4">
              <span aria-hidden="true" className="h-px w-10 bg-primary/40" />
              <span className="text-[11px] font-bold tracking-[0.25em] text-primary uppercase md:text-xs">
                Perché fidarsi
              </span>
            </motion.div>

            <motion.h2
              id="perche-fidarsi-title"
              variants={v(fadeUp)}
              className="mb-5 font-serif text-[clamp(2rem,4.2vw,3.5rem)] leading-[1.03] font-bold tracking-tight text-foreground"
            >
              Un curriculum che potete verificare prima di firmare.
            </motion.h2>

            <motion.p
              variants={v(fadeUp)}
              className="mb-12 max-w-2xl text-lg leading-relaxed text-muted-foreground md:mb-16 md:text-xl"
            >
              Se dovete convincere un consiglio pastorale, un dirigente o un direttivo,
              questi sono i fatti da citare.
            </motion.p>
          </motion.div>

          <CaroselloRecensioni foto={foto} />

          <motion.dl
            variants={v(STAGGER_CREDENZIALI)}
            initial="hidden"
            whileInView="show"
            viewport={VIEWPORT}
            className="mt-16 grid gap-x-10 gap-y-8 md:grid-cols-2 lg:grid-cols-3"
          >
            {CREDENZIALI.map((credenziale) => (
              <motion.div key={credenziale.chiave} variants={v(fadeUp)} className="group">
                <dt className="font-serif text-xl text-primary transition-colors duration-[250ms] group-hover:text-[#e8b44a]">
                  {credenziale.chiave}
                </dt>
                <dd className="text-sm leading-relaxed text-muted-foreground">
                  <motion.span
                    aria-hidden="true"
                    variants={v(lineX)}
                    className="my-3 block h-px w-12 origin-left bg-primary/60 transition-[width] duration-[350ms] group-hover:w-full"
                  />
                  {credenziale.dettaglio}
                </dd>
              </motion.div>
            ))}
          </motion.dl>
        </div>
      </section>
    </MotionConfig>
  );
}
