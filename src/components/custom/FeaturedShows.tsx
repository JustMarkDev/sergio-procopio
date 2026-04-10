import { motion } from "framer-motion";

interface Show {
  id: string;
  title: string;
  category: string;
  description: string;
  duration?: string;
  image?: string;
}

interface Props {
  shows: Show[];
}

export default function FeaturedShows({ shows }: Props) {
  return (
    <section
      id="spettacoli"
      className="relative py-32 overflow-hidden bg-[#09090b]"
    >
      {/* Decorative Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.05)_0%,transparent_70%)] pointer-events-none"></div>

      <div className="container relative z-10 mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-6">
          <div className="max-w-2xl">
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-primary font-bold tracking-[0.2em] text-[10px] uppercase mb-4 block"
            >
              Il Repertorio
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-6xl font-serif font-bold text-foreground"
            >
              Spettacoli in{" "}
              <span className="italic text-primary">Evidenza</span>
            </motion.h2>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <a
              href="/spettacoli"
              className="text-sm font-bold tracking-wider uppercase border-b-2 border-primary/30 pb-1 hover:border-primary transition-all"
            >
              Vedi tutto il catalogo
            </a>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {shows.map((show, index) => (
            <motion.a
              href={`/spettacoli/${show.id}`}
              key={show.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group flex flex-col h-full relative bg-[#09090b] border border-white/10 rounded-4xl overflow-hidden hover:border-primary/50 hover:shadow-[0_0_30px_rgba(37,99,235,0.15)] hover:-translate-y-1 transition-all duration-500"
            >
              <div className="aspect-video w-full bg-secondary/20 relative overflow-hidden flex items-center justify-center shrink-0">
                {show.image ? (
                  <img
                    src={show.image}
                    alt={show.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
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
                <div className="absolute top-6 left-6 z-20">
                  <span className="py-1 px-3 bg-black/40 backdrop-blur-md border border-white/10 rounded-full text-[10px] font-bold text-primary uppercase tracking-[0.2em]">
                    {show.category}
                  </span>
                </div>
                {show.duration && (
                  <div className="absolute top-6 right-6 z-20">
                    <div className="py-1.5 px-3 bg-black/40 backdrop-blur-md border border-white/10 rounded-full text-[10px] font-semibold text-white/80 uppercase tracking-widest flex items-center gap-1.5 shadow-lg">
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
                      {show.duration}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 relative z-20 bg-[#09090b] flex flex-col grow">
                <h2 className="text-3xl font-bold font-serif text-foreground group-hover:text-primary transition-colors duration-300 leading-tight mb-3">
                  {show.title}
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed opacity-80 line-clamp-2 mb-6">
                  {show.description}
                </p>
                <div className="mt-auto flex justify-end">
                  <div className="w-10 h-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300 group-hover:border-primary">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="-translate-x-px group-hover:translate-x-px transition-transform duration-300"
                    >
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
