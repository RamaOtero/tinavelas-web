import { motion } from 'framer-motion';

export default function Hero() {
  return (
    <section className="relative w-full h-screen flex flex-col items-center justify-center bg-bg-light overflow-hidden">

      {/* Background Image/Texture */}
      <div className="absolute inset-0 z-0 flex justify-center items-center opacity-80 mix-blend-multiply">
        <img
          src="/wallpaper.jpg"
          alt="Textura de Mármol/Fondo Tina Velas"
          className="w-full h-full object-cover object-center"
        />
        {/* Darker gradient at the top so the white Navbar text pops perfectly */}
        <div className="absolute inset-0 bg-gradient-to-t from-bg-light via-bg-light/40 to-[#766B5D]/40"></div>
        <div className="absolute inset-0 bg-bg-light/10 backdrop-blur-[1px]"></div>
      </div>

      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto flex flex-col items-center mt-20">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
          className="text-[9px] md:text-[11px] font-sans tracking-[0.4em] uppercase text-[#FAF9F6]/90 mb-6 md:mb-8"
        >
          Handmade Candles
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-6xl md:text-8xl lg:text-9xl font-heading tracking-tight text-[#FAF9F6] mb-6 leading-[1.05] drop-shadow-md"
        >
          ENCENDÉ <br className="md:hidden" /> <span className="italic font-light">la calma</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="text-sm md:text-base font-sans text-[#FAF9F6] max-w-md mx-auto mb-12 font-light leading-relaxed drop-shadow-sm"
        >
          Descubrí nuestras velas artesanales de soja, piezas únicas creadas para transformar tu entorno y elevar tus sentidos.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1 }}
        >
          <a
            href="#shop"
            className="group flex items-center justify-center gap-4 text-[10px] md:text-xs tracking-[0.2em] uppercase font-medium text-[#FAF9F6] hover:opacity-70 transition-opacity"
          >
            <span className="border-b border-[#FAF9F6] pb-1">Explorar Catálogo</span>
            <span className="text-lg group-hover:translate-x-2 transition-transform font-light">→</span>
          </a>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
      >
        <div className="w-[1px] h-12 md:h-16 bg-[#FAF9F6]/20 relative overflow-hidden">
          <motion.div
            animate={{ top: ['-100%', '100%'] }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            className="absolute left-0 w-full h-[50%] bg-[#FAF9F6]/80"
          />
        </div>
      </motion.div>
    </section>
  );
}
