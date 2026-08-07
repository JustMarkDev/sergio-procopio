import { Fragment, useMemo, useRef } from "react";
import { ArrowRight } from "lucide-react";
import {
  MotionConfig,
  motion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  DUR_REDUCED,
  EASE,
  HOVER_BUTTON,
  PARALLAX_MAX,
  SCROLL_SPRING,
  fadeUp,
  stagger,
  useMotionSafe,
} from "../../../lib/home-motion";

/**
 * HERO PER I COMMITTENTI — prima sezione della home, `client:load`.
 *
 * Nei primi tre secondi dice COSA si compra e A CHI parla il sito: enti che
 * programmano, non spettatori. Sostituisce il vecchio hero, che metteva il nome
 * dell'artista in 9rem davanti a un pubblico che non lo conosce.
 *
 * È l'UNICA sezione della home che anima al mount (`animate`): tutto il resto
 * usa `whileInView`, perché ClientRouter rimonta le isole a ogni navigazione.
 *
 * Nessun dato scritto a mano: conteggio dei titoli, elenco degli enti e prossima
 * data pubblica arrivano da index.astro, già risolti a build time.
 */

/* ------------------------------------------------------------------------- *
 * COPY STATICO
 * Le uniche stringhe che non dipendono dai dati. Tutto il resto viene da props.
 * ------------------------------------------------------------------------- */

/** Occhiello. In minuscolo nel markup: la resa in maiuscolo è di `uppercase`,
 *  così gli screen reader non lo compitano lettera per lettera. */
const OCCHIELLO = "Teatro comico senza parole · Produzione Teatro Procopio";

/** Prima riga dell'H1: la prima parola è il conteggio, che arriva da props. */
const TITOLO_CODA = ["spettacoli", "pronti"];

/** Seconda riga dell'H1, tutta in corsivo oro. */
const TITOLO_ACCENTO = ["per", "la", "vostra", "sala"];

const SOTTOTITOLO =
  "Sergio Procopio porta in oratori, parrocchie, scuole, teatri comunali e " +
  "sezioni alpine un repertorio senza parole, rodato in mezzo secolo di " +
  "palcoscenico. Arrivo con la produzione: regia, audio e luci. A voi la sala " +
  "e il pubblico.";

const RIGA_TECNICA = [
  "Durata da 1 ora",
  "età dichiarate da 3+ a 12+",
  "audio e luci inclusi",
  "un solo interlocutore",
];

/* ------------------------------------------------------------------------- *
 * TEMPI E MISURE DELLA SEZIONE
 * Easing, durate standard, spring e varianti stanno TUTTI in home-motion.ts:
 * qui restano solo i ritardi editoriali di questa sezione, passati via `custom`.
 * ------------------------------------------------------------------------- */

const STAGGER_COLONNA = 0.08;
const DELAY_COLONNA = 0.15;

const DELAY_RIGA_TECNICA = 0.7;

/** Entrata della foto: valore prescritto per questa sola immagine, non un token. */
const DUR_FOTO = 1.4;

/** Corsa della parallasse del testo (verso l'alto) e opacità di fondo corsa. */
const PARALLAX_TESTO = -40;
const OPACITA_TESTO_FINE = 0.35;

/** Ripiego per width/height della foto: servono solo come rapporto intrinseco,
 *  perché a dimensionarla è il CSS (`h-full w-full object-cover`). */
const FOTO_W = 1920;
const FOTO_H = 1280;

/* ------------------------------------------------------------------------- *
 * PROPS
 * ------------------------------------------------------------------------- */

export interface HeroImmagine {
  src: string;
  srcset: string;
  /** Opzionali: se index.astro li passa, sostituiscono il rapporto di ripiego. */
  width?: number;
  height?: number;
}

export interface HeroCommittentiProps {
  /** Numero dei titoli in lettere, da NUMERI_IT[shows.length]. Mai scritto a mano. */
  showCountLabel: string;
  /** Foto di scena già passata da getImage(). `null` = hero senza foto, non si rompe. */
  hero: HeroImmagine | null;
}

