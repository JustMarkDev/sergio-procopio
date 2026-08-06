import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Biografia", href: "/biografia" },
  { name: "Spettacoli", href: "/spettacoli" },
  { name: "Calendario", href: "/calendario" },
  { name: "Galleria", href: "/galleria" },
  { name: "Contatti", href: "/contatti" },
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
      className="fixed inset-x-0 top-0 z-50 pt-4 sm:pt-5"
      aria-hidden={isGalleryOpen}
    >
      <div className="container mx-auto px-4 md:px-8 lg:px-12">
        <div
          className={`relative w-full rounded-[28px] bg-zinc-950/45 p-2 shadow-[0_14px_45px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.18),inset_0_-1px_0_rgba(255,255,255,0.04)] backdrop-blur-2xl backdrop-saturate-150 transition-[background-color,box-shadow] duration-300 ${
          scrolled ? "bg-zinc-950/62 shadow-[0_18px_50px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.15),inset_0_-1px_0_rgba(255,255,255,0.04)]" : ""
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
              {navLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    onMouseEnter={() => setHoveredLink(link.name)}
                    onFocus={() => setHoveredLink(link.name)}
                    onBlur={() => setHoveredLink(null)}
                    className={`flex min-h-10 items-center px-4 text-[15px] font-bold transition-colors duration-200 ${
                      hoveredLink === null || hoveredLink === link.name
                        ? "text-white/90"
                        : "text-white/35"
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
            className="ml-auto hidden min-h-11 shrink-0 items-center rounded-full bg-primary px-5 text-sm font-bold text-primary-foreground shadow-[0_6px_18px_rgba(212,162,76,0.34)] transition-[background-color,scale,box-shadow] duration-200 hover:bg-[#e8b44a] hover:shadow-[0_8px_24px_rgba(212,162,76,0.45)] active:scale-[0.96] lg:flex"
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
                {navLinks.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className="flex min-h-12 items-center rounded-2xl px-4 text-base font-medium text-white/80 transition-colors duration-200 hover:bg-white/7 hover:text-white"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
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
