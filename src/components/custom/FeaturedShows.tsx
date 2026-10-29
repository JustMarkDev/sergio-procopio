import { useCallback, useEffect, useRef, useState } from "react";

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

const AUTOPLAY_MS = 4500;

// The list drives the background: hovering or focusing a title brings its photo forward.
// Touch screens can't hover, so there the shows rotate on their own while the section is in view.
export default function FeaturedShows({ shows }: Props) {
  const [active, setActive] = useState(0);
  // Photos load on first hover, and stay hidden behind the current one until they have, so
  // the section fetches one photo instead of all of them.
  const [shown, setShown] = useState(0);
  const [wanted, setWanted] = useState(() => new Set([0]));
  const loaded = useRef(new Set([0]));
  const activeRef = useRef(0);
  const sectionRef = useRef<HTMLElement>(null);
  const [autoplay, setAutoplay] = useState(false);
  const [inView, setInView] = useState(false);

  // Hover devices fetch the other photos once the page is idle, so a hover is instant.
  useEffect(() => {
    if (!window.matchMedia("(hover: hover)").matches) return;
    const warm = () => setWanted(new Set(shows.keys()));
    if (!("requestIdleCallback" in window)) return void setTimeout(warm, 1500);
    const id = window.requestIdleCallback(warm, { timeout: 3000 });
    return () => window.cancelIdleCallback(id);
  }, [shows]);

  const select = useCallback((index: number) => {
    activeRef.current = index;
    setActive(index);
    setWanted((current) => (current.has(index) ? current : new Set(current).add(index)));
    if (loaded.current.has(index)) setShown(index);
  }, []);
  const markLoaded = (index: number) => {
    loaded.current.add(index);
    if (activeRef.current === index) setShown(index);
  };

  useEffect(() => {
    const touchOnly = window.matchMedia("(hover: none)").matches;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setAutoplay(touchOnly && !reducedMotion && shows.length > 1);
  }, [shows]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!autoplay || !section) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0.4,
    });
    observer.observe(section);
    return () => observer.disconnect();
  }, [autoplay]);

  // Restarting on every change of `active` also gives a tapped title a full interval.
  useEffect(() => {
    if (!autoplay || !inView) return;
    const next = (active + 1) % shows.length;
    // Fetch the photo after the next one now, so the crossfade never waits on the network.
    const afterNext = (next + 1) % shows.length;
    setWanted((current) => (current.has(afterNext) ? current : new Set(current).add(afterNext)));
    const id = setTimeout(() => select(next), AUTOPLAY_MS);
    return () => clearTimeout(id);
  }, [autoplay, inView, active, shows.length, select]);

  return (
    <section
      ref={sectionRef}
      id="spettacoli"
      className="relative flex min-h-[max(34rem,58vw)] scroll-mt-16 flex-col justify-between gap-10 overflow-hidden py-14 lg:py-20"
    >
      <div className="absolute inset-0" aria-hidden="true">
        {shows.map(
          (show, index) =>
            show.image &&
            wanted.has(index) && (
              <img
                key={show.id}
                onLoad={() => markLoaded(index)}
                {...show.image}
                sizes="100vw"
                alt=""
                loading={index === 0 ? "lazy" : "eager"}
                fetchPriority={index === 0 ? undefined : "low"}
                decoding="async"
                className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
                  index === shown ? "opacity-100" : "opacity-0"
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
                onMouseEnter={() => select(index)}
                onFocus={() => select(index)}
                aria-current={index === active ? "true" : undefined}
                className={`relative block py-1.5 text-[clamp(1.35rem,3.8vw,3.5rem)] uppercase leading-[1.05] tracking-[0.01em] transition-colors duration-300 before:absolute before:inset-y-2.5 before:left-0 before:w-[3px] before:bg-primary-hover before:transition-transform before:duration-300 ${
                  index === active
                    ? "text-foreground before:scale-y-100"
                    : "text-foreground/40 before:scale-y-0"
                }`}
              >
                {/* Only transforms move on hover, so nothing reflows. */}
                <span
                  className={`block transition-transform duration-300 ${index === active ? "translate-x-5" : ""}`}
                >
                  {show.title}
                </span>
              </a>
            </li>
          ))}
        </ul>
        {/* Every description shares one grid cell, so the block is always as tall as the longest. */}
        <div className="mt-8 grid max-w-[36ch] text-base font-light leading-relaxed text-foreground/85 lg:text-lg">
          {shows.map((show, index) => (
            <p
              key={show.id}
              aria-hidden={index !== active}
              className={`col-start-1 row-start-1 transition-opacity duration-300 ${
                index === active ? "opacity-100" : "opacity-0"
              }`}
            >
              {show.description}
            </p>
          ))}
        </div>
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