export default function HeroCommittenti({
  showCountLabel,
  hero,
}: HeroCommittentiProps) {
  const mv = useMotionSafe();
  const sezioneRef = useRef<HTMLElement>(null);

  /* --------------------------------------------------------------------- *
   * ORCHESTRAZIONE
   * I contenitori memorizzano le proprie varianti: `v()` di useMotionSafe
   * mette in cache per identità dell'oggetto, e un nuovo oggetto a ogni render
   * farebbe rivedere a Framer un set di varianti diverso ogni volta.
   * --------------------------------------------------------------------- */

  const variantiColonna = useMemo(() => stagger(STAGGER_COLONNA, DELAY_COLONNA), []);

  /* --------------------------------------------------------------------- *
   * PARALLASSE
   * Gli hook girano sempre (regole degli hook); con reduced motion NON viene
   * applicato lo `style`, quindi nessun valore di scroll tocca il layout.
   * Corsa massima PARALLAX_MAX, sempre filtrata da SCROLL_SPRING.
   * --------------------------------------------------------------------- */

  const { scrollYProgress } = useScroll({
    target: sezioneRef,
    offset: ["start start", "end start"],
  });

  const fotoYGrezzo = useTransform(scrollYProgress, [0, 1], [0, PARALLAX_MAX]);
  const fotoY = useSpring(fotoYGrezzo, SCROLL_SPRING);

  const testoYGrezzo = useTransform(scrollYProgress, [0, 1], [0, PARALLAX_TESTO]);
  const testoY = useSpring(testoYGrezzo, SCROLL_SPRING);
  const testoOpacita = useTransform(scrollYProgress, [0, 1], [1, OPACITA_TESTO_FINE]);

  const stileFoto = mv.reduced ? undefined : { y: fotoY };
  const stileTesto = mv.reduced ? undefined : { y: testoY, opacity: testoOpacita };

  return (
    <MotionConfig reducedMotion="user">
      <section
        ref={sezioneRef}
        id="home-hero"
        aria-labelledby="home-hero-title"
        className="relative min-h-[100svh] scroll-mt-28 overflow-hidden bg-background pt-32 pb-20"
      >
        {/* 1 — FOTO DI SCENA. Decorativa: tutta l'informazione è nel testo.
            Sotto lg fa da sfondo a tutta la sezione, in opacità ridotta. */}
        {hero && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 z-0 w-full overflow-hidden lg:w-[55%]"
          >
            {/* Sborda di 96px sopra e sotto: più della corsa della parallasse
                (PARALLAX_MAX = 80px), così traslando non scopre mai il fondo. */}
            <motion.div
              className="absolute inset-x-0 -inset-y-24"
              style={stileFoto}
              initial={mv.reduced ? { opacity: 0 } : { opacity: 0, scale: 1.08 }}
              animate={mv.reduced ? { opacity: 1 } : { opacity: 1, scale: 1 }}
              transition={
                mv.reduced ? { duration: DUR_REDUCED } : { duration: DUR_FOTO, ease: EASE }
              }
            >
              <img
                src={hero.src}
                srcSet={hero.srcset}
                sizes="(min-width: 1024px) 55vw, 100vw"
                alt=""
                width={hero.width ?? FOTO_W}
                height={hero.height ?? FOTO_H}
                loading="eager"
                fetchPriority="high"
                decoding="async"
                className="h-full w-full object-cover object-[50%_30%] opacity-40 outline-none lg:opacity-100"
              />
            </motion.div>
          </div>
        )}

        {/* 2 — SCRIM SOLIDO: il testo poggia sempre qui, mai sulla foto nuda. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 bg-background/72 lg:hidden"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 hidden bg-linear-to-r from-background via-background/85 to-transparent lg:block"
        />

        {/* 3 — SALDATURA DEL BORDO INFERIORE verso la sezione successiva.
            Fascia dedicata e densa: la foto sborda sotto la sezione per la
            parallasse, quindi la sfumatura dell'immagine da sola non basta. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-72 bg-linear-to-t from-background from-15% via-background/75 to-transparent"
        />

        {/* 4 — BLOB: oro in alto a sinistra, rosso sipario in basso a destra.
            Il rosso #c2273d qui è solo superficie sfocata, mai testo né bordo. */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <div className="absolute -top-[20%] -left-[10%] h-[60%] w-[60%] rounded-full bg-primary/10 blur-[140px]" />
          <div className="absolute -right-[10%] -bottom-[20%] h-[50%] w-[50%] rounded-full bg-[#c2273d]/18 blur-[160px]" />
        </div>

        <div className="relative z-10 container mx-auto px-4 md:px-8 lg:px-12">
          {/* Wrapper della parallasse, separato dal contenitore delle varianti:
              così `style` e `variants` non si contendono mai l'opacità. */}
          <motion.div className="max-w-2xl" style={stileTesto}>
            <motion.div
              variants={mv.v(variantiColonna)}
              initial="hidden"
              animate="show"
              className="flex flex-col items-start"
            >
              {/* OCCHIELLO con filetto oro */}
              <motion.p
                variants={mv.v(fadeUp)}
                className="flex items-center gap-4 text-[11px] font-bold tracking-[0.25em] text-primary uppercase md:text-xs"
              >
                <span aria-hidden="true" className="h-px w-10 shrink-0 bg-primary/40" />
                <span>{OCCHIELLO}</span>
              </motion.p>

              {/* H1 — unico h1 della pagina. Testo normale che va a capo da sé:
                  niente maschera per parola, che tagliava i corsivi e spezzava
                  le righe in modo innaturale. */}
              <motion.h1
                id="home-hero-title"
                variants={mv.v(fadeUp)}
                className="mt-6 w-full font-serif text-[clamp(2.5rem,5.5vw,5.5rem)] leading-[1.02] font-bold tracking-[-0.02em] text-foreground"
              >
                {showCountLabel} {TITOLO_CODA.join(" ")}{" "}
                <span className="text-primary italic">
                  {TITOLO_ACCENTO.join(" ")}
                </span>
              </motion.h1>

              {/* SOTTOTITOLO */}
              <motion.p
                variants={mv.v(fadeUp)}
                className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl"
              >
                {SOTTOTITOLO}
              </motion.p>

              {/* AZIONI */}
              <motion.div
                variants={mv.v(fadeUp)}
                className="mt-8 flex w-full flex-col gap-4 sm:flex-row sm:items-center"
              >
                <motion.a
                  href="#contatti"
                  whileHover={HOVER_BUTTON}
                  className="group/cta inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-primary px-14 text-base font-bold text-primary-foreground shadow-[0_8px_30px_rgba(212,162,76,0.22)] transition-[background-color,box-shadow,scale] duration-200 hover:bg-[#e8b44a] hover:shadow-[0_10px_40px_rgba(212,162,76,0.38)] active:scale-[0.96] md:px-16"
                >
                  Richiedi una data
                  <ArrowRight
                    aria-hidden="true"
                    className="h-5 w-5 transition-transform duration-200 group-hover/cta:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover/cta:translate-x-0"
                  />
                </motion.a>
                <motion.a
                  href="#repertorio"
                  whileHover={HOVER_BUTTON}
                  className="inline-flex min-h-14 items-center justify-center rounded-full px-9 text-base font-semibold text-muted-foreground shadow-[0_0_0_1px_rgba(255,255,255,0.1)] transition-[color,background-color,box-shadow,scale] duration-200 hover:bg-white/5 hover:text-foreground hover:shadow-[0_0_0_1px_rgba(255,255,255,0.16)] active:scale-[0.96]"
                >
                  Vedi il repertorio
                </motion.a>
              </motion.div>

              {/* RIGA TECNICA */}
              <motion.p
                variants={mv.v(fadeUp)}
                custom={DELAY_RIGA_TECNICA}
                className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground"
              >
                {RIGA_TECNICA.map((voce, i) => (
                  <Fragment key={voce}>
                    {i > 0 && (
                      <span aria-hidden="true" className="text-primary">
                        ·
                      </span>
                    )}
                    <span>{voce}</span>
                  </Fragment>
                ))}
              </motion.p>

            </motion.div>
          </motion.div>
        </div>

      </section>
    </MotionConfig>
  );
}
