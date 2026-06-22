import { motion } from "framer-motion";

interface Show {
  id: string;
  title: string;
  category: string;
  description: string;
  durata?: string;
  image?: string;
}

interface Props {
  shows: Show[];
}

function ShowImage({ src, alt }: { src: string; alt: string }) {
  return (
    <img
      src={src}
      alt={alt}
      loading="eager"
      fetchPriority="high"
      decoding="async"
      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
    />
  );
}

export default function FeaturedShows({ shows }: Props) {
  return (
    <section
      id="spettacoli"
      className="relative py-32 overflow-hidden bg-[#09090b]"
    >
      {/* Decorative Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.05)_0%,transparent_70%)] pointer-events-none"></div>

      <div className="container relative z-10 mx-auto px-4 md:px-8 lg:px-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <motion.h2
              initial={false}
              className="text-4xl md:text-6xl font-serif font-bold text-foreground"
            >
              Spettacoli in{" "}
              <span className="italic text-primary">Evidenza</span>
            </motion.h2>
          </div>
          <motion.div
            initial={false}
          >
            <a
              href="/spettacoli"
              className="inline-flex min-h-11 items-center text-sm font-bold uppercase tracking-wider shadow-[inset_0_-2px_0_rgba(37,99,235,0.3)] transition-[color,box-shadow,scale] duration-150 hover:text-primary hover:shadow-[inset_0_-2px_0_#2563eb] active:scale-[0.96]"
            >
              Vedi tutto il catalogo
            </a>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {shows.map((show) => (
            <a
              href={`/spettacoli/${show.id}`}
              key={show.id}
              className="group flex flex-col h-full relative bg-[#09090b] border border-white/10 rounded-4xl overflow-hidden transition-[transform,border-color,box-shadow] duration-500 hover:-translate-y-1 hover:border-primary/50 hover:shadow-[0_0_30px_rgba(37,99,235,0.15)] active:scale-[0.96]"
            >
              <div className="aspect-4/3 w-full bg-secondary/20 relative overflow-hidden flex items-center justify-center shrink-0">
                {show.image ? (
                  <ShowImage src={show.image} alt={show.title} />
                ) : (
                  <>
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.1)_0%,transparent_100%)]" />
                    <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 mix-blend-overlay" />
                    <h3 className="text-4xl font-serif font-bold text-white/5 group-hover:text-primary/20 transition-colors duration-500 px-6 text-center leading-tight tracking-tighter z-10 relative">
                      {show.title}
                    </h3>
                  </>
                )}
                <div className="absolute inset-0 bg-linear-to-t from-[#09090b] to-transparent z-10" />
                <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-start justify-between gap-2 sm:top-6 sm:left-6 sm:right-6">
                  <span className="max-w-full py-1 px-3 bg-black/40 backdrop-blur-md border border-white/10 rounded-full text-[10px] font-bold text-primary uppercase tracking-[0.16em] break-words sm:tracking-[0.2em]">
                    {show.category}
                  </span>
                  {show.durata && (
                    <span className="py-1.5 px-3 bg-black/40 backdrop-blur-md border border-white/10 rounded-full text-[10px] font-semibold text-white/80 uppercase tracking-widest inline-flex items-center gap-1.5 shadow-lg whitespace-nowrap">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-primary"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      {show.durata}
                    </span>
                  )}
                </div>
              </div>

              <div className="p-6 relative z-20 bg-[#09090b] flex flex-col grow justify-center">
                <h3 className="text-3xl font-bold font-serif text-foreground group-hover:text-primary transition-colors duration-300 leading-tight mb-4">
                  {show.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed opacity-80 line-clamp-3">
                  {show.description}
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
