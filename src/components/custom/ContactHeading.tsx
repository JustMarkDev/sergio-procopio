import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";

const words = ["scuola", "parrocchia", "associazione"];

export default function ContactHeading() {
  const [index, setIndex] = useState(0);
  const heading = useRef<HTMLHeadingElement>(null);
  const inView = useInView(heading);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion || !inView) return;
    const interval = window.setInterval(() => {
      if (document.hidden) return;
      setIndex((current) => (current + 1) % words.length);
    }, 3000);
    return () => window.clearInterval(interval);
  }, [reducedMotion, inView]);

  return (
    <div>
    <h1
      ref={heading}
      className="font-serif text-[clamp(1.65rem,8vw,2rem)] font-bold leading-[1.18] tracking-tight text-zinc-50 lg:text-[34px] xl:text-[40px]"
    >
      <span className="sr-only">Porta l'emozione nella tua scuola, parrocchia o associazione.</span>
      <span aria-hidden="true">
        <span className="block">Porta l'emozione</span>
        <span className="flex items-baseline gap-[0.2em] whitespace-nowrap">
          nella tua
          <span className="relative inline-grid overflow-hidden pb-[0.15em] -mb-[0.15em] pr-[0.15em] italic text-blue-400">
            <span className="invisible col-start-1 row-start-1">associazione</span>
            <AnimatePresence initial={false} mode="wait">
              <motion.span
                key={words[index]}
                initial={{ opacity: 0, y: reducedMotion ? 0 : 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reducedMotion ? 0 : -12 }}
                transition={{ duration: reducedMotion ? 0 : 0.3 }}
                className="col-start-1 row-start-1"
              >
                {words[index]}
              </motion.span>
            </AnimatePresence>
          </span>
        </span>
      </span>
    </h1>
    </div>
  );
}
