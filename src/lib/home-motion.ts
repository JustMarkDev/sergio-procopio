import { useMemo } from "react";
import { stagger as staggerDelay, useReducedMotion } from "framer-motion";
import type {
  BezierDefinition,
  SpringOptions,
  TargetAndTransition,
  Transition,
  UseInViewOptions,
  Variants,
  ViewportOptions,
} from "framer-motion";

/**
 * FONTE UNICA DEL MOVIMENTO DELLA HOME.
 *
 * Importato da HeroCommittenti, RepertorioCommittenti, PercheFidarsi,
 * DomandeCommittenti, BarraCtaMobile e dalla micro-isola Reveal.
 * Nessun componente ridefinisce easing, durate o varianti in locale.
 *
 * CONVENZIONE DEGLI STATI: tutte le varianti esportate usano le chiavi
 * "hidden" (stato di partenza) e "show" (stato finale).
 *   <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={VIEWPORT} />
 *
 * DELAY PER SINGOLO ELEMENTO: si passa via prop `custom`, non riscrivendo la transition.
 *   <motion.p variants={fadeUp} custom={0.7} />          // delay 0.7s
 *   <motion.span variants={maskWord} custom={i} />       // delay i * MASK_WORD_STEP
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

/** Count-up dei numeri di «Perché fidarsi». Fuori dalla scala perché è l'unica eccezione. */
export const DUR_COUNT = 1.4;

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

/** Unica eccezione con rimbalzo: i nodi della timeline di «Chi sono». */
export const SPRING_NODE: Transition = {
  type: "spring",
  duration: 0.5,
  bounce: 0.4,
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

/** Opzioni per `useInView(ref, ...)` quando serve la soglia e non le varianti. */
export function inViewOnce(amount: UseInViewOptions["amount"] = 0.4): UseInViewOptions {
  return { once: true, amount };
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
 * Entrata di un blocco intero. È fadeUp sotto un nome parlante: la usa
 * Reveal.tsx per le tre sezioni Astro statiche, che entrano come un pezzo solo.
 */
export const reveal: Variants = fadeUp;

/** Passo del mask reveal dell'H1 dell'hero, per parola. */
export const MASK_WORD_STEP = 0.055;

/**
 * Mask reveal per parola o per riga. Va dentro un `<span class="block overflow-hidden">`.
 * `custom` = indice della parola (il delay è indice × MASK_WORD_STEP).
 * Unico stagger per parola ammesso in tutta la home.
 */
export const maskWord: Variants = {
  hidden: { y: "110%" },
  show: (index?: number) => ({
    y: 0,
    transition: withDelay(
      { duration: DUR.lg, ease: EASE },
      typeof index === "number" ? index * MASK_WORD_STEP : undefined,
    ),
  }),
};

/** Filo o regola orizzontale che si disegna. Richiede la classe `origin-left`. */
export const lineX: Variants = {
  hidden: { scaleX: 0 },
  show: (delay?: number) => ({
    scaleX: 1,
    transition: withDelay({ duration: DUR.md, ease: EASE }, delay),
  }),
};

/** Barra verticale che si disegna dall'alto. Richiede la classe `origin-top`. */
export const lineY: Variants = {
  hidden: { scaleY: 0 },
  show: (delay?: number) => ({
    scaleY: 1,
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
