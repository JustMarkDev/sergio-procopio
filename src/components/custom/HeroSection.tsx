import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 bg-[#09090b]">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Animated Aurora Effects */}
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[140px] animate-pulse"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-900/20 rounded-full blur-[140px]"></div>

        {/* Fine Grid Pattern with Radial Mask */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-size-[32px_32px] mask-[radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
      </div>
      <div className="container relative z-10 mx-auto px-4 md:px-8 lg:px-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1 className="text-6xl sm:text-8xl lg:text-9xl xl:text-[11rem] font-serif font-bold text-foreground mb-10 tracking-tighter leading-[0.85] select-none">
            Sergio <br />
            <span className="text-transparent bg-clip-text bg-linear-to-b from-primary via-primary to-blue-700 italic pb-4 pr-12">
              Procopio
            </span>
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
        >
          <p className="text-xl md:text-3xl font-serif text-muted-foreground max-w-4xl mx-auto mb-10 leading-relaxed italic opacity-80">
            "L'arte del comico senza parole al servizio{" "}
            <br className="hidden md:block" />
            dell'educazione e delle emozioni."
          </p>
        </motion.div>

        <p className="max-w-3xl mx-auto mb-12 text-base md:text-lg leading-relaxed text-muted-foreground/75">
          Spettacoli di teatro educativo e pantomima per scuole, parrocchie,
          associazioni, teatri e famiglie.
        </p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.7 }}
          className="flex flex-col sm:flex-row justify-center items-center gap-6"
        >
          {/* Primary Action: Contattami */}
          <a
            href="#contatti"
            className="group relative overflow-hidden inline-flex min-h-14 items-center justify-center rounded-full bg-primary px-10 py-4 text-xl font-bold text-primary-foreground shadow-[0_8px_30px_rgba(37,99,235,0.22)] transition-[scale,box-shadow] duration-200 ease-out hover:shadow-[0_10px_40px_rgba(37,99,235,0.38)] active:scale-[0.96] hover:no-underline"
          >
            <span className="relative z-10">Mettiamoci in Contatto</span>
            <div className="absolute inset-0 rounded-full bg-linear-to-tr from-blue-700 to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
          </a>

          {/* Secondary Action: Scopri gli Spettacoli */}
          <a
            href="#spettacoli"
            className="inline-flex min-h-14 items-center justify-center rounded-full px-10 py-4 text-lg font-semibold text-muted-foreground shadow-[0_0_0_1px_rgba(255,255,255,0.1)] transition-[scale,color,background-color,box-shadow] duration-200 ease-out hover:bg-white/5 hover:text-foreground hover:shadow-[0_0_0_1px_rgba(255,255,255,0.16)] active:scale-[0.96]"
          >
            Scopri gli Spettacoli
          </a>
        </motion.div>
      </div>
    </section>
  );
}
