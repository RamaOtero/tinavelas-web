import { motion } from 'framer-motion';

export default function About() {
  return (
    <section id="nosotros" className="py-24 md:py-32 bg-bg-light relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          
          {/* Text Content */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
            className="order-2 lg:order-1 flex flex-col justify-center"
          >
            <h3 className="text-[10px] md:text-xs font-sans tracking-[0.4em] text-accent-1 uppercase mb-6">Nuestra Filosofía</h3>
            
            <h2 className="text-4xl md:text-5xl lg:text-7xl font-heading tracking-tight text-text-dark mb-8 leading-[1.1]">
              Hechas a mano <br/> <span className="italic font-light">con intención</span>
            </h2>

            <div className="w-12 h-[1px] bg-accent-2 mb-8"></div>

            <div className="space-y-6 text-sm md:text-base font-sans text-text-dark/80 font-light leading-relaxed max-w-lg">
              <p>
                Creemos en el poder transformador de los aromas y la iluminación. Cada una de nuestras velas es vertida a mano utilizando cera de soja 100% natural, respetando cuidadosamente los tiempos de curado que garantizan su pureza.
              </p>
              <p>
                El nombre de nuestro taller es en honor a <strong>Tina</strong>, mi hermosa gata siamesa. Ella me acompaña incondicionalmente durante todo el proceso creativo y es nuestra mayor inspiración: buscamos que a través de nuestras piezas, tus espacios transmitan esa misma sensación de refugio, tranquilidad y amor que ella me regala cada día.
              </p>
              <p>
                Es el encuentro perfecto entre la elegancia escultórica y la calidez del hogar. Un respiro visual y olfativo para iluminar cada rincón de tus días.
              </p>
            </div>
          </motion.div>

          {/* Image Content */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.2, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            className="order-1 lg:order-2 relative aspect-[4/5] bg-bg-light overflow-hidden rounded-sm"
          >
            {/* Foto de Tina, inspiradora de la marca */}
            <img 
              src="/tinaIMG.jpg" 
              alt="Tina, nuestra hermosa gata siamesa y compañera incondicional" 
              className="w-full h-full object-cover opacity-100 transition-transform duration-[2s] hover:scale-105"
            />
          </motion.div>

        </div>
      </div>
    </section>
  );
}
