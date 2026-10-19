import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  domAnimation,
  LazyMotion,
  m,
  useInView,
  useReducedMotion,
} from "framer-motion";

const words = ["scuola", "parrocchia", "associazione"];

export default function ContactHeading() {
  const [index, setIndex] = useState(0);
  const heading = useRef<HTMLHeadingElement>(null);
  const inView = useInView(heading);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion || !inView) return;
    let timeout: number;
    const schedule = (delay: number) => {
      timeout = window.setTimeout(() => {
        if (!document.hidden) setIndex((current) => (current + 1) % words.length);
        schedule(3000);
      }, delay);
    };
    schedule(1200);
    return () => window.clearTimeout(timeout);
  }, [reducedMotion, inView]);

  return (
    <LazyMotion features={domAnimation} strict>
      <div>
        <h1 ref={heading} className="text-[clamp(1.5rem,3vw,2.9rem)] uppercase leading-[0.98]">
          <span className="sr-only">
            Porta l'emozione nella tua scuola, parrocchia o associazione.
          </span>
          <span aria-hidden="true">
            <span className="block">Porta l'emozione</span>
            <span className="flex items-baseline gap-[0.2em] whitespace-nowrap">
              nella tua
              <span className="relative inline-grid overflow-hidden pb-[0.15em] -mb-[0.15em] pr-[0.15em] text-primary-soft">
                <span className="invisible col-start-1 row-start-1">associazione</span>
                <AnimatePresence initial={false} mode="wait">
                  <m.span
                    key={words[index]}
                    initial={{ opacity: 0, y: reducedMotion ? 0 : 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: reducedMotion ? 0 : -12 }}
                    transition={{ duration: reducedMotion ? 0 : 0.3 }}
                    className="col-start-1 row-start-1"
                  >
                    {words[index]}
                  </m.span>
                </AnimatePresence>
              </span>
            </span>
          </span>
        </h1>
      </div>
    </LazyMotion>
  );
}
