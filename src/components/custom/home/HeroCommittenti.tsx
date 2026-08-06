import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import {
  MotionConfig,
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  DUR_REDUCED,
  EASE,
  HOVER_BUTTON,
  MASK_WORD_STEP,
  PARALLAX_MAX,
  SCROLL_SPRING,
  fadeUp,
  maskWord,
  popIn,
  stagger,
  useMotionSafe,
} from "../../../lib/home-motion";

/**
 * HERO PER I COMMITTENTI — prima sezione della home, `client:load`.
 *
 * Nei primi tre secondi dice COSA si compra e A CHI parla il sito: enti che
 * programmano, non spettatori. Sostituisce HeroSection.tsx, che metteva il nome
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

const LABEL_CHIP = "Partite da qui:";

/** Slug neutro di ENTI: nel repertorio è il filtro «Tutti», qui non è un
 *  committente e non diventa una chip (ci pensa già «Vedi il repertorio»).
 *  Restano le cinque chip previste. */
const SLUG_NEUTRO = "tutti";

/**
 * Le chip dell'hero parlano al singolare — il committente ci si riconosce
 * («siamo un oratorio») — mentre i filtri del repertorio, che usano la stessa
 * ENTI, parlano al plurale. Stessa tassonomia, due registri: qui si sovrascrive
 * solo l'etichetta, chiavata sullo slug che arriva da props. Uno slug non
 * previsto stampa la label del catalogo, senza sparire dalla riga.
 */
const ETICHETTA_CHIP: Record<string, string> = {
  oratori: "Oratorio o parrocchia",
  scuole: "Scuola",
  teatri: "Teatro o Comune",
  alpini: "Gruppo alpini",
  feste: "Festa o sagra",
};

const RIGA_TECNICA = [
  "Durata da 1 ora",
  "età dichiarate da 3+ a 12+",
  "audio e luci inclusi",
  "un solo interlocutore",
];

const RIGA_CREDENZIALI = [
  "Vaticano 1989, davanti a Giovanni Paolo II",
  "Formazione alla scuola di Marcel Marceau",
  "Piccolo Teatro Studio di Milano, 2006",
  "Università Bocconi da oltre vent'anni",
];

/* ------------------------------------------------------------------------- *
 * TEMPI E MISURE DELLA SEZIONE
 * Easing, durate standard, spring e varianti stanno TUTTI in home-motion.ts:
 * qui restano solo i ritardi editoriali di questa sezione, passati via `custom`.
 * ------------------------------------------------------------------------- */

const STAGGER_COLONNA = 0.08;
const DELAY_COLONNA = 0.15;
const STAGGER_CHIP = 0.05;

const DELAY_RIGA_TECNICA = 0.7;
const DELAY_RIGA_CREDENZIALI = 0.85;
const DELAY_BADGE = 1;

/** Entrata della foto: valore prescritto per questa sola immagine, non un token. */
const DUR_FOTO = 1.4;

/** Corsa della parallasse del testo (verso l'alto) e opacità di fondo corsa. */
const PARALLAX_TESTO = -40;
const OPACITA_TESTO_FINE = 0.35;

/** Oltre questa quota di scroll l'indicatore in basso non serve più. */
const SOGLIA_INDICATORE = 40;

/** Ripiego per width/height della foto: servono solo come rapporto intrinseco,
 *  perché a dimensionarla è il CSS (`h-full w-full object-cover`). */
const FOTO_W = 1920;
const FOTO_H = 1280;

/* ------------------------------------------------------------------------- *
 * PROPS
 * ------------------------------------------------------------------------- */

export interface HeroEnte {
  slug: string;
  label: string;
  nota: string;
}

export interface HeroProssimaData {
  spettacolo: string;
  venue: string;
  city: string;
  dataLunga: string;
  orario: string | null;
  tipoEnte: string;
}

export interface HeroImmagine {
  src: string;
  srcset: string;
  /** Opzionali: se index.astro li passa, sostituiscono il rapporto di ripiego. */
  width?: number;
  height?: number;
}

/** Una parola dell'H1: `accento` la porta in corsivo oro, `coda` è la
 *  punteggiatura che resta fuori dal corsivo. */
interface ParolaTitolo {
  testo: string;
  accento: boolean;
  coda: string;
}

export interface HeroCommittentiProps {
  /** Numero dei titoli in lettere, da NUMERI_IT[shows.length]. Mai scritto a mano. */
  showCountLabel: string;
  /** ENTI di src/lib/home-catalogo.ts: genera le chip e i deep link al repertorio. */
  enti: HeroEnte[];
  /** Primo evento futuro già formattato. `null` = nessun badge, nessun ripiego. */
  prossimaData: HeroProssimaData | null;
  /** Foto di scena già passata da getImage(). `null` = hero senza foto, non si rompe. */
  hero: HeroImmagine | null;
}

