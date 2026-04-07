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
    <section id="spettacoli" className="py-24 bg-secondary/10">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-foreground mb-4">
            Spettacoli in Evidenza
          </h2>
          <p className="text-lg text-muted-foreground">
            Esperienze uniche pensate per ogni tipo di pubblico.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {shows.map((show, index) => (
            <motion.div
              key={show.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-colors"
            >
              <div className="aspect-video w-full bg-muted relative">
                <div className="absolute inset-0 bg-secondary/50 flex items-center justify-center text-muted-foreground font-serif text-center p-4">
                  {show.title}
                </div>
              </div>
              <div className="p-6">
                <div className="text-sm text-primary font-medium mb-2">
                  {show.category}
                </div>
                <h3 className="text-xl font-bold font-serif mb-3 group-hover:text-primary transition-colors">
                  {show.title}
                </h3>
                <p className="text-muted-foreground line-clamp-3 text-sm">
                  {show.description}
                </p>
                <div className="mt-6">
                  <a
                    href={`/spettacoli/${show.id}`}
                    className="text-sm font-medium hover:text-primary transition-colors flex items-center"
                  >
                    Scopri di più <span className="ml-1">→</span>
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <a
            href="/spettacoli"
            className="inline-block px-6 py-3 rounded-md border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            Vedi Tutti gli Spettacoli
          </a>
        </div>
      </div>
    </section>
  );
}
