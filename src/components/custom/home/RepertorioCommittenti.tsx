import { useEffect, useMemo, useState } from "react";
import {
  AnimatePresence,
  MotionConfig,
  animate,
  motion,
  useMotionValue,
  useTransform,
} from "framer-motion";
import type { Transition } from "framer-motion";
import { ArrowRight, Clock, SearchX } from "lucide-react";
import {
  DUR,
  DUR_REDUCED,
  EASE,
  EASE_SOFT,
  HOVER_CARD,
  SPRING_PILL,
  VIEWPORT,
  fadeUp,
  stagger,
  useMotionSafe,
  viewportAmount,
} from "../../../lib/home-motion";

/**
 * IL REPERTORIO — «Cosa posso portare nella vostra sala.»
 *
 * Isola client:visible. Un solo asse di filtro (tipo di ente): età e durata
 * restano badge, non filtri. Ogni card apre con il problema come lo racconta
 * chi telefona e risponde con «Perché funziona da voi».
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

export interface RepertorioEnte {
  slug: string;
  label: string;
  nota: string;
}

interface RepertorioCommittentiProps {
  shows: RepertorioShow[];
  enti: RepertorioEnte[];
  showCountLabel: string;
}

/* ------------------------------------------------------------------------- *
 * COPY DEL FILTRO
 * ------------------------------------------------------------------------- */

const SLUG_TUTTI = "tutti";

const NOTA_TUTTI =
  "Ogni scheda dichiara età consigliata, durata, regia e requisiti di sala.";

/**
 * Etichette e note vengono da ENTI (src/lib/home-catalogo.ts): fonte unica,
 * condivisa con le chip dell'hero. Qui si normalizza solo l'ordine — «Tutti»
 * sempre in testa e una volta sola, anche se ENTI lo dichiara già — e si
 * stende la rete di sicurezza sui campi vuoti.
 */
