import { useMemo } from "react";
import { stagger as staggerDelay, useReducedMotion } from "framer-motion";
import type {
  BezierDefinition,
  SpringOptions,
  TargetAndTransition,
  Transition,
  Variants,
  ViewportOptions,
} from "framer-motion";

/**
 * FONTE UNICA DEL MOVIMENTO DELLA HOME.
 *
 * Importato da HeroCommittenti, RepertorioCommittenti, PercheFidarsi,
 * BarraCtaMobile, Header, ContactForm e dalla micro-isola Reveal.
 * Nessun componente ridefinisce easing, durate o varianti in locale.
 *
 * CONVENZIONE DEGLI STATI: tutte le varianti esportate usano le chiavi
 * "hidden" (stato di partenza) e "show" (stato finale).
 *   <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={VIEWPORT} />
 *
 * DELAY PER SINGOLO ELEMENTO: si passa via prop `custom`, non riscrivendo la transition.
 *   <motion.p variants={fadeUp} custom={0.7} />          // delay 0.7s
 *   <motion.span variants={maskRiga} custom={0.18} />    // delay 0.18s
 */

/* ------------------------------------------------------------------------- *
 * EASING
 * ------------------------------------------------------------------------- */

/** Entrate e rivelazioni. */
export const EASE: BezierDefinition = [0.16, 1, 0.3, 1];

/** Aperture e cambi di stato (accordion, crossfade dei filtri). */
export const EASE_SOFT: BezierDefinition = [0.22, 1, 0.36, 1];

/* ------------------------------------------------------------------------- *
 * DURATE (secondi)
 * ------------------------------------------------------------------------- */

/**
 * xs = micro (hover, rotazioni icona) · sm = cambi di stato · md = entrate
 * standard · lg = mask reveal dei titoli. Niente sopra 1.6s in tutta la home.
 */
export const DUR = {
  xs: 0.25,
  sm: 0.35,
  md: 0.55,
  lg: 0.9,
} as const;

export type DurKey = keyof typeof DUR;

/** Unica durata ammessa con prefers-reduced-motion: la dissolvenza secca. */
export const DUR_REDUCED = 0.2;

/* ------------------------------------------------------------------------- *
 * SPRING
 * ------------------------------------------------------------------------- */

/** Hover, chip, pallini, icone. Bounce 0: il tono è professionale, non giocoso. */
export const SPRING: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 24,
  bounce: 0,
};

/** Pillola oro del filtro del repertorio (layoutId). */
export const SPRING_PILL: Transition = {
  type: "spring",
  duration: 0.4,
  bounce: 0.15,
};

/**
 * Filtro obbligatorio di ogni parallasse: `useSpring(useTransform(...), SCROLL_SPRING)`.
 * Nessuna parallasse supera PARALLAX_MAX px di corsa totale.
 */
export const SCROLL_SPRING: SpringOptions = {
  stiffness: 120,
  damping: 30,
  mass: 0.4,
};

/** Corsa massima, in px, di qualunque parallasse della home. */
export const PARALLAX_MAX = 80;

/* ------------------------------------------------------------------------- *
 * TRIGGER DI VIEWPORT
 * ------------------------------------------------------------------------- */

/**
 * Configurazione standard di `whileInView`. Tutto ciò che sta sotto la piega
 * la usa: `once: true` perché ClientRouter rimonta le isole a ogni navigazione
 * e un'entrata che riparte da capo ogni volta è fastidiosa.
 */
export const VIEWPORT: ViewportOptions = {
  once: true,
  amount: 0.25,
  margin: "-60px",
};

/** VIEWPORT con una soglia diversa (griglie fitte, blocchi molto alti). */
export function viewportAmount(amount: ViewportOptions["amount"]): ViewportOptions {
  return { ...VIEWPORT, amount };
}

/* ------------------------------------------------------------------------- *
 * VARIANTI CONDIVISE
 * ------------------------------------------------------------------------- */

/**
 * Aggiunge `delay` alla transition solo se è arrivato un numero via `custom`.
 *
 * NOTA TECNICA DIRIMENTE: Framer Motion compone il delay di orchestrazione così:
 * `{ delay: delayDaStagger, ...transitionDellaVariante }`. Se la variante
 * dichiara sempre `delay` — anche `delay: 0` — sovrascrive il delay dello
 * stagger e ogni container perde lo scaglionamento. Per questo la chiave non
 * viene proprio scritta quando `custom` è assente.
 */
function withDelay(transition: Transition, delay?: number): Transition {
  return typeof delay === "number" ? { ...transition, delay } : transition;
}

/** Entrata standard: opacity 0→1 con y 20→0. `custom` = delay in secondi. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: (delay?: number) => ({
    opacity: 1,
    y: 0,
    transition: withDelay({ duration: DUR.md, ease: EASE }, delay),
  }),
};

/**
 * Filo o regola orizzontale che si disegna. Richiede la classe `origin-left`.
 * opacity nello hidden: così il fallback noscript di Layout.astro copre anche
 * i fili usati fuori da un parent opaco; il filo sfuma mentre si disegna,
 * differenza invisibile.
 */
