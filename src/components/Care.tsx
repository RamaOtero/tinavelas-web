import { motion } from 'framer-motion';
import { Scissors, Clock, Wind, AlertCircle } from 'lucide-react';

const careTips = [
  {
    icon: <Scissors size={24} strokeWidth={1} />,
    title: 'Antes de encenderla',
    description: 'Con la vela fría, recorta siempre la mecha a unos 5 milímetros. Este simple paso elimina los restos del encendido anterior y evita que la llama humee o titile demasiado.'
  },
  {
    icon: <Clock size={24} strokeWidth={1} />,
    title: 'Tiempo de encendido',
    description: 'Para tu mejor experiencia olfativa, no la mantengas encendida por más de 3 a 4 horas seguidas. Apágala, deja que el vaso recupere su temperatura, recorta la mecha y vuelve a disfrutar.'
  },
  {
    icon: <Wind size={24} strokeWidth={1} />,
    title: 'Cómo apagarla',
    description: 'Lo ideal es utilizar un apagavelas, tapar el envase o sumergir cuidadosamente la mecha en la cera líquida y volver a enderezarla. Así evitarás el molesto humo negro y preservarás el exquisito aroma.'
  },
  {
    icon: <AlertCircle size={24} strokeWidth={1} />,
    title: 'Cuándo decir adiós',
    description: 'Deja de usar la vela cuando quede solo medio centímetro de cera en el fondo. Así evitas que el envase se sobrecaliente. ¡Luego límpialo y aprovéchate de nuestro servicio de Refill!'
  }
];

export default function Care() {
  return (
    <section id="cuidados" className="py-24 md:py-32 bg-bg-light relative border-t border-accent-2/20">
      <div className="max-w-5xl mx-auto px-6">
        
        <div className="text-center mb-16 md:mb-24">
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8 }}
            className="text-[10px] md:text-xs font-sans tracking-[0.4em] text-accent-1 uppercase mb-4"
          >
            Guía Esencial
          </motion.p>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-4xl md:text-5xl lg:text-6xl font-heading tracking-tight text-text-dark"
          >
            Ritual de <span className="italic font-light">Cuidados</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
          {careTips.map((tip, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: index * 0.15, duration: 0.8, ease: "easeOut" }}
              className="flex gap-6 group"
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-full border border-accent-2/30 flex items-center justify-center text-text-dark group-hover:bg-accent-2/10 transition-colors">
                {tip.icon}
              </div>
              <div className="flex flex-col">
                <h3 className="text-sm md:text-base font-sans tracking-widest uppercase mb-3 text-text-dark">{tip.title}</h3>
                <p className="text-xs font-sans font-light text-text-dark/80 leading-relaxed">
                  {tip.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
        
      </div>
    </section>
  );
}
