import { motion } from "framer-motion";

interface Show {
  id: string;
  title: string;
  category: string;
  description: string;
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
            <motion.div
              key={show.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group relative bg-white/2 border border-white/5 rounded-3xl overflow-hidden hover:bg-white/4 hover:border-primary/30 transition-all duration-500"
            >
              <div className="aspect-4/5 w-full bg-zinc-900 relative overflow-hidden">
                {/* Simulated Image Placeholder with dynamic pattern */}
                <div className="absolute inset-0 bg-linear-to-t from-[#09090b] via-transparent to-transparent z-10"></div>
                <div className="absolute inset-0 flex items-center justify-center p-8">
                  <span className="text-3xl font-serif font-bold text-white/10 group-hover:text-primary/20 transition-colors duration-500 text-center leading-tight">
                    {show.title}
                  </span>
                </div>
                {/* Category Badge Over Image */}
                <div className="absolute top-6 left-6 z-20">
                  <span className="py-1 px-3 bg-primary/10 backdrop-blur-md border border-primary/20 rounded-full text-[10px] font-bold text-primary uppercase tracking-wider">
                    {show.category}
                  </span>
                </div>
              </div>

              <div className="p-8 relative z-20">
                <h3 className="text-2xl font-bold font-serif mb-4 group-hover:text-primary transition-colors duration-300">
                  {show.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-8 line-clamp-3 opacity-80">
                  {show.description}
                </p>
                <a
                  href={`/spettacoli/${show.id}`}
                  className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary group/link"
                >
                  Dettagli Spettacolo
                  <span className="w-8 h-px bg-primary group-hover/link:w-12 transition-all duration-300"></span>
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