export const lineX: Variants = {
  hidden: { scaleX: 0, opacity: 0 },
  show: (delay?: number) => ({
    scaleX: 1,
    opacity: 1,
    transition: withDelay({ duration: DUR.md, ease: EASE }, delay),
  }),
};

/**
 * Barra verticale che si disegna dall'alto. Richiede la classe `origin-top`.
 * opacity nello hidden: così il fallback noscript di Layout.astro copre anche
 * i fili usati fuori da un parent opaco; il filo sfuma mentre si disegna,
 * differenza invisibile.
 */
export const lineY: Variants = {
  hidden: { scaleY: 0, opacity: 0 },
  show: (delay?: number) => ({
    scaleY: 1,
    opacity: 1,
    transition: withDelay({ duration: DUR.sm, ease: EASE }, delay),
  }),
};

/** Comparsa breve e compatta: chip, badge, pannelli piccoli. `custom` = delay. */
export const popIn: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: (delay?: number) => ({
    opacity: 1,
    y: 0,
    transition: withDelay(SPRING, delay),
  }),
};

/**
 * Container che scagliona i figli. I figli devono usare una delle varianti
 * qui sopra e NON devono ricevere `custom`, altrimenti il loro delay
 * sovrascrive quello dello stagger.
 *
 * @param each  intervallo fra un figlio e il successivo (griglie fitte 0.05, elenchi 0.06–0.08)
 * @param delay ritardo prima del primo figlio
 */
export function stagger(each = 0.07, delay = 0.05): Variants {
  return {
    hidden: {},
    show: {
      transition: { delayChildren: staggerDelay(each, { startDelay: delay }) },
    },
  };
}

/**
 * La pausa della battuta: il tempo comico come firma. Ovunque un titolo abbia
 * una parte corsiva/oro, quella entra un battito dopo il setup. Si compone via
 * `custom` o come passo di stagger(PAUSA_BATTUTA, 0).
 */
export const PAUSA_BATTUTA = 0.18;

/**
 * Passo dello stagger delle card del repertorio: delay = indice × CARD_STEP,
 * solo da md in su (sotto md lo scroll fa già da stagger).
 */
export const CARD_STEP = 0.04;

/**
 * Mask reveal PER RIGA dei titoli. Va dentro
 * `<span class="block overflow-hidden pb-[0.12em] -mb-[0.12em]">`
 * (il padding salva i discendenti dei corsivi).
 * `custom` = delay in SECONDI (non indice). Lo hidden include opacity:0:
 * così il fallback noscript di Layout.astro copre anche le righe dei titoli.
 */
export const maskRiga: Variants = {
  hidden: { y: "110%", opacity: 0 },
  show: (delay?: number) => ({
    y: 0,
    opacity: 1,
    transition: withDelay({ duration: DUR.lg, ease: EASE }, delay),
  }),
};

/**
 * Le due ante del sipario dell'hero (decorative, aria-hidden, dentro un parent
 * overflow-hidden). `custom` = direzione ±1 (−1 anta sinistra, +1 anta destra).
 * UNICA variante con hidden solo-transform, DELIBERATA: in SSR le ante nascono
 * già fuori scena e senza JS il noscript non deve riportarle sul palco
 * (niente opacity:0 nello hidden = il selettore non le matcha). Con JS, il
 * primo keyframe le riporta chiuse istantaneamente, poi scorrono via e sfumano
 * in coda.
 */
export const anteSipario: Variants = {
  hidden: (dir: number = 1) => ({ x: `${dir * 112}%` }),
  show: (dir: number = 1) => ({
    opacity: [1, 1, 0],
    x: ["0%", `${dir * 112}%`, `${dir * 112}%`],
    transition: { duration: DUR.lg, ease: EASE, times: [0, 0.8, 1] },
  }),
};

/**
 * Entrata delle card del repertorio, nella convenzione a varianti (via i
 * target inline e il fallback reduced duplicato).
 * `custom` = delay in secondi (tipicamente indice × CARD_STEP).
 */
export const cardIn: Variants = {
  hidden: { opacity: 0, y: 18, scale: 0.97 },
  show: (delay?: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: withDelay({ duration: DUR.sm, ease: EASE }, delay),
  }),
};

/**
 * Contro-movimento dell'immagine dentro una cornice overflow-hidden: la
 * locandina scivola nel telaio mentre la card si posa. Eredita il trigger dal
 * motion parent (niente initial/whileInView propri).
 */
export const fotoTelaio: Variants = {
  hidden: { opacity: 0, y: "8%", scale: 1.06 },
  show: (delay?: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: withDelay({ duration: DUR.md, ease: EASE }, delay),
  }),
};

