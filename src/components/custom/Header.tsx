import { useEffect, useState } from "react";
import { ChevronDown, Globe, Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Biografia", href: "/biografia" },
  { name: "Spettacoli", href: "/spettacoli" },
  { name: "Calendario", href: "/calendario" },
  { name: "Galleria", href: "/galleria" },
  { name: "Contatti", href: "/contatti" },
];

/** Selettore lingua: per ora è solo interfaccia, il sito resta in italiano.
 *  Quando arriveranno le traduzioni, qui si aggancerà il cambio di locale. */
const LINGUE = [
  { codice: "IT", nome: "Italiano" },
  { codice: "EN", nome: "English" },
  { codice: "DE", nome: "Deutsch" },
  { codice: "ES", nome: "Español" },
  { codice: "PT", nome: "Português" },
  { codice: "FR", nome: "Français" },
];

/** Bandierine in SVG inline, disegnate qui: nessuna emoji, così la resa è
 *  identica e nitida su ogni sistema. Semplificate per leggere bene a 20px. */
function Bandiera({ codice }: { codice: string }) {
  const comune = {
    viewBox: "0 0 24 16",
    "aria-hidden": true as const,
    className:
      "h-[13px] w-5 shrink-0 rounded-[3px] shadow-[0_0_0_1px_rgba(255,255,255,0.18)]",
  };

  switch (codice) {
    case "IT":
      return (
        <svg {...comune}>
          <rect width="8" height="16" fill="#009246" />
          <rect x="8" width="8" height="16" fill="#f4f5f0" />
          <rect x="16" width="8" height="16" fill="#ce2b37" />
        </svg>
      );
    case "EN":
      return (
        <svg {...comune}>
          <rect width="24" height="16" fill="#012169" />
          <path d="M0 0 24 16M24 0 0 16" stroke="#fff" strokeWidth="3.2" />
          <path d="M0 0 24 16M24 0 0 16" stroke="#c8102e" strokeWidth="1.3" />
          <path d="M12 0v16M0 8h24" stroke="#fff" strokeWidth="5.2" />
          <path d="M12 0v16M0 8h24" stroke="#c8102e" strokeWidth="3" />
        </svg>
      );
    case "DE":
      return (
        <svg {...comune}>
          <rect width="24" height="5.33" fill="#1d1d1b" />
          <rect y="5.33" width="24" height="5.34" fill="#dd0000" />
          <rect y="10.67" width="24" height="5.33" fill="#ffce00" />
        </svg>
      );
    case "ES":
      return (
        <svg {...comune}>
          <rect width="24" height="16" fill="#aa151b" />
          <rect y="4" width="24" height="8" fill="#f1bf00" />
        </svg>
      );
    case "PT":
      return (
        <svg {...comune}>
          <rect width="24" height="16" fill="#da291c" />
          <rect width="9.6" height="16" fill="#046a38" />
          <circle cx="9.6" cy="8" r="3.1" fill="#ffe900" />
          <circle cx="9.6" cy="8" r="1.6" fill="#da291c" />
        </svg>
      );
    case "FR":
      return (
        <svg {...comune}>
          <rect width="8" height="16" fill="#0055a4" />
          <rect x="8" width="8" height="16" fill="#f4f5f0" />
          <rect x="16" width="8" height="16" fill="#ef4135" />
        </svg>
      );
    default:
      return null;
  }
}

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const [pathname, setPathname] = useState<string | null>(null);
  const [lingua, setLingua] = useState("IT");
  const [linguaAperta, setLinguaAperta] = useState(false);

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

  return (
    <motion.header
      initial={false}
      animate={{ y: isGalleryOpen ? "-120%" : "0%", opacity: isGalleryOpen ? 0 : 1 }}
      transition={{ type: "spring", duration: 0.4, bounce: 0 }}
      className="fixed inset-x-0 top-0 z-50 pt-2"
      aria-hidden={isGalleryOpen}
    >
      <div className="container mx-auto px-4 md:px-8 lg:px-12">
        <div
          className={`relative w-full rounded-[28px] p-2 transition-[background-color,box-shadow] duration-300 ${
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
                      {attivo && (
                        <span
                          aria-hidden="true"
                          className="absolute inset-x-4 bottom-1 h-0.5 rounded-full bg-primary"
                        />
                      )}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* SELETTORE LINGUA — solo interfaccia: non cambia ancora la lingua del sito. */}
          <div className="relative ml-auto hidden lg:block">
            <button
              type="button"
              onClick={() => setLinguaAperta(!linguaAperta)}
              aria-expanded={linguaAperta}
              aria-haspopup="listbox"
              aria-label="Cambia lingua"
              className="flex min-h-11 items-center gap-2 rounded-full px-3 text-sm font-bold text-white/90 transition-colors duration-200 hover:text-primary"
            >
              <Bandiera codice={lingua} />
              {lingua}
              <ChevronDown
                size={14}
                aria-hidden="true"
                className={`transition-transform duration-200 ${linguaAperta ? "rotate-180" : ""}`}
              />
            </button>

            <AnimatePresence>
              {linguaAperta && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setLinguaAperta(false)}
                  />
                  <motion.ul
                    role="listbox"
                    aria-label="Lingue disponibili"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 z-50 mt-2 w-44 overflow-hidden rounded-2xl border border-white/10 bg-bar/95 p-1.5 shadow-[0_18px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl"
                  >
                    {LINGUE.map((voce) => (
                      <li key={voce.codice}>
                        <button
                          type="button"
                          role="option"
                          aria-selected={lingua === voce.codice}
                          onClick={() => {
                            setLingua(voce.codice);
                            setLinguaAperta(false);
                          }}
                          className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors duration-150 ${
                            lingua === voce.codice
                              ? "bg-white/8 font-bold text-primary"
                              : "text-white/80 hover:bg-white/7 hover:text-white"
                          }`}
                        >
                          <Bandiera codice={voce.codice} />
                          {voce.nome}
                          <span className="ml-auto text-[10px] uppercase tracking-wider opacity-60">
                            {voce.codice}
                          </span>
                        </button>
                      </li>
                    ))}
                  </motion.ul>
                </>
              )}
            </AnimatePresence>
          </div>

          <a
            href="/contatti"
            className="ml-2 hidden min-h-11 shrink-0 items-center rounded-full bg-primary px-5 text-sm font-bold text-primary-foreground shadow-[0_6px_18px_rgba(212,162,76,0.34)] transition-[background-color,scale,box-shadow] duration-200 hover:bg-[#e8b44a] hover:shadow-[0_8px_24px_rgba(212,162,76,0.45)] active:scale-[0.96] lg:flex"
          >
            Richiedi una data
          </a>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="ml-auto grid size-11 place-items-center rounded-full text-white transition-[color,background-color,scale] duration-150 hover:bg-white/8 hover:text-primary active:scale-[0.96] lg:hidden"
            aria-label={isOpen ? "Chiudi menu" : "Apri menu"}
            aria-expanded={isOpen}
          >
            {isOpen ? <X size={23} /> : <Menu size={23} />}
          </button>
        </div>

        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.nav
              initial={{ opacity: 0, height: 0, y: -6 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -6 }}
              transition={{ type: "spring", duration: 0.3, bounce: 0 }}
              className="overflow-hidden lg:hidden"
              aria-label="Menu mobile"
            >
              <ul className="space-y-1 px-2 pb-2 pt-1">
                {navLinks.map((link) => {
                  const attivo = isActive(link.href);
                  return (
                    <li key={link.name}>
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
                    </li>
                  );
                })}
                {/* Lingue: solo interfaccia, il sito resta in italiano. */}
                <li className="flex flex-wrap items-center gap-2 px-4 pt-3">
                  <Globe size={16} aria-hidden="true" className="text-white/60" />
                  {LINGUE.map((voce) => (
                    <button
                      key={voce.codice}
                      type="button"
                      aria-pressed={lingua === voce.codice}
                      onClick={() => setLingua(voce.codice)}
                      className={`inline-flex min-h-9 items-center gap-2 rounded-full border px-3 text-xs font-bold transition-colors duration-150 ${
                        lingua === voce.codice
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-white/15 text-white/70 hover:border-primary/50 hover:text-white"
                      }`}
                    >
                      <Bandiera codice={voce.codice} />
                      {voce.codice}
                    </button>
                  ))}
                </li>
                <li className="pt-2">
                  <a
                    href="/contatti"
                    onClick={() => setIsOpen(false)}
                    className="flex min-h-12 items-center justify-center rounded-2xl bg-primary px-4 font-bold text-primary-foreground transition-[background-color,scale] duration-200 hover:bg-[#e8b44a] active:scale-[0.96]"
                  >
                    Richiedi una data
                  </a>
                </li>
              </ul>
            </motion.nav>
          )}
        </AnimatePresence>
        </div>
      </div>
    </motion.header>
  );
}
