interface Props {
  image: { src: string; srcSet: string; width: number; height: number };
}

export default function HeroSection({ image }: Props) {
  return (
    <section className="relative flex min-h-[min(900px,100svh)] items-center overflow-hidden bg-background pb-16 lg:pt-28">
      <div className="pointer-events-none absolute left-[18%] top-0 h-[480px] w-[122%] mask-[linear-gradient(to_right,transparent,black_24%)] sm:h-[560px] lg:left-[36%] lg:h-full lg:w-[82%]" aria-hidden="true">
        <img
          src={image.src}
          srcSet={image.srcSet}
          sizes="(min-width: 1024px) 82vw, 122vw"
          width={image.width}
          height={image.height}
          alt=""
          loading="eager"
          fetchPriority="high"
          decoding="async"
          className="h-full w-full mask-[linear-gradient(to_top,transparent,black_25%)] object-cover object-[28%_center] outline-none"
        />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(9,9,11,0.1)_0%,rgba(9,9,11,0.15)_25%,#09090b_60%)] lg:bg-[linear-gradient(to_right,#09090b_0%,rgba(9,9,11,0.98)_25%,rgba(9,9,11,0.7)_43%,rgba(9,9,11,0.12)_70%,transparent_100%)]" />
      <div className="pointer-events-none absolute inset-0 hidden bg-[linear-gradient(to_top,#09090b_0%,transparent_25%,transparent_80%,rgba(9,9,11,0.25)_100%)] lg:block" />

      <div className="container relative mx-auto px-4 pt-64 text-left md:px-8 sm:pt-72 lg:px-12 lg:pt-0">
        <div className="max-w-xl lg:max-w-[55%]">
          <h1 className="mb-6 font-serif text-6xl font-bold leading-[0.95] tracking-tighter text-foreground sm:text-8xl lg:text-[clamp(6rem,9vw,9rem)]">
            Sergio<br />
            <span className="inline-block pb-[0.12em] pr-[0.12em] italic text-primary">Procopio</span>
          </h1>
          <p className="max-w-md font-serif text-xl italic leading-relaxed text-zinc-200 lg:text-2xl">
            "L'arte del comico senza parole al servizio dell'educazione e delle emozioni."
          </p>
          <p className="mt-5 max-w-md text-base leading-relaxed text-zinc-300">
            Spettacoli di teatro educativo e pantomima per scuole, parrocchie,
            associazioni, teatri e famiglie.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a href="/contatti" className="inline-flex min-h-14 items-center justify-center whitespace-nowrap rounded-full bg-primary px-7 text-base font-bold text-primary-foreground transition-[background-color,transform] hover:bg-blue-700 active:scale-[0.98]">
              Richiedi una data
            </a>
            <a href="#spettacoli" className="inline-flex min-h-14 items-center justify-center whitespace-nowrap rounded-full border border-white/25 bg-background/30 px-7 text-base font-semibold text-zinc-200 transition-[background-color,transform] hover:bg-white/10 active:scale-[0.98]">
              Scopri gli spettacoli
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
