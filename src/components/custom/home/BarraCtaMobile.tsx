import { useCallback, useEffect, useState } from "react";
import { Phone } from "lucide-react";
import { MotionConfig, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { DUR_REDUCED, SPRING, TAP, useMotionSafe } from "../../../lib/home-motion";

/**
 * BARRA CTA PERSISTENTE — overlay fisso, solo sotto lg.
 *
 * Non è una sezione nel flusso: si monta in index.astro come ULTIMO elemento,
 * dopo ChiusuraContatti, con `client:idle`. MAI dentro Header.tsx, che ha
 * `transition:persist` e la duplicherebbe a ogni navigazione.
 *
 * Compare oltre l'80% dell'altezza del viewport (proxy dell'hero) e si ritira
 * quando `#contatti` entra in viewport, così non raddoppia mai il CTA della
 * chiusura né copre il footer.
 */

/** Proxy dell'altezza dell'hero: oltre questa quota di viewport la barra entra. */
const SOGLIA_HERO = 0.8;

/** Ancora della chiusura della home (id emesso da ChiusuraContatti.astro).
 *  Serve solo all'observer: il bottone qui sotto porta alla pagina /contatti. */
const ID_CONTATTI = "contatti";

/** Quota di `#contatti` visibile che fa ritirare la barra. */
const SOGLIA_CONTATTI = 0.05;

/** Classi condivise dalle due azioni: stessa altezza di tocco, stessa larghezza. */
const AZIONE_BASE =
  "flex min-h-11 flex-1 items-center justify-center rounded-full px-1 " +
  "text-[clamp(0.6875rem,3vw,0.875rem)] font-bold";

export interface BarraCtaMobileProps {
  // Volutamente vuota: la barra non riceve nessun dato da index.astro.
  // Il numero di telefono è lo stesso già pubblicato in ContactForm.tsx e Footer.astro.
}

export default function BarraCtaMobile(_props: BarraCtaMobileProps) {
  const { reduced } = useMotionSafe();

  const [oltreHero, setOltreHero] = useState(false);
  const [contattiInVista, setContattiInVista] = useState(false);

  const visibile = oltreHero && !contattiInVista;

  /* --------------------------------------------------------------------- *
   * COMPARSA LEGATA ALLO SCROLL
   * `useMotionValueEvent` non re-renderizza a ogni frame: aggiorna uno stato
   * booleano, che cambia solo due volte per pagina.
   * --------------------------------------------------------------------- */

  const { scrollY } = useScroll();

  const valutaScroll = useCallback((y: number) => {
    setOltreHero(y > window.innerHeight * SOGLIA_HERO);
  }, []);

  useMotionValueEvent(scrollY, "change", valutaScroll);

  useEffect(() => {
    // Al mount la pagina può essere già scrollata (deep link, ritorno indietro,
    // rimontaggio imposto da ClientRouter): "change" non è ancora scattato.
    valutaScroll(window.scrollY);

    // window.innerHeight cambia con la rotazione e con la barra del browser mobile.
    const suResize = () => valutaScroll(window.scrollY);
    window.addEventListener("resize", suResize, { passive: true });

    return () => window.removeEventListener("resize", suResize);
  }, [valutaScroll]);

  /* --------------------------------------------------------------------- *
   * RIENTRO SU #contatti
   * --------------------------------------------------------------------- */

  useEffect(() => {
    let observer: IntersectionObserver | null = null;

    const collega = () => {
      observer?.disconnect();
      observer = null;
      setContattiInVista(false);

      const bersaglio = document.getElementById(ID_CONTATTI);

      // Difensivo: senza #contatti nel DOM l'observer non viene registrato
      // e la barra resta visibile. In home non può accadere.
      if (!bersaglio) return;

      observer = new IntersectionObserver(
        (entries) => {
          // `boundingClientRect.top < 0` copre il caso in cui i contatti sono
          // già stati superati: il footer è più alto di un viewport mobile,
          // quindi senza questo la barra tornerebbe a coprirlo a fine pagina.
          for (const entry of entries)
            setContattiInVista(
              entry.isIntersecting || entry.boundingClientRect.top < 0,
            );
        },
        {
          threshold: SOGLIA_CONTATTI,
          // Estende il root di 96px SOTTO il viewport: l'observer scatta un
          // attimo prima che la sezione entri e la barra si ritira senza mai
          // coprire il form (un margine negativo farebbe l'opposto).
          rootMargin: "0px 0px 96px 0px",
        },
      );

      observer.observe(bersaglio);
    };

    collega();
    document.addEventListener("astro:page-load", collega);

    return () => {
      document.removeEventListener("astro:page-load", collega);
      observer?.disconnect();
      observer = null;
    };
  }, []);

  /* --------------------------------------------------------------------- *
   * MOVIMENTO
   * `initial` è SOLO-TRANSFORM, come le ante del sipario: è lo stato servito
   * in SSR e senza JS il fallback noscript di Layout.astro riporterebbe in
   * scena qualunque `opacity:0` inline — qui resusciterebbe un overlay fisso
   * ma inerte (aria-hidden + inert) sopra il fondo pagina. Niente opacity:0
   * nello initial = il selettore non la matcha e la barra resta fuori scena;
   * l'opacità entra solo negli stati animati lato client.
   * Con reduced motion la barra entra ed esce in sola dissolvenza: `y` resta
   * inchiodato a "0%" così l'inline style renderizzato lato server viene
   * comunque azzerato all'idratazione e la barra non resta fuori schermo.
   * --------------------------------------------------------------------- */

  const statoNascosto = { opacity: 0, y: reduced ? "0%" : "140%" };
  const statoVisibile = { opacity: 1, y: "0%" };
  const transizione = reduced ? { duration: DUR_REDUCED } : SPRING;

  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        role="region"
        aria-label="Azioni rapide"
        aria-hidden={!visibile}
        inert={!visibile}
        initial={{ y: "140%" }}
        animate={visibile ? statoVisibile : statoNascosto}
        transition={transizione}
        className={`fixed inset-x-3 bottom-3 z-40 lg:hidden ${
          visibile ? "" : "pointer-events-none"
        }`}
      >
        <div className="flex min-h-14 items-center gap-2 rounded-[22px] bg-bar/80 p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-[0_14px_45px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.18)] backdrop-blur-2xl backdrop-saturate-150">
          <motion.a
            href="tel:+393805252684"
            whileTap={TAP}
            className={`${AZIONE_BASE} gap-1.5 border border-white/10 bg-white/[0.04] text-foreground transition-colors duration-200 hover:border-primary/50 hover:text-primary`}
          >
            <Phone size={15} aria-hidden="true" className="shrink-0" />
            <span>Chiama 380 5252684</span>
          </motion.a>

          <motion.a
            href="/contatti"
            whileTap={TAP}
            className={`${AZIONE_BASE} bg-primary-deep text-primary-foreground shadow-[0_8px_30px_rgba(232,72,63,0.22)] transition-[background-color,box-shadow] duration-200 hover:bg-primary-deep-hover hover:shadow-[0_10px_40px_rgba(232,72,63,0.38)]`}
          >
            Richiedi una data
          </motion.a>
        </div>
      </motion.div>
    </MotionConfig>
  );
}
