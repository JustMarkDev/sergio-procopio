import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { DUR, DUR_REDUCED, EASE, SPRING_PILL } from "../../lib/home-motion";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Biografia", href: "/biografia" },
  { name: "Spettacoli", href: "/spettacoli" },
  { name: "Calendario", href: "/calendario" },
  { name: "Galleria", href: "/galleria" },
  { name: "Contatti", href: "/contatti" },
];

interface Props {
  /**
   * Percorso della pagina servita in SSR (Astro.url.pathname da Layout.astro):
   * underline e aria-current esistono già nell'HTML servito, prima dell'idratazione.
   */
  pathname?: string;
}

export default function Header({ pathname: pathnameIniziale }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const [pathname, setPathname] = useState<string | null>(pathnameIniziale ?? null);

  // Gating manuale del movimento: niente MotionConfig reducedMotion="user"
  // qui, perché bloccherebbe anche la y funzionale del nascondimento lightbox.
  const reduced = useReducedMotion() === true;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // L'header persiste tra le navigazioni (transition:persist), quindi il
  // percorso attivo va riletto a ogni cambio pagina del ClientRouter.
  useEffect(() => {
    const aggiorna = () => setPathname(window.location.pathname);
    aggiorna();
    document.addEventListener("astro:page-load", aggiorna);
    return () => document.removeEventListener("astro:page-load", aggiorna);
  }, []);

  // "/" solo con corrispondenza esatta; le altre voci restano evidenziate
  // anche nelle sottopagine (es. /spettacoli/comico → Spettacoli).
  const isActive = (href: string) =>
    pathname !== null &&
    (href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(`${href}/`));

  useEffect(() => {
    const handleGalleryState = (event: Event) => {
      const { isOpen } = (event as CustomEvent<{ isOpen: boolean }>).detail;
      setIsGalleryOpen(isOpen);
      if (isOpen) setIsOpen(false);
    };

    window.addEventListener("gallery-lightbox-change", handleGalleryState);
    return () => window.removeEventListener("gallery-lightbox-change", handleGalleryState);
  }, []);

  // Cross-fade con quarto di giro dell'icona hamburger↔X;
  // con reduced solo dissolvenza, senza rotazione.
  const iconaToggle = {
    initial: reduced ? { opacity: 0 } : { opacity: 0, rotate: -90 },
    animate: reduced ? { opacity: 1 } : { opacity: 1, rotate: 0 },
    exit: reduced ? { opacity: 0 } : { opacity: 0, rotate: 90 },
    transition: reduced ? { duration: DUR_REDUCED } : { duration: DUR.xs, ease: EASE },
  };

  // Le voci del menu mobile calano a siparietto, una battuta dopo l'altra;
  // con reduced solo dissolvenza secca, senza scaglionamento.
  const voceMenu = (i: number) => ({
    initial: { opacity: 0, y: reduced ? 0 : -6 },
    animate: { opacity: 1, y: 0 },
    transition: reduced
      ? { duration: DUR_REDUCED }
      : { type: "spring" as const, duration: 0.3, bounce: 0, delay: i * 0.04 },
  });

  return (
    <motion.header
      initial={false}
      animate={{ y: isGalleryOpen ? "-120%" : "0%", opacity: isGalleryOpen ? 0 : 1 }}
      // Con reduced l'header si nasconde comunque (cambia il come, non il se):
      // la y salta secca fuori layout, anima solo l'opacità.
      transition={
        reduced
          ? { y: { duration: 0 }, opacity: { duration: DUR_REDUCED } }
          : { type: "spring", duration: 0.4, bounce: 0 }
      }
      className="fixed inset-x-0 top-0 z-50 pt-2"
      aria-hidden={isGalleryOpen}
      // inert accompagna sempre aria-hidden (stesso pattern di BarraCtaMobile):
      // link e bottoni escono anche dal tab order mentre l'header è nascosto.
      inert={isGalleryOpen}
    >
      <div className="container mx-auto px-4 md:px-8 lg:px-12">
        <div
          className={`relative w-full rounded-[28px] p-2 transition-[background-color,box-shadow,backdrop-filter] duration-300 ${
          scrolled || isOpen
            ? "bg-bar/62 shadow-[0_18px_50px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.15),inset_0_-1px_0_rgba(255,255,255,0.04)] backdrop-blur-2xl backdrop-saturate-150"
            : "bg-transparent"
        }`}
        >
        <div className="flex min-h-14 items-center gap-3 px-2 sm:px-3">
          <a
            href="/"
            className="flex min-h-11 w-12 shrink-0 items-center justify-center font-serif text-[24px] font-bold leading-none tracking-[-0.07em] text-white transition-[opacity,scale] duration-200 hover:opacity-80 active:scale-[0.96]"
            aria-label="Sergio Procopio, home"
          >
            <span aria-hidden="true">S<span className="text-primary">P</span></span>
          </a>

          <nav
            className="absolute left-1/2 hidden -translate-x-1/2 lg:block"
            onMouseLeave={() => setHoveredLink(null)}
            aria-label="Navigazione principale"
          >
            <ul className="flex items-center gap-1">
              {navLinks.map((link) => {
                const attivo = isActive(link.href);
                return (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      aria-current={attivo ? "page" : undefined}
                      onMouseEnter={() => setHoveredLink(link.name)}
                      onFocus={() => setHoveredLink(link.name)}
                      onBlur={() => setHoveredLink(null)}
                      className={`relative flex min-h-10 items-center px-4 text-[15px] font-bold transition-colors duration-200 ${
                        attivo
                          ? "text-primary"
                          : hoveredLink === null || hoveredLink === link.name
                            ? "text-white/90"
                            : "text-white/35"
                      }`}
                    >
                      {link.name}
                      {/* L'occhio di bue segue l'attore: l'header persiste tra le
                          navigazioni, quindi la lineetta oro scivola davvero dalla
                          voce vecchia alla nuova. Con reduced: salto secco, da policy. */}
                      {attivo &&
                        (reduced ? (
                          <span
                            aria-hidden="true"
                            className="absolute inset-x-4 bottom-1 h-0.5 rounded-full bg-primary"
                          />
                        ) : (
                          <motion.span
                            aria-hidden="true"
                            layoutId="occhio-di-bue"
                            transition={SPRING_PILL}
                            className="absolute inset-x-4 bottom-1 h-0.5 rounded-full bg-primary"
                          />
                        ))}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          <a
            href="/contatti"
            className="ml-auto hidden min-h-11 shrink-0 items-center rounded-full bg-primary px-5 text-sm font-bold text-primary-foreground shadow-[0_6px_18px_rgba(212,162,76,0.34)] transition-[background-color,scale,box-shadow] duration-200 hover:bg-[#e8b44a] hover:shadow-[0_8px_24px_rgba(212,162,76,0.45)] active:scale-[0.96] lg:flex"
          >
            Richiedi una data
          </a>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="relative ml-auto grid size-11 place-items-center rounded-full text-white transition-[color,background-color,scale] duration-150 hover:bg-white/8 hover:text-primary active:scale-[0.96] lg:hidden"
            aria-label={isOpen ? "Chiudi menu" : "Apri menu"}
            aria-expanded={isOpen}
          >
            <AnimatePresence mode="popLayout" initial={false}>
              {isOpen ? (
                <motion.span key="chiudi" className="grid place-items-center" {...iconaToggle}>
                  <X size={23} />
                </motion.span>
              ) : (
                <motion.span key="apri" className="grid place-items-center" {...iconaToggle}>
                  <Menu size={23} />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>

        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.nav
              initial={{ opacity: 0, height: 0, y: reduced ? 0 : -6 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: reduced ? 0 : -6 }}
              // Con reduced il pannello scatta secco — height 0→auto è proprio
              // il caso che MotionConfig non fermerebbe — e anima solo la dissolvenza.
              transition={
                reduced
                  ? { height: { duration: 0 }, opacity: { duration: DUR_REDUCED } }
                  : { type: "spring", duration: 0.3, bounce: 0 }
              }
              className="overflow-hidden lg:hidden"
              aria-label="Menu mobile"
            >
              <ul className="space-y-1 px-2 pb-2 pt-1">
                {navLinks.map((link, i) => {
                  const attivo = isActive(link.href);
                  return (
                    <motion.li key={link.name} {...voceMenu(i)}>
                      <a
                        href={link.href}
                        aria-current={attivo ? "page" : undefined}
                        onClick={() => setIsOpen(false)}
                        className={`flex min-h-12 items-center rounded-2xl px-4 text-base transition-colors duration-200 ${
                          attivo
                            ? "border-l-2 border-primary bg-white/7 font-bold text-primary"
                            : "font-medium text-white/80 hover:bg-white/7 hover:text-white"
                        }`}
                      >
                        {link.name}
                      </a>
                    </motion.li>
                  );
                })}
                <motion.li className="pt-2" {...voceMenu(navLinks.length)}>
                  <a
                    href="/contatti"
                    onClick={() => setIsOpen(false)}
                    className="flex min-h-12 items-center justify-center rounded-2xl bg-primary px-4 font-bold text-primary-foreground transition-[background-color,scale] duration-200 hover:bg-[#e8b44a] active:scale-[0.96]"
                  >
                    Richiedi una data
                  </a>
                </motion.li>
              </ul>
            </motion.nav>
          )}
        </AnimatePresence>
        </div>
      </div>
    </motion.header>
  );
}