/**
 * Cambio di quinta direction-aware per il carosello. `custom` = direzione
 * (+1 avanti, −1 indietro), da passare SIA ad AnimatePresence SIA all'elemento.
 * 160 = SOGLIA_SWIPE_PX × 2 del carosello. Chiavi initial/show/exit per
 * AnimatePresence.
 */
export const quinta: Variants = {
  initial: (dir: number = 1) => ({ x: dir * 160, opacity: 0, scale: 0.98 }),
  show: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: { duration: DUR.md, ease: EASE },
  },
  exit: (dir: number = 1) => ({
    x: dir * -160,
    opacity: 0,
    scale: 0.98,
    transition: { duration: DUR.md, ease: EASE },
  }),
};

/**
 * Velo/gradiente decorativo che si accende PRIMA che entrino titolo ed
 * elementi: la sala si illumina. Per motion.div aria-hidden di sfondo.
 */
export const luceScena: Variants = {
  hidden: { opacity: 0, scale: 1.06 },
  show: (delay?: number) => ({
    opacity: 1,
    scale: 1,
    transition: withDelay({ duration: DUR.lg, ease: EASE }, delay),
  }),
};

/**
 * La battuta che sale in graticcia: parola/titolo rotante dentro
 * `<span class="block overflow-hidden">`. La parola vecchia esce salendo, la
 * nuova monta dalla ribalta. Chiavi initial/show/exit per AnimatePresence.
 */
export const battuta: Variants = {
  initial: { y: "110%", opacity: 0 },
  show: { y: 0, opacity: 1, transition: { duration: DUR.sm, ease: EASE } },
  exit: { y: "-110%", opacity: 0, transition: { duration: DUR.sm, ease: EASE } },
};

/* ------------------------------------------------------------------------- *
 * MICRO-INTERAZIONI (identiche a Header.tsx)
 * ------------------------------------------------------------------------- */

/** `whileHover` dei bottoni e dei link a pillola. */
export const HOVER_BUTTON: TargetAndTransition = { y: -2, transition: SPRING };

/** `whileHover` delle card con foto. Si accompagna a border-primary/50 + glow oro. */
export const HOVER_CARD: TargetAndTransition = { y: -6, transition: SPRING };

/** `whileTap` dove non basta `active:scale-[0.96]` in CSS. */
export const TAP: TargetAndTransition = { scale: 0.97 };

/* ------------------------------------------------------------------------- *
 * REDUCED MOTION
 * ------------------------------------------------------------------------- */

/**
 * Chiavi di variante trattate come stato «non visibile» quando si collassa
 * tutto a dissolvenza. Ogni altra chiave finisce a opacity 1.
 */
const OUT_STATES = new Set(["hidden", "exit", "closed", "collapsed", "initial"]);

function collapseToFade(variants: Variants): Variants {
  const collapsed: Variants = {};

  for (const key of Object.keys(variants)) {
    collapsed[key] = {
      opacity: OUT_STATES.has(key) ? 0 : 1,
      transition: { duration: DUR_REDUCED },
    };
  }

  return collapsed;
}

export interface MotionSafe {
  /** true quando l'utente ha chiesto meno movimento. */
  reduced: boolean;
  /**
   * Neutralizza una transition. Serve per ciò che `<MotionConfig reducedMotion="user">`
   * NON ferma, perché non è una trasformazione: height 0→auto dell'accordion,
   * clipPath, crossfade di stato. Con reduced motion ritorna `{ duration: 0 }`.
   */
  t: (transition?: Transition) => Transition;
  /**
   * Neutralizza un set di varianti: con reduced motion ogni stato collassa alla
   * sola opacità (0→1 in DUR_REDUCED), quindi il layout resta identico e nulla
   * resta invisibile. Senza reduced motion ritorna l'oggetto originale,
   * per identità referenziale.
   */
  v: (variants: Variants) => Variants;
}

/**
 * Spegne a mano ciò che MotionConfig non ferma. Da chiamare in ogni isola della
 * home, in aggiunta a `<MotionConfig reducedMotion="user">`, e da usare anche
 * come interruttore esplicito per le quattro cose che vanno proprio evitate:
 * layout animations (`layout={false}`), loop `repeat: Infinity` (non montati),
 * count-up (che parte già al valore finale) e parallassi (useTransform disattivato).
 */
export function useMotionSafe(): MotionSafe {
  const reduced = useReducedMotion() === true;

  return useMemo<MotionSafe>(() => {
    // Cache per input: `v()` deve restituire sempre lo stesso oggetto per la
    // stessa variante, altrimenti Framer rivede un set nuovo a ogni render.
    const cache = new WeakMap<Variants, Variants>();

    return {
      reduced,
      t: (transition?: Transition) => (reduced ? { duration: 0 } : (transition ?? {})),
      v: (variants: Variants) => {
        if (!reduced) return variants;

        const cached = cache.get(variants);
        if (cached) return cached;

        const collapsed = collapseToFade(variants);
        cache.set(variants, collapsed);
        return collapsed;
      },
    };
  }, [reduced]);
}
