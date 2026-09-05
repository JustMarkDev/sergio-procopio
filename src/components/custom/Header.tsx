import { useEffect, useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from "framer-motion";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Biografia", href: "/biografia" },
  { name: "Spettacoli", href: "/spettacoli" },
  { name: "Calendario", href: "/calendario" },
  { name: "Galleria", href: "/galleria" },
  { name: "Contatti", href: "/contatti" },
];

export default function Header({ pathname: initialPathname }: { pathname: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const [pathname, setPathname] = useState(initialPathname);
  const reducedMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const showGlass = scrolled || isOpen;

  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 20));

  useEffect(() => {
    // The header persists across Astro navigations, including scroll restoration.
    const updatePage = () => {
      setPathname(window.location.pathname);
      setScrolled(window.scrollY > 20);
      setIsOpen(false);
      setHoveredLink(null);
    };
    updatePage();
    document.addEventListener("astro:page-load", updatePage);
    return () => document.removeEventListener("astro:page-load", updatePage);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setIsOpen(false);
      document.getElementById("navigation-toggle")?.focus();
    };
    const desktop = window.matchMedia("(min-width: 1024px)");
    const closeOnDesktop = () => { if (desktop.matches) setIsOpen(false); };
    document.addEventListener("keydown", closeOnEscape);
    desktop.addEventListener("change", closeOnDesktop);
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      desktop.removeEventListener("change", closeOnDesktop);
    };
  }, [isOpen]);

  const isActive = (href: string) => href === "/"
    ? pathname === "/"
    : pathname === href || pathname.startsWith(`${href}/`);

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
      transition={{ type: "spring", duration: reducedMotion ? 0 : 0.4, bounce: 0 }}
      className="site-header fixed inset-x-0 top-0 z-50 pt-4 sm:pt-5"
      data-glass={showGlass}
      aria-hidden={isGalleryOpen}
      inert={isGalleryOpen}
    >
      <div className="header-progressive-blur" aria-hidden="true">
        <span /><span /><span />
      </div>
      <div className="container relative mx-auto px-4 md:px-8 lg:px-12">
        <div className="relative w-full p-2">
        <div className="header-glass absolute inset-0 rounded-[28px] bg-zinc-950/62 shadow-[0_18px_50px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.15),inset_0_-1px_0_rgba(255,255,255,0.04)] backdrop-blur-2xl backdrop-saturate-150" aria-hidden="true" />
        <div className="relative flex min-h-14 items-center gap-3 px-2 sm:px-3 lg:grid lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
          <a
            href="/"
            className="flex min-h-11 w-12 shrink-0 items-center justify-center font-serif text-[24px] font-bold leading-none tracking-[-0.07em] text-white transition-[opacity,scale] duration-200 hover:opacity-80 active:scale-[0.96]"
            aria-label="SP, Sergio Procopio, home"
          >
            <span aria-hidden="true">S<span className="text-primary">P</span></span>
          </a>

          <nav
            className="hidden lg:block"
            onMouseLeave={() => setHoveredLink(null)}
            aria-label="Navigazione principale"
          >
            <ul className="flex items-center gap-1">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    aria-current={isActive(link.href) ? "page" : undefined}
                    onMouseEnter={() => setHoveredLink(link.name)}
                    onFocus={() => setHoveredLink(link.name)}
                    onBlur={() => setHoveredLink(null)}
                    className={`flex min-h-10 items-center whitespace-nowrap px-3 text-sm font-bold transition-colors duration-200 xl:px-4 xl:text-[15px] ${
                      isActive(link.href) ? "text-blue-400" : hoveredLink === null || hoveredLink === link.name
                        ? "text-white/90"
                        : "text-white/65"
                    }`}
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <a
            href="/contatti"
            className="ml-auto hidden min-h-11 shrink-0 items-center gap-2 whitespace-nowrap rounded-full bg-primary px-5 text-sm font-bold text-primary-foreground shadow-[0_6px_18px_rgba(37,99,235,0.34)] transition-[background-color,scale,box-shadow] duration-200 hover:bg-blue-700 hover:shadow-[0_8px_24px_rgba(37,99,235,0.45)] active:scale-[0.96] lg:flex"
          >
            Richiedi una data <ArrowUpRight size={17} aria-hidden="true" />
          </a>

          <button
            id="navigation-toggle"
            onClick={() => setIsOpen(!isOpen)}
            className="ml-auto grid size-11 place-items-center rounded-full text-white transition-[color,background-color,scale] duration-150 hover:bg-white/8 hover:text-primary active:scale-[0.96] lg:hidden"
            aria-label={isOpen ? "Chiudi menu" : "Apri menu"}
            aria-expanded={isOpen}
            aria-controls="mobile-navigation"
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
              transition={{ type: "spring", duration: reducedMotion ? 0 : 0.3, bounce: 0 }}
              className="relative max-h-[calc(100dvh-112px)] overflow-y-auto lg:hidden"
              id="mobile-navigation"
              aria-label="Menu mobile"
            >
              <ul className="space-y-1 px-2 pb-2 pt-1">
                {navLinks.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      aria-current={isActive(link.href) ? "page" : undefined}
                      onClick={() => setIsOpen(false)}
                      className={`flex min-h-12 items-center rounded-2xl px-4 text-base font-medium transition-colors duration-200 hover:bg-white/7 hover:text-white ${isActive(link.href) ? "bg-white/7 text-blue-400" : "text-white/80"}`}
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
                <li className="pt-2">
                  <a
                    href="/contatti"
                    onClick={() => setIsOpen(false)}
                    className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary px-4 font-bold text-primary-foreground transition-[background-color,scale] duration-200 hover:bg-blue-700 active:scale-[0.96]"
                  >
                    Richiedi una data <ArrowUpRight size={18} aria-hidden="true" />
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