export default function HeroCommittenti({
  showCountLabel,
  enti,
  prossimaData,
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
  const variantiTitolo = useMemo(() => stagger(MASK_WORD_STEP, 0), []);
  const variantiChip = useMemo(() => stagger(STAGGER_CHIP, 0), []);

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

  /* --------------------------------------------------------------------- *
   * INDICATORE DI SCROLL
   * `useMotionValueEvent` non re-renderizza a ogni frame: lo stato cambia una
   * volta sola e l'indicatore, una volta sparito, non torna. Il cleanup del
   * listener è a carico dell'hook, che lo rimuove allo smontaggio dell'isola.
   * --------------------------------------------------------------------- */

  const { scrollY } = useScroll();
  const [scorso, setScorso] = useState(false);

  useMotionValueEvent(scrollY, "change", (y: number) => {
    if (y > SOGLIA_INDICATORE) setScorso(true);
  });

  useEffect(() => {
    // Al mount la pagina può essere già scrollata (deep link, ritorno indietro,
    // rimontaggio imposto da ClientRouter): "change" non è ancora scattato.
    if (window.scrollY > SOGLIA_INDICATORE) setScorso(true);
  }, []);

  /* --------------------------------------------------------------------- *
   * TESTI DERIVATI DAI DATI
   * --------------------------------------------------------------------- */

  const righeTitolo = useMemo<ParolaTitolo[][]>(
    () => [
      [showCountLabel, ...TITOLO_CODA].map((testo) => ({ testo, accento: false, coda: "" })),
      TITOLO_ACCENTO.map((testo, i) => ({
        testo,
        accento: true,
        // Il punto finale sta fuori dalla porzione in corsivo oro.
        coda: i === TITOLO_ACCENTO.length - 1 ? "." : "",
      })),
    ],
    [showCountLabel],
  );

  const titoloCompleto = `${showCountLabel} ${TITOLO_CODA.join(" ")} ${TITOLO_ACCENTO.join(" ")}.`;

  const chip = useMemo(
    () =>
      enti
        .filter((ente) => ente.slug !== SLUG_NEUTRO)
        .map((ente) => ({ slug: ente.slug, label: ETICHETTA_CHIP[ente.slug] ?? ente.label })),
    [enti],
  );

  const testoBadge = prossimaData
    ? `Prossima data pubblica: ${prossimaData.dataLunga}` +
      `${prossimaData.orario ? `, ore ${prossimaData.orario}` : ""}` +
      ` — ${prossimaData.venue}, ${prossimaData.city}`
    : null;

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
          className="pointer-events-none absolute inset-0 z-0 bg-[#0b0a09]/72 lg:hidden"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 hidden bg-linear-to-r from-[#0b0a09] via-[#0b0a09]/85 to-transparent lg:block"
        />

        {/* 3 — SALDATURA DEL BORDO INFERIORE verso la sezione successiva. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 bg-linear-to-t from-[#0b0a09] via-transparent to-transparent"
        />

        {/* 4 — BLOB: oro in alto a sinistra, rosso sipario in basso a destra.
            Il rosso #c2273d qui è solo superficie sfocata, mai testo né bordo. */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <div className="absolute -top-[20%] -left-[10%] h-[60%] w-[60%] rounded-full bg-primary/10 blur-[140px]" />
          <div className="absolute -right-[10%] -bottom-[20%] h-[50%] w-[50%] rounded-full bg-[#c2273d]/18 blur-[160px]" />
        </div>

        {/* 5 — GRIGLIA FINE 32px con maschera radiale (idioma già in uso). */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-size-[32px_32px] mask-[radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"
        />

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

              {/* H1 — unico h1 della pagina, a maschera per parola.
                  Il testo accessibile è la riga intera in sr-only: le parole
                  animate sono aria-hidden, così nessuno screen reader legge
                  il titolo spezzato in dodici frammenti. */}
              <motion.h1
                id="home-hero-title"
                variants={mv.v(variantiTitolo)}
                className="mt-6 w-full font-serif text-[clamp(2.75rem,7vw,6.5rem)] leading-[0.88] font-bold tracking-[-0.02em] text-foreground"
              >
                <span className="sr-only">{titoloCompleto}</span>
                <span aria-hidden="true" className="block">
                  {righeTitolo.map((riga, indiceRiga) => (
                    <span key={indiceRiga} className="flex flex-wrap gap-x-[0.25em]">
                      {riga.map((parola, indiceParola) => (
                        <span
                          key={`${indiceRiga}-${indiceParola}`}
                          className="-mb-[0.16em] block overflow-hidden pb-[0.16em]"
                        >
                          <motion.span variants={mv.v(maskWord)} className="block">
                            {parola.accento ? (
                              <span className="text-primary italic">{parola.testo}</span>
                            ) : (
                              parola.testo
                            )}
                            {parola.coda}
                          </motion.span>
                        </span>
                      ))}
                    </span>
                  ))}
                </span>
              </motion.h1>

              {/* SOTTOTITOLO */}
              <motion.p
                variants={mv.v(fadeUp)}
                className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl"
              >
                {SOTTOTITOLO}
              </motion.p>

              {/* CHIP D'ENTE — il committente si autocolloca con un tocco e
                  arriva al repertorio già filtrato. Senza enti non si stampa
                  nemmeno l'etichetta: nessun invito che non porta da nessuna parte. */}
              {chip.length > 0 && (
                <motion.div variants={mv.v(variantiChip)} className="mt-8 w-full">
                  <motion.p
                    variants={mv.v(fadeUp)}
                    id="home-hero-chip-label"
                    className="text-sm text-muted-foreground"
                  >
                    {LABEL_CHIP}
                  </motion.p>
                  <ul aria-labelledby="home-hero-chip-label" className="mt-3 flex flex-wrap gap-2">
                    {chip.map((voce) => (
                      <motion.li key={voce.slug} variants={mv.v(popIn)} whileHover={HOVER_BUTTON}>
                        <a
                          href={`/?ente=${encodeURIComponent(voce.slug)}#repertorio`}
                          className="inline-flex min-h-11 items-center rounded-full border border-border bg-white/[0.04] px-4 text-sm text-muted-foreground transition-[color,border-color,background-color,scale] duration-200 hover:border-primary/50 hover:bg-white/[0.06] hover:text-foreground active:scale-[0.96]"
                        >
                          {voce.label}
                        </a>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              )}

              {/* AZIONI */}
              <motion.div
                variants={mv.v(fadeUp)}
                className="mt-8 flex w-full flex-col gap-4 sm:flex-row sm:items-center"
              >
                <motion.a
                  href="#contatti"
                  whileHover={HOVER_BUTTON}
                  className="inline-flex min-h-14 items-center justify-center rounded-full bg-primary px-9 text-base font-bold text-primary-foreground shadow-[0_8px_30px_rgba(212,162,76,0.22)] transition-[background-color,box-shadow,scale] duration-200 hover:bg-[#e8b44a] hover:shadow-[0_10px_40px_rgba(212,162,76,0.38)] active:scale-[0.96]"
                >
                  Richiedi una data
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

              {/* RIGA CREDENZIALI — statica, mai in scorrimento, mai troncata.
                  Solo testo: nessun logo istituzionale. */}
              <motion.p
                variants={mv.v(fadeUp)}
                custom={DELAY_RIGA_CREDENZIALI}
                className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-[11px] tracking-[0.2em] text-muted-foreground uppercase"
              >
                {RIGA_CREDENZIALI.map((voce, i) => (
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

              {/* BADGE PROSSIMA DATA — montato solo se il dato esiste: nessun
                  testo di ripiego, nessuna data inventata. È un <p>, non una
                  live region. Sotto le CTA su mobile, in alto a destra su lg. */}
              {testoBadge && (
                <motion.p
                  variants={mv.v(fadeUp)}
                  custom={DELAY_BADGE}
                  className="mt-8 inline-flex max-w-full items-center gap-2.5 rounded-full border border-primary/25 bg-primary/10 px-4 py-2 text-sm leading-snug text-foreground lg:order-first lg:mt-0 lg:mb-8 lg:self-end"
                >
                  {mv.reduced ? (
                    <span
                      aria-hidden="true"
                      className="size-2 shrink-0 rounded-full bg-primary"
                    />
                  ) : (
                    <motion.span
                      aria-hidden="true"
                      className="size-2 shrink-0 rounded-full bg-primary"
                      animate={{ opacity: [1, 0.4, 1], scale: [1, 1.3, 1] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    />
                  )}
                  <span>{testoBadge}</span>
                </motion.p>
              )}
            </motion.div>
          </motion.div>
        </div>

        {/* INDICATORE DI SCROLL — decorativo, sparisce al primo scroll e con
            reduced motion non viene proprio montato. */}
        {!mv.reduced && !scorso && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-8 z-10 flex justify-center"
          >
            <div className="relative h-14 w-px bg-border">
              <motion.span
                className="absolute top-0 left-1/2 -ml-1 block size-2 rounded-full bg-primary"
                animate={{ y: [0, 16, 0], opacity: [0, 1, 0] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
          </div>
        )}
      </section>
    </MotionConfig>
  );
}
