import { motion, useReducedMotion } from "framer-motion";

interface Props {
  image: { src: string; srcSet: string; width: number; height: number };
}

export default function HeroSection({ image }: Props) {
  const reducedMotion = useReducedMotion();
  // Text rises in one line at a time; the photo stays put so the LCP is untouched.
  const rise = (order: number) => ({
    initial: { opacity: 0, y: reducedMotion ? 0 : 20 },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: reducedMotion ? 0 : 0.8,
      delay: 0.1 + order * 0.12,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  });

  return (
    <section className="relative flex min-h-[min(900px,100svh)] items-end overflow-hidden pb-14 sm:pb-16 lg:pb-20">
      <div
        className="pointer-events-none absolute right-0 top-0 h-full w-full lg:w-[88%] mask-[linear-gradient(to_right,transparent,black_30%)]"
        aria-hidden="true"
      >
        <img
          src={image.src}
          srcSet={image.srcSet}
          sizes="(min-width: 1024px) 88vw, 100vw"
          width={image.width}
          height={image.height}
          alt=""
          loading="eager"
          fetchPriority="high"
          decoding="async"
          className="h-full w-full object-cover object-[62%_top] outline-none lg:object-[50%_top]"
        />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,var(--background)_0%,transparent_46%),linear-gradient(to_bottom,var(--background)_0%,transparent_22%)]" />

      <div className="container relative mx-auto px-4 md:px-8 lg:px-12">
        <motion.h1
          {...rise(0)}
          className="text-[clamp(2.75rem,9vw,8.75rem)] font-normal uppercase leading-[0.9] tracking-[0.005em]"
        >
          Sergio
          <br />
          Procopio
        </motion.h1>
        <motion.p
          {...rise(1)}
          className="mt-6 max-w-[34ch] text-lg font-light leading-relaxed text-foreground/85 lg:text-xl"
        >
          L'arte del comico senza parole al servizio dell'educazione e delle emozioni.
        </motion.p>
        <motion.div {...rise(2)} className="mt-8 flex flex-wrap items-center gap-3">
          <a
            href="/contatti"
            className="inline-flex min-h-12 items-center justify-center whitespace-nowrap border border-primary bg-primary px-7 text-xs font-medium uppercase tracking-[0.18em] text-primary-foreground transition-[background-color,border-color,scale] hover:border-primary-hover hover:bg-primary-hover active:scale-[0.98]"
          >
            Richiedi una data
          </a>
          <a
            href="#spettacoli"
            className="inline-flex min-h-12 items-center justify-center whitespace-nowrap border border-foreground/40 bg-background/40 px-7 text-xs font-medium uppercase tracking-[0.18em] text-foreground transition-[border-color,scale] hover:border-foreground active:scale-[0.98]"
          >
            Gli spettacoli
          </a>
        </motion.div>
      </div>
    </section>
  );
}