function vociFiltro(enti: RepertorioEnte[]): { slug: string; label: string; nota: string }[] {
  const tutti = enti.find((ente) => ente.slug === SLUG_TUTTI);

  return [
    {
      slug: SLUG_TUTTI,
      label: tutti?.label?.trim() ? tutti.label : "Tutti",
      nota: tutti?.nota?.trim() ? tutti.nota : NOTA_TUTTI,
    },
    ...enti
      .filter((ente) => ente.slug !== SLUG_TUTTI)
      .map((ente) => ({
        slug: ente.slug,
        label: ente.label,
        nota: ente.nota?.trim() ? ente.nota : NOTA_TUTTI,
      })),
  ];
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
  enti,
  showCountLabel,
}: RepertorioCommittentiProps) {
  const { reduced, v } = useMotionSafe();
  const [attivo, setAttivo] = useState<string>(SLUG_TUTTI);

  const filtri = useMemo(() => vociFiltro(enti), [enti]);
  const slugValidi = useMemo(() => new Set(filtri.map((voce) => voce.slug)), [filtri]);
  const staggerTesta = useMemo(() => stagger(0.05), []);

  const visibili = useMemo(
    () => (attivo === SLUG_TUTTI ? shows : shows.filter((show) => show.enti.includes(attivo))),
    [shows, attivo],
  );

  const totale = shows.length;
  const notaAttiva = filtri.find((voce) => voce.slug === attivo)?.nota ?? NOTA_TUTTI;

  /* Stato in querystring: si legge al mount e a ogni navigazione di ClientRouter. */
  useEffect(() => {
    const leggi = () => {
      const valore = new URLSearchParams(window.location.search).get("ente");
      setAttivo(valore && slugValidi.has(valore) ? valore : SLUG_TUTTI);
    };

    leggi();
    document.addEventListener("astro:page-load", leggi);

    return () => {
      document.removeEventListener("astro:page-load", leggi);
    };
  }, [slugValidi]);

  const applicaFiltro = (slug: string) => {
    setAttivo(slug);

    const url = new URL(window.location.href);
    if (slug === SLUG_TUTTI) url.searchParams.delete("ente");
    else url.searchParams.set("ente", slug);

    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  };

  /* Contatore: MotionValue, zero re-render. Con reduced motion salta al valore finale. */
  const conteggio = useMotionValue(visibili.length);
  const conteggioArrotondato = useTransform(conteggio, (valore) => Math.round(valore));

  useEffect(() => {
    if (reduced) {
      conteggio.set(visibili.length);
      return;
    }

    const controlli = animate(conteggio, visibili.length, {
      duration: DUR.sm,
      ease: EASE_SOFT,
    });

    return () => {
      controlli.stop();
    };
  }, [conteggio, reduced, visibili.length]);

  const transizioneCard = (indice: number): Transition =>
    reduced
      ? { duration: DUR_REDUCED }
      : { duration: DUR.sm, ease: EASE, delay: indice * 0.04 };

  /** Riflusso della griglia e uscita: senza il delay d'ingresso, che rallenterebbe il layout. */
  const transizioneBase: Transition = reduced
    ? { duration: DUR_REDUCED }
    : { duration: DUR.sm, ease: EASE };

  return (
    <MotionConfig reducedMotion="user">
      <section
        id="repertorio"
        aria-labelledby="repertorio-title"
        className="relative scroll-mt-28 overflow-hidden bg-background py-24 md:py-32"
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
              tutti senza parole. Dite da dove venite: vi mostro solo quello che ha senso per voi.
            </motion.p>

            <motion.div
              variants={v(fadeUp)}
              className="mt-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
            >
              <div
                role="group"
                aria-label="Filtra per tipo di ente"
                className="flex flex-wrap gap-2"
              >
                {filtri.map((voce) => {
                  const isAttivo = voce.slug === attivo;

                  return (
                    <button
                      key={voce.slug}
                      type="button"
                      aria-pressed={isAttivo}
                      onClick={() => applicaFiltro(voce.slug)}
                      className={`relative inline-flex min-h-11 items-center rounded-full border px-4 text-sm font-semibold transition-[color,border-color,scale] duration-200 active:scale-[0.96] ${
                        isAttivo
                          ? "border-primary text-primary-foreground"
                          : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                      }`}
                    >
                      {isAttivo && (
                        <motion.span
                          aria-hidden="true"
                          layoutId={reduced ? undefined : "repertorio-pill"}
                          transition={reduced ? { duration: 0 } : SPRING_PILL}
                          className="absolute inset-0 rounded-full bg-primary"
                        />
                      )}
                      <span className="relative z-10">{voce.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-4">
                <p
                  aria-hidden="true"
                  className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
                >
                  <motion.span className="tabular-nums text-foreground">
                    {conteggioArrotondato}
                  </motion.span>{" "}
                  di {totale} titoli
                </p>
                <p className="sr-only" aria-live="polite">
                  {visibili.length} di {totale} titoli
                </p>

                {attivo !== SLUG_TUTTI && (
                  <button
                    type="button"
                    onClick={() => applicaFiltro(SLUG_TUTTI)}
                    className="inline-flex min-h-11 items-center text-[11px] font-bold uppercase tracking-[0.2em] text-primary transition-[opacity,scale] duration-200 hover:opacity-80 active:scale-[0.96]"
                  >
                    Azzera
                  </button>
                )}
              </div>
            </motion.div>

            <motion.div variants={v(fadeUp)} className="mt-6">
              <AnimatePresence mode="wait" initial={false}>
                <motion.p
                  key={attivo}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{
                    duration: reduced ? DUR_REDUCED : DUR.xs,
                    ease: EASE_SOFT,
                  }}
                  className="max-w-[68ch] border-l-2 border-primary/40 pl-4 text-sm leading-relaxed text-muted-foreground"
                >
                  {notaAttiva}
                </motion.p>
              </AnimatePresence>
            </motion.div>
          </motion.div>

          {/* ---------------------------------------------------------------- *
           * Griglia dei titoli
           * ---------------------------------------------------------------- */}
          <div className="mt-12 grid grid-cols-1 gap-6 md:mt-16 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {visibili.map((show, indice) => {
                const inEvidenza = indice === 0;

                return (
                  <motion.article
                    key={show.id}
                    layout={reduced ? false : "position"}
                    initial={{ opacity: 0, y: 18, scale: 0.97 }}
                    whileInView={{
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      transition: transizioneCard(indice),
                    }}
                    exit={{ opacity: 0, scale: 0.98, transition: transizioneBase }}
                    viewport={VIEWPORT}
                    transition={transizioneBase}
                    whileHover={reduced ? undefined : HOVER_CARD}
                    className={`group flex flex-col overflow-hidden rounded-4xl border border-white/10 bg-[var(--card)] transition-[border-color,box-shadow] duration-500 hover:border-primary/50 hover:shadow-[0_0_30px_rgba(212,162,76,0.15)] ${
                      inEvidenza ? "lg:col-span-2" : ""
                    }`}
                  >
                    <div
                      className={`relative w-full shrink-0 overflow-hidden bg-secondary/20 ${
                        inEvidenza ? "aspect-16/9" : "aspect-4/3"
                      }`}
                    >
                      {show.img ? (
                        <img
                          src={show.img.src}
                          srcSet={show.img.srcset}
                          sizes={
                            inEvidenza
                              ? "(min-width: 1024px) 66vw, (min-width: 768px) 50vw, 100vw"
                              : "(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                          }
                          alt=""
                          width={show.img.width}
                          height={show.img.height}
                          loading="lazy"
                          decoding="async"
                          className="absolute inset-0 h-full w-full object-cover outline-none transition-transform duration-700 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                        />
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
                        className="absolute inset-0 z-10 bg-linear-to-t from-[#0b0a09] to-transparent"
                      />

                      <div className="absolute inset-x-4 top-4 z-20 flex flex-wrap items-start gap-2 sm:inset-x-6 sm:top-6">
                        {show.eta && (
                          <span className="rounded-full border border-white/10 bg-black/40 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-primary backdrop-blur-md">
                            {show.eta}
                          </span>
                        )}
                        {show.durata && (
                          <span className="ml-auto inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-white/10 bg-black/40 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white/80 backdrop-blur-md">
                            <Clock aria-hidden="true" className="h-3 w-3 text-primary" />
                            {show.durata}
                          </span>
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

                      {/* Il blocco che converte: sempre visibile, mai in hover. */}
                      <div className="mt-5 rounded-r-2xl border-l-2 border-primary/40 bg-white/[0.03] p-4">
                        <p className="font-serif text-lg italic leading-snug text-foreground/90">
                          «{senzaCaporali(show.problema)}»
                        </p>
                        <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.22em] text-primary">
                          Perché funziona da voi
                        </p>
                        <p className="mt-2 text-sm leading-relaxed text-foreground/85">
                          {show.perche}
                        </p>
                      </div>

                      <div className="mt-auto pt-6">
                        <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                          {show.regia ? `Regia ${show.regia} · Teatro Procopio` : "Teatro Procopio"}
                        </p>

                        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2">
                          <a
                            href={`/spettacoli/${show.id}`}
                            aria-label={`Scheda tecnica di ${show.title}`}
                            className="group/link inline-flex min-h-11 items-center gap-2 text-sm font-bold uppercase tracking-wider text-foreground shadow-[inset_0_-2px_0_rgba(212,162,76,0.3)] transition-[color,box-shadow,scale] duration-150 hover:text-primary hover:shadow-[inset_0_-2px_0_#d4a24c] active:scale-[0.96]"
                          >
                            Scheda tecnica
                            <ArrowRight
                              aria-hidden="true"
                              className="h-4 w-4 transition-transform duration-200 group-hover/link:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover/link:translate-x-0"
                            />
                          </a>

                          <a
                            href={`/contatti?spettacolo=${encodeURIComponent(show.id)}`}
                            aria-label={`Richiedi questo titolo: ${show.title}`}
                            className="inline-flex min-h-11 items-center rounded-full border border-white/10 px-4 text-sm font-semibold text-foreground transition-[color,border-color,scale] duration-200 hover:border-primary/50 hover:text-primary active:scale-[0.96]"
                          >
                            Richiedi questo titolo
                          </a>
                        </div>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </AnimatePresence>
          </div>

          {/* ---------------------------------------------------------------- *
           * Stato vuoto
           * ---------------------------------------------------------------- */}
          <AnimatePresence>
            {visibili.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={reduced ? { duration: DUR_REDUCED } : { duration: DUR.md, ease: EASE }}
                className="rounded-3xl border border-border bg-[var(--card)] p-10 text-center"
              >
                <motion.span
                  className="inline-flex"
                  animate={reduced ? undefined : { rotate: [0, 8, 0] }}
                  transition={{ duration: DUR.sm, ease: EASE_SOFT }}
                >
                  <SearchX aria-hidden="true" className="h-9 w-9 text-primary" />
                </motion.span>

                <p className="mx-auto mt-5 max-w-[52ch] text-base leading-relaxed text-muted-foreground">
                  Nessun titolo con questo filtro. Capita: certe serate si costruiscono su misura.
                  Scrivetemi che ente siete e cosa vi serve.
                </p>

                <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => applicaFiltro(SLUG_TUTTI)}
                    className="inline-flex min-h-11 items-center rounded-full border border-white/10 px-5 text-sm font-semibold text-foreground transition-[color,border-color,scale] duration-200 hover:border-primary/50 hover:text-primary active:scale-[0.96]"
                  >
                    Azzera il filtro
                  </button>

                  <a
                    href="#contatti"
                    className="inline-flex min-h-11 items-center rounded-full bg-primary px-6 text-sm font-bold text-primary-foreground shadow-[0_8px_30px_rgba(212,162,76,0.22)] transition-[box-shadow,scale] duration-200 hover:shadow-[0_10px_40px_rgba(212,162,76,0.38)] active:scale-[0.96]"
                  >
                    Scrivimi
                  </a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ---------------------------------------------------------------- *
           * Chiusura di sezione
           * ---------------------------------------------------------------- */}
          <motion.div
            variants={v(fadeUp)}
            initial="hidden"
            whileInView="show"
            viewport={VIEWPORT}
            className="mt-16 flex flex-col gap-4 border-t border-border pt-8 md:mt-20 md:flex-row md:items-center md:justify-between"
          >
            <p className="max-w-[68ch] text-base leading-relaxed text-muted-foreground">
              «Le vacanze di Henry», sullo sterminio e sulla memoria, è in preparazione:
              chiedetemelo se vi serve per il Giorno della Memoria.
            </p>

            <a
              href="/spettacoli"
              className="group/tutti inline-flex min-h-11 shrink-0 items-center gap-2 text-sm font-bold uppercase tracking-wider text-foreground shadow-[inset_0_-2px_0_rgba(212,162,76,0.3)] transition-[color,box-shadow,scale] duration-150 hover:text-primary hover:shadow-[inset_0_-2px_0_#d4a24c] active:scale-[0.96]"
            >
              Vedi tutte le schede tecniche
              <ArrowRight
                aria-hidden="true"
                className="h-4 w-4 transition-transform duration-200 group-hover/tutti:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover/tutti:translate-x-0"
              />
            </a>
          </motion.div>
        </div>
      </section>
    </MotionConfig>
  );
}
