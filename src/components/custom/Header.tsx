import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import {
  AnimatePresence,
  domAnimation,
  LazyMotion,
  m,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "framer-motion";

// "Contatti" lives in the call-to-action button.
const navLinks = [
  { name: "Biografia", href: "/biografia" },
  { name: "Spettacoli", href: "/spettacoli" },
  { name: "Corso", href: "/corso-di-teatro" },
  { name: "Calendario", href: "/calendario" },
  { name: "Galleria", href: "/galleria" },
];

export default function Header({ pathname: initialPathname }: { pathname: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
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
    const closeOnDesktop = () => {
      if (desktop.matches) setIsOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    desktop.addEventListener("change", closeOnDesktop);
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      desktop.removeEventListener("change", closeOnDesktop);
    };
  }, [isOpen]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

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
    <LazyMotion features={domAnimation} strict>
      <m.header
        initial={false}
        animate={{ y: isGalleryOpen ? "-120%" : "0%", opacity: isGalleryOpen ? 0 : 1 }}
        transition={{ type: "spring", duration: reducedMotion ? 0 : 0.4, bounce: 0 }}
        className="site-header fixed inset-x-0 top-0 z-50"
        aria-hidden={isGalleryOpen}
        inert={isGalleryOpen}
      >
        {/* Over the hero: a tall fade, so no edge shows. After scrolling: a solid bar with one hairline. */}
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-x-0 top-0 h-28 bg-linear-to-b from-background/80 via-background/30 to-transparent transition-opacity duration-300 ${
            showGlass ? "opacity-0" : "opacity-100"
          }`}
        />
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 border-b border-border bg-background/85 backdrop-blur-xl transition-opacity duration-300 ${
            showGlass ? "opacity-100" : "opacity-0"
          }`}
        />
        <div className="container relative mx-auto px-4 md:px-8 lg:px-12">
          <div className="flex h-[68px] items-center gap-6">
            <a
              href="/"
              className="mr-auto inline-flex min-h-11 items-center whitespace-nowrap text-[11px] font-medium uppercase tracking-[0.2em] text-foreground transition-opacity duration-200 hover:opacity-80"
            >
              Sergio Procopio
            </a>

            <nav className="hidden lg:block" aria-label="Navigazione principale">
              <ul className="flex items-center gap-7">
                {navLinks.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      aria-current={isActive(link.href) ? "page" : undefined}
                      className={`inline-flex min-h-11 items-center whitespace-nowrap text-[11px] font-medium uppercase tracking-[0.14em] transition-colors duration-200 hover:text-foreground ${
                        isActive(link.href) ? "text-primary-soft" : "text-foreground/65"
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
              className="hidden min-h-10 shrink-0 items-center whitespace-nowrap bg-primary px-5 text-[11px] font-medium uppercase tracking-[0.16em] text-primary-foreground transition-[background-color,scale] duration-200 hover:bg-primary-hover active:scale-[0.98] lg:inline-flex"
            >
              Richiedi una data
            </a>

            <button
              id="navigation-toggle"
              onClick={() => setIsOpen(!isOpen)}
              className="grid size-11 place-items-center text-foreground transition-colors duration-150 hover:text-primary-soft lg:hidden"
              aria-label={isOpen ? "Chiudi menu" : "Apri menu"}
              aria-expanded={isOpen}
              aria-controls="mobile-navigation"
            >
              {isOpen ? <X size={23} /> : <Menu size={23} />}
            </button>
          </div>

          <AnimatePresence initial={false}>
            {isOpen && (
              <m.nav
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ type: "spring", duration: reducedMotion ? 0 : 0.3, bounce: 0 }}
                className="max-h-[calc(100dvh-68px)] overflow-y-auto lg:hidden"
                id="mobile-navigation"
                aria-label="Menu mobile"
              >
                <ul className="pb-5 pt-1">
                  {navLinks.map((link) => (
                    <li key={link.name}>
                      <a
                        href={link.href}
                        aria-current={isActive(link.href) ? "page" : undefined}
                        onClick={() => setIsOpen(false)}
                        className={`flex min-h-12 items-center border-t border-border text-sm font-medium uppercase tracking-[0.14em] transition-colors duration-200 hover:text-foreground ${
                          isActive(link.href) ? "text-primary-soft" : "text-foreground/80"
                        }`}
                      >
                        {link.name}
                      </a>
                    </li>
                  ))}
                  <li className="pt-3">
                    <a
                      href="/contatti"
                      onClick={() => setIsOpen(false)}
                      className="flex min-h-12 items-center justify-center bg-primary px-4 text-xs font-medium uppercase tracking-[0.16em] text-primary-foreground transition-[background-color,scale] duration-200 hover:bg-primary-hover active:scale-[0.98]"
                    >
                      Richiedi una data
                    </a>
                  </li>
                </ul>
              </m.nav>
            )}
          </AnimatePresence>
        </div>
      </m.header>
    </LazyMotion>
  );
}
