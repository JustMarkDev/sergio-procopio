import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { VIEWPORT, fadeUp, useMotionSafe } from "../../../lib/home-motion";

export interface RevealProps {
  children: ReactNode;
  /** Ritardo in secondi, inoltrato alla variante via `custom`. */
  delay?: number;
  as?: "div" | "section";
  className?: string;
}

/**
 * Wrapper d'entrata usato dalle sezioni .astro (TrePassi, ComeSiOspita),
 * che non possono usare Framer Motion direttamente.
 * Con prefers-reduced-motion l'entrata collassa a una dissolvenza breve.
 */
export default function Reveal({
  children,
  delay,
  as = "div",
  className = "",
}: RevealProps) {
  const safe = useMotionSafe();
  const Component = as === "section" ? motion.section : motion.div;

  return (
    <Component
      className={className}
      variants={safe.v(fadeUp)}
      custom={delay}
      initial="hidden"
      whileInView="show"
      viewport={VIEWPORT}
    >
      {children}
    </Component>
  );
}
