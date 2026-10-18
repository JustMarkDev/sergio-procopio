import { useState } from "react";

interface Show {
  id: string;
  title: string;
  category: string;
  description: string;
  durata?: string;
  image?: {
    src: string;
    srcSet: string;
    width: number;
    height: number;
  };
}

interface Props {
  shows: Show[];
}

// The list drives the background: hovering or focusing a title brings its photo forward.
export default function FeaturedShows({ shows }: Props) {
  const [active, setActive] = useState(0);

  return (
    <section
      id="spettacoli"
      className="relative flex min-h-[max(34rem,58vw)] scroll-mt-16 flex-col justify-between gap-10 overflow-hidden py-14 lg:py-20"
    >
      <div className="absolute inset-0" aria-hidden="true">
        {shows.map(
          (show, index) =>
            show.image && (
              <img
                key={show.id}
                {...show.image}
                sizes="100vw"
                alt=""
                loading="lazy"
                decoding="async"
                className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
                  index === active ? "opacity-100" : "opacity-0"
                }`}
              />
            ),
        )}
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--background)_4%,rgb(7_10_17/0.55)_55%,rgb(7_10_17/0.15)),linear-gradient(to_top,var(--background),transparent_24%),linear-gradient(to_bottom,var(--background),transparent_20%)]" />

      <div className="container relative mx-auto px-4 md:px-8 lg:px-12">
        <h2 className="text-xs font-medium uppercase tracking-[0.24em] text-primary-soft">
          Gli spettacoli
        </h2>
        <ul className="mt-8">
          {shows.map((show, index) => (
            <li key={show.id}>
              <a
                href={`/spettacoli/${show.id}`}
                onMouseEnter={() => setActive(index)}
                onFocus={() => setActive(index)}
                aria-current={index === active ? "true" : undefined}
                className={`relative block py-1.5 text-[clamp(1.35rem,3.8vw,3.5rem)] uppercase leading-[1.05] tracking-[0.01em] transition-[color,padding] duration-300 before:absolute before:inset-y-2.5 before:left-0 before:w-[3px] before:origin-center before:bg-primary-hover before:transition-transform before:duration-300 hover:pl-5 focus-visible:pl-5 ${
                  index === active
                    ? "pl-5 text-foreground before:scale-y-100"
                    : "text-foreground/40 before:scale-y-0"
                }`}
              >
                {show.title}
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-8 min-h-[4.8em] max-w-[36ch] text-base font-light leading-relaxed text-foreground/85 lg:text-lg">
          {shows[active]?.description}
        </p>
        <a
          href="/spettacoli"
          className="mt-4 inline-block border-b border-primary-soft pb-1.5 text-xs font-medium uppercase tracking-[0.18em] text-primary-soft transition-colors hover:border-foreground hover:text-foreground"
        >
          Tutti gli spettacoli
        </a>
      </div>
    </section>
  );
}
