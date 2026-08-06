import { useEffect, useRef } from "react";
import {
  MotionConfig,
  animate,
  motion,
  useInView,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";

import {
  DUR_COUNT,
  EASE,
  SCROLL_SPRING,
  VIEWPORT,
  fadeUp,
  inViewOnce,
  lineX,
  lineY,
  stagger,
  useMotionSafe,
} from "../../../lib/home-motion";

/**
 * PERCHÉ FIDARSI — tre numeri, sei credenziali, una testimonianza.
 *
 * Serve al committente per convincere qualcun altro: il consiglio pastorale,
 * il collegio docenti, il direttivo della sezione alpini.
 *
 * VINCOLO DI CONTENUTO: 1.800+ e 2.000+ restano separati e non si sommano mai
 * in «3.800+», perché quel valore non esiste in nessuna fonte del repository.
 * Nessun conteggio derivato, nessun logo istituzionale, nessuna attribuzione
 * inventata sulla testimonianza (la fonte è anonima: «Un dirigente scolastico»).
 */

/* ------------------------------------------------------------------------- *
 * CONTENUTO — copy editoriale verificato, hardcoded (vedi props nello spec)
 * ------------------------------------------------------------------------- */

// useGrouping:"always" è necessario: il default it-IT NON separa le migliaia
// a quattro cifre, quindi 1800 uscirebbe «1800» invece di «1.800».
const FORMATO_IT = new Intl.NumberFormat("it-IT", { useGrouping: "always" });

interface Numero {
  /** Valore finale del count-up. */
  readonly valore: number;
  /** Suffisso statico, mai animato. */
  readonly suffisso: string;
  /** Letto dagli screen reader al posto della cifra che cambia. */
  readonly etichettaSr: string;
  /** Riga di spiegazione sotto la cifra. */
  readonly testo: string;
}

const NUMERI: readonly Numero[] = [
  {
    valore: 1800,
    suffisso: "+",
    etichettaSr: "1.800 e oltre",
    testo: "rappresentazioni con I Barabba's Clown, dal 1977 al 1989",
  },
  {
    valore: 2000,
    suffisso: "+",
    etichettaSr: "2.000 e oltre",
    testo: "repliche con la Compagnia Teatrale Sergio Procopio, dal 1990",
  },
  {
    valore: 8,
    suffisso: "",
    etichettaSr: "8",
    testo:
      "paesi esteri: Belgio, Francia, Germania, Spagna, Svizzera, Madagascar, Brasile, Perù",
  },
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
const STAGGER_NUMERI = stagger(0.07);
const STAGGER_CREDENZIALI = stagger(0.07);

/* ------------------------------------------------------------------------- *
 * CIFRA — count-up con progressive enhancement
 * ------------------------------------------------------------------------- */

interface CifraProps {
  readonly valore: number;
  /**
   * true solo dopo l'idratazione, quando il blocco è in vista e l'utente non
   * ha chiesto meno movimento. Finché è false si stampa il valore finale:
   * così a JS spento, in SSR e con reduced motion non si legge mai zero.
   */
  readonly conta: boolean;
}

function Cifra({ valore, conta }: CifraProps) {
  const cifra = useMotionValue(0);
  const testo = useTransform(cifra, (v) => FORMATO_IT.format(Math.round(v)));

  useEffect(() => {
    if (!conta) return;

    cifra.set(0);
    const controlli = animate(cifra, valore, { duration: DUR_COUNT, ease: EASE });

    return () => controlli.stop();
  }, [cifra, conta, valore]);

  if (!conta) return <>{FORMATO_IT.format(valore)}</>;

  return <motion.span>{testo}</motion.span>;
}

/* ------------------------------------------------------------------------- *
 * BLOCCO NUMERI
 * ------------------------------------------------------------------------- */

function BloccoNumeri() {
  const { reduced, v } = useMotionSafe();
  const riferimento = useRef<HTMLDivElement>(null);
  const inVista = useInView(riferimento, inViewOnce(0.4));

  // In SSR e alla prima renderizzazione client `inVista` è false: il markup
  // idratato coincide con quello servito e le cifre partono già complete.
  const conta = inVista && !reduced;

  return (
    <motion.div
      ref={riferimento}
      variants={v(STAGGER_NUMERI)}
      initial="hidden"
      whileInView="show"
      viewport={VIEWPORT}
    >
      <div className="grid grid-cols-1 divide-y divide-border rounded-3xl border border-border bg-[var(--card)] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {NUMERI.map((numero, indice) => (
          <motion.div key={numero.etichettaSr} variants={v(fadeUp)} className="p-8">
            <motion.span
              aria-hidden="true"
              variants={v(lineX)}
              custom={indice * 0.08}
              className="mb-5 block h-0.5 w-6 origin-left bg-primary"
            />

            <p className="font-serif text-[clamp(2.5rem,5vw,4rem)] leading-none font-bold tabular-nums">
              <span
                aria-hidden="true"
                className="inline-block bg-linear-to-b from-[#e8b44a] to-[#c9a227] bg-clip-text text-transparent [-webkit-background-clip:text]"
              >
                <Cifra valore={numero.valore} conta={conta} />
                {numero.suffisso}
              </span>
              <span className="sr-only">{numero.etichettaSr}</span>
            </p>

            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {numero.testo}
            </p>
          </motion.div>
        ))}
      </div>

      <motion.p
        variants={v(fadeUp)}
        className="mt-6 max-w-[68ch] text-base leading-relaxed text-muted-foreground"
      >
        Nella vostra sala non ci sarà un debutto: è un repertorio provato davanti al
        pubblico migliaia di volte.
      </motion.p>
    </motion.div>
  );
}

