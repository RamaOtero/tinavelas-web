import { useState } from 'react';
import { motion } from 'framer-motion';
import CandleModelAScene from './3d/CandleModelAScene';

export default function Hero() {
  const [lit, setLit] = useState(true);

  return (
    <section className="relative w-full h-screen flex flex-col items-center justify-center bg-bg-light overflow-hidden">

      {/* Background Image/Texture with Dynamic Warmth Overlays */}
      <div className="absolute inset-0 z-0 flex justify-center items-center opacity-80 mix-blend-multiply">
        <img
          src="/wallpaper.jpg"
          alt="Textura de Mármol/Fondo Tina Velas"
          className="w-full h-full object-cover object-center"
        />
        {/* Darker gradient at the top so the white Navbar text pops perfectly */}
        <div className="absolute inset-0 bg-gradient-to-t from-bg-light via-bg-light/40 to-[#766B5D]/40"></div>
        <div className="absolute inset-0 bg-bg-light/10 backdrop-blur-[1px]"></div>

        {/* Global ambient warmth overlay (active when lit) */}
        <div
          className={`absolute inset-0 bg-[#ffbe94]/18 mix-blend-color-dodge transition-opacity duration-[1500ms] ease-in-out ${lit ? 'opacity-100' : 'opacity-0'
            }`}
        />

        {/* Secondary deep warmth layer for rich textures (active when lit) */}
        <div
          className={`absolute inset-0 bg-[#ff9e59]/8 mix-blend-overlay transition-opacity duration-[1500ms] ease-in-out ${lit ? 'opacity-100' : 'opacity-0'
            }`}
        />

        {/* Dark ambient shadow overlay (active when unlit, creates cozy dimness) */}
        <div
          className={`absolute inset-0 bg-[#2b241a]/30 transition-opacity duration-[1500ms] ease-in-out ${lit ? 'opacity-0' : 'opacity-100'
            }`}
        />
      </div>

      {/* Ambient Candle Glow Halo (Centered behind the candle) */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
        {/* Warm candle glow halo with slow breathing animation */}
        <div
          className={`absolute w-[500px] md:w-[780px] h-[500px] md:h-[780px] rounded-full bg-[radial-gradient(circle,rgba(255,147,61,0.26)_0%,rgba(251,113,133,0.02)_40%,rgba(255,122,0,0.06)_60%,transparent_80%)] blur-[45px] transition-all duration-[1500ms] ease-in-out ${lit
            ? "opacity-100 scale-100 animate-ambient-glow"
            : "opacity-8 scale-75"
            }`}
        />
        {/* Extra intense soft light right behind the candle */}
        <div
          className={`absolute w-[220px] md:w-[380px] h-[220px] md:h-[380px] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.14)_0%,rgba(253,186,116,0.05)_50%,transparent_75%)] blur-2xl transition-all duration-[1500ms] ease-in-out ${lit
            ? "opacity-100 scale-100"
            : "opacity-0 scale-50"
            }`}
        />
      </div>

      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto flex flex-col items-center mt-20">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
          className="text-[9px] md:text-[11px] font-sans tracking-[0.4em] uppercase text-[#FAF9F6]/90 mb-6 md:mb-8 relative z-10"
        >
          Handmade Candles
        </motion.p>

        {/* Contenedor relativo dedicado para los títulos y la vela (Asegura centrado y capas exactas) */}
        <div
          onClick={() => setLit(prev => !prev)}
          className="relative w-full flex flex-col items-center justify-center mb-8 md:mb-12 cursor-pointer"
        >

          {/* Capa inferior al modelo 3D (z-10) */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            className="text-7xl md:text-9xl lg:text-[10rem] xl:text-[11rem] font-heading tracking-tight text-[#FAF9F6] mb-1 md:mb-2 leading-[1.05] drop-shadow-[0_4px_12px_rgba(0,0,0,0.35)] relative z-10 select-none"
          >
            ENCENDÉ <br className="md:hidden" />
          </motion.h1>

          {/* Capa superior al modelo 3D (z-30) */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            className="text-7xl md:text-9xl lg:text-[10rem] xl:text-[11rem] font-heading tracking-tight text-[#FAF9F6] mb-0 leading-[1.05] drop-shadow-[0_8px_24px_rgba(0,0,0,0.55)] md:drop-shadow-[0_12px_36px_rgba(0,0,0,0.65)] relative z-30 select-none"
          >
            <span className=" italic font-light">la calma</span>
          </motion.h1>




          {/* Modelo de Vela 3D (z-20) - Posicionado absoluto e inset-0 dentro del bloque de títulos para centrado perfecto */}
          <div className="absolute inset-0 w-full h-full z-20 pointer-events-none flex items-center justify-center">
            <div className="w-full max-w-xl h-[460px] md:h-[620px] pointer-events-auto mt-[-45px] md:mt-[-75px]">
              <CandleModelAScene lit={lit} setLit={setLit} />
            </div>
          </div>



        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="text-sm md:text-base font-sans text-[#FAF9F6] max-w-md mx-auto mb-12 font-light leading-relaxed drop-shadow-sm relative z-30"
        >
          Descubrí nuestras velas artesanales de soja, piezas únicas creadas para transformar tu entorno y elevar tus sentidos.
        </motion.p>


        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1 }}
          className="relative z-30"
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


    </section>
  );
}

