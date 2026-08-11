import { useEffect, useMemo, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import { MotionConfig, motion } from "framer-motion";
import { ArrowRight, Clock } from "lucide-react";
import {
  CARD_STEP,
  HOVER_CARD,
  TAP,
  VIEWPORT,
  cardIn,
  fadeUp,
  fotoTelaio,
  lineY,
  popIn,
  stagger,
  useMotionSafe,
  viewportAmount,
} from "../../../lib/home-motion";

/**
 * IL REPERTORIO — «Cosa posso portare nella vostra sala.»
 *
 * Isola client:visible. Vetrina dei tre titoli di punta: il repertorio
 * completo, con il filtro per tipo di ente, vive in /spettacoli. Ogni card
 * apre con il problema come lo racconta chi telefona.
 *
 * I dati arrivano tutti da index.astro, già risolti a build time
 * (ORDINE_HOME + CATALOGO_HOME + getImage): qui non si costruisce nessun
 * percorso immagine e non si scrive nessun conteggio a mano.
 */

/* ------------------------------------------------------------------------- *
 * PROPS
 * ------------------------------------------------------------------------- */

export interface RepertorioImmagine {
  src: string;
  /** `o.srcSet.attribute` di getImage(). */
  srcset: string;
  width: number;
  height: number;
}

export interface RepertorioShow {
  id: string;
  title: string;
  eta: string | null;
  durata: string | null;
  regia: string | null;
  tema: string;
  problema: string;
  perche: string;
  /** Slug degli enti per cui il titolo ha senso (da CATALOGO_HOME). */
  enti: string[];
  img: RepertorioImmagine | null;
}

interface RepertorioCommittentiProps {
  /** Già ridotti ai titoli di punta da index.astro (slice sui primi tre). */
  shows: RepertorioShow[];
  showCountLabel: string;
}

/** Il problema è già fra virgolette basse nel markup: evita il doppio caporale. */
function senzaCaporali(testo: string): string {
  return testo.replace(/^[\s«"]+/, "").replace(/[\s»"]+$/, "");
}

/* ------------------------------------------------------------------------- *
 * COMPONENTE
 * ------------------------------------------------------------------------- */

export default function RepertorioCommittenti({
  shows,
  showCountLabel,
}: RepertorioCommittentiProps) {
  const { reduced, v } = useMotionSafe();

  const staggerTesta = useMemo(() => stagger(0.05), []);

  // La griglia è multi-colonna solo da md in su: sotto md lo scroll fa già da
  // stagger, quindi il delay delle card resta 0.
  const [colonne, setColonne] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");
    setColonne(media.matches);

    const aggiorna = (evento: MediaQueryListEvent) => setColonne(evento.matches);
    media.addEventListener("change", aggiorna);
    return () => media.removeEventListener("change", aggiorna);
  }, []);

  /**
   * Luce di ribalta: l'occhio di bue segue il cursore aggiornando le due
   * custom property direttamente sul DOM della card (niente stato React,
   * zero re-render). Con reduced motion l'handler non viene proprio attaccato.
   */
  const gestisciLuceRibalta = (evento: ReactMouseEvent<HTMLElement>) => {
    const bordi = evento.currentTarget.getBoundingClientRect();
    evento.currentTarget.style.setProperty("--mx", `${evento.clientX - bordi.left}px`);
    evento.currentTarget.style.setProperty("--my", `${evento.clientY - bordi.top}px`);
  };

  return (
    <MotionConfig reducedMotion="user">
      <section
        id="repertorio"
        aria-labelledby="repertorio-title"
        className="relative scroll-mt-28 overflow-hidden bg-background-alt py-24 md:py-32"
      >
        {/* Alias per i link storici a #spettacoli: l'ancora non deve morire. */}
        <span id="spettacoli" aria-hidden="true" className="block scroll-mt-28" />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,162,76,0.05)_0%,transparent_70%)]"
        />

        <div className="container relative z-10 mx-auto px-4 md:px-8 lg:px-12">
          {/* ---------------------------------------------------------------- *
           * Testata: occhiello, titolo, lead, filtri, nota
           * ---------------------------------------------------------------- */}
          <motion.div
            variants={v(staggerTesta)}
            initial="hidden"
            whileInView="show"
            viewport={viewportAmount(0.2)}
          >
            <motion.div variants={v(fadeUp)} className="flex items-center gap-4">
              <span aria-hidden="true" className="h-px w-10 bg-primary/40" />
              <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-primary md:text-xs">
                Il repertorio
              </span>
            </motion.div>

            <motion.h2
              variants={v(fadeUp)}
              id="repertorio-title"
              className="mt-6 font-serif text-[clamp(2rem,4.2vw,3.5rem)] font-bold leading-[1.03] tracking-tight text-foreground"
            >
              Cosa posso portare nella{" "}
              <span className="italic text-primary">vostra sala</span>.
            </motion.h2>

            <motion.p
              variants={v(fadeUp)}
              className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl"
            >
              {showCountLabel} titoli pronti da programmare, tutti prodotti dal Teatro Procopio,
              tutti senza parole. Qui i tre più richiesti: il repertorio completo, con il filtro
              per tipo di ente, è nella pagina degli spettacoli.
            </motion.p>
          </motion.div>

          {/* ---------------------------------------------------------------- *
           * Griglia dei titoli
           * ---------------------------------------------------------------- */}
          <div className="mt-12 grid grid-cols-1 gap-6 md:mt-16 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
            {shows.map((show, indice) => {
                return (
                  <motion.article
                    key={show.id}
                    variants={v(cardIn)}
                    initial="hidden"
                    whileInView="show"
                    viewport={VIEWPORT}
                    custom={colonne ? indice * CARD_STEP : 0}
                    whileHover={reduced ? undefined : HOVER_CARD}
                    onMouseMove={reduced ? undefined : gestisciLuceRibalta}
                    className="group relative flex flex-col rounded-4xl border border-white/10 bg-[var(--card)] transition-[border-color] duration-500 hover:border-primary/50"
                  >
                    <div className="relative aspect-4/3 w-full shrink-0 overflow-hidden rounded-t-4xl bg-secondary/20">
                      {show.img ? (
                        /* La locandina scivola nel telaio: contro-movimento che
                         * eredita il trigger (e il delay) dalla card. L'hover CSS
                         * resta sull'img: il suo transform non è posseduto da Framer. */
                        <motion.div variants={v(fotoTelaio)} className="h-full w-full">
                          <img
                            src={show.img.src}
                            srcSet={show.img.srcset}
                            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                            alt=""
                            width={show.img.width}
                            height={show.img.height}
                            loading="lazy"
                            decoding="async"
                            className="absolute inset-0 h-full w-full object-cover outline-none transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                          />
                        </motion.div>
                      ) : (
                        <div
                          aria-hidden="true"
                          className="absolute inset-0 flex items-center justify-center"
                        >
                          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.1)_0%,transparent_100%)] opacity-20" />
                          <span className="relative px-6 text-center font-serif text-4xl font-bold leading-tight tracking-tighter text-white/5">
                            {show.title}
                          </span>
                        </div>
                      )}

                      <div
                        aria-hidden="true"
                        className="absolute inset-0 z-10 bg-linear-to-t from-background to-transparent"
                      />

                      <div className="absolute inset-x-4 top-4 z-20 flex flex-wrap items-start gap-2 sm:inset-x-6 sm:top-6">
                        {/* Cartellini di scena: si appendono subito dopo la locandina. */}
                        {show.eta && (
                          <motion.span
                            variants={v(popIn)}
                            custom={(colonne ? indice * CARD_STEP : 0) + 0.1}
                            className="rounded-full border border-white/10 bg-black/40 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-primary backdrop-blur-md"
                          >
                            {show.eta}
                          </motion.span>
                        )}
                        {show.durata && (
                          <motion.span
                            variants={v(popIn)}
                            custom={(colonne ? indice * CARD_STEP : 0) + 0.1}
                            className="ml-auto inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-white/10 bg-black/40 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white/80 backdrop-blur-md"
                          >
                            <Clock aria-hidden="true" className="h-3 w-3 text-primary" />
                            {show.durata}
                          </motion.span>
                        )}
                      </div>
                    </div>

                    <div className="relative z-20 flex grow flex-col p-6 md:p-7">
                      <h3 className="font-serif text-2xl font-bold leading-tight text-foreground transition-colors duration-300 group-hover:text-primary md:text-[1.75rem]">
                        {show.title}
                      </h3>

                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                        {show.tema}
                      </p>

                      {/* Il blocco che converte: sempre visibile, mai in hover.
                        * La barra oro si disegna dall'alto mentre il testo entra. */}
                      <div className="relative mt-5 rounded-r-2xl bg-white/[0.03] p-4">
                        <motion.span
                          aria-hidden="true"
                          variants={v(lineY)}
                          className="absolute inset-y-0 left-0 w-0.5 origin-top bg-primary/40"
                        />
                        <p className="font-serif text-lg italic leading-snug text-foreground/90">
                          «{senzaCaporali(show.problema)}»
                        </p>
                      </div>

                      <div className="mt-auto pt-6">
                        <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                          {show.regia ? `Regia ${show.regia} · Teatro Procopio` : "Teatro Procopio"}
                        </p>

                        <div className="mt-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
                          <motion.a
                            href={`/contatti?spettacolo=${encodeURIComponent(show.id)}`}
                            aria-label={`Richiedi questo titolo: ${show.title}`}
                            whileTap={TAP}
                            className="inline-flex min-h-11 items-center rounded-full bg-primary px-5 text-sm font-bold text-primary-foreground shadow-[0_6px_18px_rgba(212,162,76,0.3)] transition-[background-color,box-shadow] duration-200 hover:bg-[#e8b44a] hover:shadow-[0_8px_24px_rgba(212,162,76,0.42)]"
                          >
                            Richiedi questo titolo
                          </motion.a>

                          <a
                            href={`/spettacoli/${show.id}`}
                            aria-label={`Dettagli di ${show.title}`}
                            className="group/link inline-flex min-h-11 items-center gap-2 text-sm font-bold uppercase tracking-wider text-foreground shadow-[inset_0_-2px_0_rgba(212,162,76,0.3)] transition-[color,box-shadow] duration-150 hover:text-primary hover:shadow-[inset_0_-2px_0_#d4a24c]"
                          >
                            Dettagli
                            <ArrowRight
                              aria-hidden="true"
                              className="h-4 w-4 transition-transform duration-200 group-hover/link:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover/link:translate-x-0"
                            />
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Luce di ribalta: occhio di bue che segue il cursore
                      * (solo puntatori fini, coordinate via --mx/--my). */}
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-200 pointer-fine:group-hover:opacity-100 motion-reduce:transition-none"
                      style={{
                        background:
                          "radial-gradient(240px circle at var(--mx,50%) var(--my,50%), rgba(212,162,76,0.10), transparent 70%)",
                      }}
                    />

                    {/* Glow pre-dipinto: si accende in sola opacity, mai
                      * animando box-shadow (compositor-friendly). */}
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute -inset-px rounded-[inherit] shadow-[0_0_30px_rgba(212,162,76,0.15)] opacity-0 transition-opacity duration-500 group-hover:opacity-100 motion-reduce:transition-none"
                    />
                  </motion.article>
                );
              })}
          </div>

          {/* ---------------------------------------------------------------- *
           * Chiusura di sezione
           * ---------------------------------------------------------------- */}
          <motion.div
            variants={v(fadeUp)}
            initial="hidden"
            whileInView="show"
            viewport={VIEWPORT}
            className="mt-16 flex justify-center md:mt-20"
          >
            <motion.a
              href="/spettacoli"
              whileTap={TAP}
              className="group/tutti inline-flex min-h-14 shrink-0 items-center gap-3 rounded-full bg-primary px-10 text-base font-bold text-primary-foreground shadow-[0_8px_30px_rgba(212,162,76,0.22)] transition-[background-color,box-shadow] duration-200 hover:bg-[#e8b44a] hover:shadow-[0_10px_40px_rgba(212,162,76,0.38)] md:min-h-16 md:px-12 md:text-lg"
            >
              Vedi tutti gli spettacoli
              <ArrowRight
                aria-hidden="true"
                className="h-5 w-5 transition-transform duration-200 group-hover/tutti:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover/tutti:translate-x-0"
              />
            </motion.a>
          </motion.div>
        </div>
      </section>
    </MotionConfig>
  );
}
