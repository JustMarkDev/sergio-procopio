import { motion } from "framer-motion";

export default function ContactForm() {
  return (
    <section
      id="contatti"
      className="relative py-32 overflow-hidden bg-[#09090b]"
    >
      {/* Background Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_100%,rgba(37,99,235,0.08)_0%,transparent_50%)] pointer-events-none"></div>

      <div className="container relative z-10 mx-auto px-4 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-primary font-bold tracking-[0.2em] text-[10px] uppercase mb-4 block">
              Contatti
            </span>
            <h2 className="text-4xl md:text-6xl font-serif font-bold text-foreground mb-8 tracking-tight">
              Porta l'emozione <br />
              nella tua <span className="italic text-primary">scuola</span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-10 opacity-80">
              Sergio Procopio è a disposizione per spettacoli, laboratori e
              incontri formativi. Compila il modulo o utilizza i riferimenti
              diretti per richiedere un preventivo o una data.
            </p>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider font-bold text-primary mb-1">
                    Telefono
                  </div>
                  <div className="text-lg font-medium">380.52.52.684</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                  </svg>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider font-bold text-primary mb-1">
                    Email
                  </div>
                  <div className="text-lg font-medium">
                    info@sergioprocopio.com
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative p-10 bg-white/2 border border-white/5 rounded-[2.5rem] backdrop-blur-sm"
          >
            <form
              className="space-y-6"
              onSubmit={(e: React.FormEvent) => e.preventDefault()}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest opacity-60 ml-1">
                    Nome
                  </label>
                  <input
                    className="flex h-14 w-full rounded-2xl border border-white/10 bg-white/5 px-6 py-2 text-sm transition-all focus:border-primary/50 focus:bg-white/10 outline-none"
                    placeholder="Mario Rossi"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest opacity-60 ml-1">
                    Email
                  </label>
                  <input
                    type="email"
                    className="flex h-14 w-full rounded-2xl border border-white/10 bg-white/5 px-6 py-2 text-sm transition-all focus:border-primary/50 focus:bg-white/10 outline-none"
                    placeholder="mario@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest opacity-60 ml-1">
                  Oggetto
                </label>
                <input
                  className="flex h-14 w-full rounded-2xl border border-white/10 bg-white/5 px-6 py-2 text-sm transition-all focus:border-primary/50 focus:bg-white/10 outline-none"
                  placeholder="Richiesta informazioni..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest opacity-60 ml-1">
                  Messaggio
                </label>
                <textarea
                  className="flex min-h-35 w-full rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-sm transition-all focus:border-primary/50 focus:bg-white/10 outline-none resize-none"
                  placeholder="Scrivi qui..."
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-bold uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-[0.98]"
              >
                Invia Messaggio
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
