import { useEffect, useRef, useState } from "react";
import type { Ref } from "react";
import {
  AnimatePresence,
  MotionConfig,
  motion,
  useInView,
  useMotionValue,
  useTransform,
} from "framer-motion";
import type { PanInfo } from "framer-motion";

import {
  VIEWPORT,
  fadeUp,
  lineX,
  luceScena,
  quinta,
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

interface CardRecensioneProps {
  readonly recensione: string;
  readonly fotoAttiva: FotoRecensione | null;
  readonly multiple: boolean;
  /** Verso del cambio di quinta: +1 avanti, −1 indietro. */
  readonly direzione: number;
  /** Flag condiviso col padre: sopprime il click sulla firma a fine drag. */
  readonly trascinandoRef: { current: boolean };
  readonly onDragStart: () => void;
  readonly onDragEnd: (evento: unknown, info: PanInfo) => void;
  /** Inoltrato alla figure: mode="popLayout" misura la card uscente per metterla in absolute. */
  readonly ref?: Ref<HTMLElement>;
}

/**
 * Card singola del carosello. La corsa del trascinamento pilota anche
 * l'opacità: più tiri, più la card diventa trasparente. Con mode="popLayout"
 * la card uscente e quella entrante convivono nel DOM, quindi ogni card ha il
 * PROPRIO MotionValue: un valore condiviso le farebbe scorrere all'unisono
 * invece di incrociarsi come quinte.
 */
function CardRecensione({
  recensione,
  fotoAttiva,
  multiple,
  direzione,
  trascinandoRef,
  onDragStart,
  onDragEnd,
  ref,
}: CardRecensioneProps) {
  const { reduced, v } = useMotionSafe();

  const x = useMotionValue(0);
  const opacitaDrag = useTransform(
    x,
    [-SOGLIA_SWIPE_PX * 2, 0, SOGLIA_SWIPE_PX * 2],
    [0.2, 1, 0.2],
  );

  return (
    <motion.figure
      ref={ref}
      style={reduced ? undefined : { x, opacity: opacitaDrag }}
      variants={v(quinta)}
      custom={direzione}
      initial="initial"
      animate="show"
      exit="exit"
      drag={multiple ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.25}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={`group relative flex flex-col rounded-4xl border border-border bg-[var(--card)] transition-[border-color] duration-500 hover:border-primary/50 md:min-h-[26rem] md:flex-row ${
        multiple ? "cursor-grab active:cursor-grabbing select-none" : ""
      }`}
    >
      {/* Niente overflow-hidden sulla figure: taglierebbe il glow pre-dipinto.
        * Il ritaglio serve solo alla foto, che si arrotonda da sola sui lati
        * che toccano il bordo della card (sopra su mobile, sinistra su md). */}
      {fotoAttiva && (
        <div className="relative aspect-16/9 w-full shrink-0 overflow-hidden rounded-t-4xl bg-secondary/20 md:aspect-auto md:w-2/5 md:rounded-tr-none md:rounded-bl-4xl">
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
                className="group/firma relative text-primary shadow-[inset_0_-1px_0_rgba(232,72,63,0.35)] transition-colors duration-150 hover:text-primary-hover"
              >
                «{fotoAttiva.titolo}»
                {/* Filo hover pre-dipinto: si accende in sola opacity sopra
                  * il filo statico, mai animando box-shadow. */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-[#e8483f] opacity-0 transition-opacity duration-150 group-hover/firma:opacity-100 motion-reduce:transition-none"
                />
              </a>
            </span>
          </figcaption>
        )}
      </div>

      {/* Glow pre-dipinto: si accende in sola opacity, mai
        * animando box-shadow (compositor-friendly). */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -inset-px rounded-[inherit] shadow-[0_0_30px_rgba(232,72,63,0.15)] opacity-0 transition-opacity duration-500 group-hover:opacity-100 motion-reduce:transition-none"
      />
    </motion.figure>
  );
}

function CaroselloRecensioni({ foto }: CaroselloProps) {
  const { reduced, v } = useMotionSafe();
  const [indice, setIndice] = useState(0);
  // Verso del cambio di quinta (+1 avanti, −1 indietro): impostato SEMPRE
  // prima di cambiare indice, così AnimatePresence legge il verso aggiornato
  // sia per la card che esce sia per quella che entra.
  const [direzione, setDirezione] = useState(1);
  const [inPausa, setInPausa] = useState(false);

  const multiple = RECENSIONI.length > 1;

  // Fuori viewport la rotazione non ha pubblico: useInView SENZA once, deve
  // rilevare anche l'uscita dalla scena.
  const sezioneRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sezioneRef, { amount: 0.2 });

  // La rotazione si ferma con reduced motion (si naviga con i trattini), in
  // pausa (mouse sopra, focus da tastiera, drag: si sta leggendo — WCAG 2.2.2),
  // fuori viewport e con la scheda del browser in secondo piano.
  useEffect(() => {
    if (!multiple || reduced || inPausa || !inView) return;

    let timer: number | undefined;

    const ferma = () => {
      if (timer !== undefined) {
        window.clearInterval(timer);
        timer = undefined;
      }
    };

    const avvia = () => {
      if (timer === undefined && !document.hidden) {
        timer = window.setInterval(() => {
          // La rotazione automatica va sempre avanti: quinta verso sinistra.
          setDirezione(1);
          setIndice((i) => (i + 1) % RECENSIONI.length);
        }, INTERVALLO_ROTAZIONE_MS);
      }
    };

    const allaVisibilita = () => (document.hidden ? ferma() : avvia());

    document.addEventListener("visibilitychange", allaVisibilita);
    avvia();

    return () => {
      document.removeEventListener("visibilitychange", allaVisibilita);
      ferma();
    };
  }, [multiple, reduced, inPausa, inView]);

  const recensione = RECENSIONI[indice];
  const fotoAttiva = foto.length > 0 ? foto[indice % foto.length] : null;

  const vai = (delta: number) => {
    setDirezione(delta > 0 ? 1 : -1);
    setIndice((i) => (i + delta + RECENSIONI.length) % RECENSIONI.length);
  };

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
      ref={sezioneRef}
      variants={v(fadeUp)}
      initial="hidden"
      whileInView="show"
      viewport={VIEWPORT}
      onMouseEnter={() => setInPausa(true)}
      onMouseLeave={() => setInPausa(false)}
      onFocus={() => setInPausa(true)}
      onBlur={() => setInPausa(false)}
      className="relative mx-auto max-w-5xl md:min-h-[26rem]"
    >
      <AnimatePresence mode="popLayout" custom={direzione} initial={false}>
        <CardRecensione
          key={indice}
          recensione={recensione}
          fotoAttiva={fotoAttiva}
          multiple={multiple}
          direzione={direzione}
          trascinandoRef={trascinandoRef}
          onDragStart={() => {
            setInPausa(true);
            trascinandoRef.current = true;
          }}
          onDragEnd={fineTrascinamento}
        />
      </AnimatePresence>

      {multiple && (
        <div
          role="group"
          aria-label="Scegli la recensione da leggere"
          className="mt-4 flex justify-center gap-2"
        >
          {RECENSIONI.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Recensione ${i + 1} di ${RECENSIONI.length}`}
              aria-current={i === indice}
              onClick={() => {
                setDirezione(i > indice ? 1 : -1);
                setIndice(i);
              }}
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
        {/* La sala si illumina PRIMA che titolo e recensioni finiscano di
            entrare (luceScena, DUR.lg). hidden ha opacity:0 inline: il
            noscript lo riaccende senza danni, è solo un gradiente. */}
        <motion.div
          aria-hidden="true"
          variants={v(luceScena)}
          initial="hidden"
          whileInView="show"
          viewport={VIEWPORT}
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(232,72,63,0.05)_0%,transparent_70%)]"
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
              Un curriculum che potete verificare prima di firmare
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
            className="mt-16 grid grid-cols-2 gap-x-4 gap-y-6 sm:gap-x-10 sm:gap-y-8 lg:grid-cols-3"
          >
            {CREDENZIALI.map((credenziale) => (
              <motion.div key={credenziale.chiave} variants={v(fadeUp)} className="group">
                <dt className="font-serif text-lg text-primary transition-colors duration-[250ms] group-hover:text-primary-hover sm:text-xl">
                  {credenziale.chiave}
                </dt>
                <dd className="text-sm leading-relaxed text-muted-foreground">
                  {/* Filo a doppio strato, tutto su scaleX (niente width sul
                      layout): la base si disegna all'entrata (lineX), lo
                      strato hover completa il filo a tutta larghezza. */}
                  <span aria-hidden="true" className="relative my-3 block h-px w-full">
                    <motion.span
                      variants={v(lineX)}
                      className="absolute inset-y-0 left-0 w-12 origin-left bg-primary/60"
                    />
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 origin-left scale-x-0 bg-primary/60 transition-transform duration-[350ms] group-hover:scale-x-100 motion-reduce:transition-none"
                    />
                  </span>
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
