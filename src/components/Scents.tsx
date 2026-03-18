import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { sanityClient } from '../sanity';

interface Scent {
  _id: string;
  name: string;
  notes: string;
  intensity: string;
}

export default function Scents() {
  const [scents, setScents] = useState<Scent[]>([]);

  useEffect(() => {
    // Busca en la base de datos de Sanity todos los documentos de tipo 'scent' (aromas)
    sanityClient
      .fetch<Scent[]>(`*[_type == "scent"]{ _id, name, notes, intensity }`)
      .then(setScents)
      .catch(console.error);
  }, []);

  // Si ella todavía no cargó ningún aroma en el panel, la sección ni siquiera aparece en pantalla (así no queda un hueco brillante y vacío)
  if (scents.length === 0) return null; 

  return (
    <section id="aromas" className="py-24 md:py-32 bg-bg-light border-t border-accent-2/20">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="text-center mb-16 md:mb-20">
          <motion.p 
            initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-[10px] md:text-xs font-sans tracking-[0.4em] text-accent-1 uppercase mb-4"
          >
            Nuestra Esencia
          </motion.p>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
            className="text-4xl md:text-5xl lg:text-6xl font-heading tracking-tight text-text-dark"
          >
            Catálogo de <span className="italic font-light">Aromas</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.4 }}
            className="mt-6 text-sm font-sans font-light text-text-dark/70 max-w-xl mx-auto leading-relaxed"
          >
            Descubre las fragancias disponibles para crear tu próxima vela o elegir para tu servicio de Refill. Diseñadas para evocar paz, calidez y transformar la energía de tus rincones favoritos.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {scents.map((scent, index) => (
            <motion.div 
              key={scent._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              className="border border-accent-2/30 bg-bg-light p-8 md:p-10 flex flex-col items-center text-center hover:bg-[#F4F1ED] transition-colors duration-500 rounded-sm"
            >
              <h3 className="text-xl md:text-2xl font-heading text-text-dark tracking-wide mb-4">{scent.name}</h3>
              {scent.intensity && (
                <span className="text-[8px] md:text-[9px] uppercase tracking-[0.2em] px-4 py-1.5 bg-accent-2/10 text-accent-1 rounded-full mb-6">
                  Intensidad: {scent.intensity}
                </span>
              )}
              <div className="w-8 h-[1px] bg-accent-2/40 mb-6"></div>
              <p className="text-xs md:text-sm font-sans font-light text-text-dark/80 leading-relaxed">
                {scent.notes}
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