/* ------------------------------------------------------------------------- *
 * TESTIMONIANZA
 * ------------------------------------------------------------------------- */

function Testimonianza() {
  const { reduced, v } = useMotionSafe();
  const riferimento = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: riferimento,
    offset: ["start end", "end start"],
  });
  // Parallasse contraria del glifo decorativo: 40px di corsa totale.
  const glifoGrezzo = useTransform(scrollYProgress, [0, 1], [20, -20]);
  const glifoY = useSpring(glifoGrezzo, SCROLL_SPRING);

  return (
    <motion.figure
      ref={riferimento}
      variants={v(fadeUp)}
      initial="hidden"
      whileInView="show"
      viewport={VIEWPORT}
      className="relative mt-16 max-w-4xl overflow-hidden rounded-3xl border border-border bg-[var(--card)] p-8 md:p-10"
    >
      {/* Barra sinistra: superficie decorativa in rosso sipario, nessuna informazione. */}
      <motion.span
        aria-hidden="true"
        variants={v(lineY)}
        className="pointer-events-none absolute inset-y-0 left-0 w-[3px] origin-top bg-[#c2273d]"
      />

      {/* Glifo virgolette: ornamento, non contenuto. */}
      <motion.span
        aria-hidden="true"
        style={reduced ? undefined : { y: glifoY }}
        className="pointer-events-none absolute top-2 left-4 font-serif text-[8rem] leading-none text-primary/10 select-none"
      >
        &ldquo;
      </motion.span>

      <div className="relative">
        <p className="mb-6 text-[11px] font-bold tracking-[0.2em] text-primary uppercase">
          Da chi l&apos;ha visto
        </p>

        <blockquote className="font-serif text-xl leading-relaxed text-foreground italic md:text-2xl">
          Come preside che ha assistito a molte repliche dello spettacolo, garantisco che
          al termine si coglie la crescita di sensibilità verso l&apos;eroismo degli
          alpini ma contemporaneamente dell&apos;assurdità della guerra.
        </blockquote>
      </div>

      {/* figcaption: ultimo figlio diretto di <figure>, come impone il modello di
          contenuto HTML. L'attribuzione resta quella della fonte, anonima. */}
      <figcaption className="relative mt-6">
        <span className="block text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
          Un dirigente scolastico, su «La Grande Guerra e il piccolo alpino»
        </span>
        <a
          href="/spettacoli/la-grande-guerra"
          className="mt-5 inline-flex min-h-11 items-center text-sm font-bold tracking-wider uppercase shadow-[inset_0_-2px_0_rgba(212,162,76,0.3)] transition-[color,box-shadow,scale] duration-150 hover:text-primary hover:shadow-[inset_0_-2px_0_#d4a24c] active:scale-[0.96]"
        >
          Vedi lo spettacolo
        </a>
      </figcaption>
    </motion.figure>
  );
}

/* ------------------------------------------------------------------------- *
 * SEZIONE
 * ------------------------------------------------------------------------- */

export interface PercheFidarsiProps {
  /**
   * Classi aggiuntive sul <section>. Unica prop, facoltativa: index.astro
   * monta l'isola senza passare nulla (`<PercheFidarsi client:visible />`).
   */
  readonly className?: string;
}

export default function PercheFidarsi({ className = "" }: PercheFidarsiProps) {
  const { v } = useMotionSafe();

  return (
    <MotionConfig reducedMotion="user">
      <section
        id="perche-fidarsi"
        aria-labelledby="perche-fidarsi-title"
        className={`relative scroll-mt-28 overflow-hidden bg-background py-24 md:py-32 ${className}`}
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

          <BloccoNumeri />

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

          <Testimonianza />
        </div>
      </section>
    </MotionConfig>
  );
}
