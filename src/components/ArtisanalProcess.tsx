import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';

export default function ArtisanalProcess() {
  return (
    <section className="py-20 md:py-28 bg-bg-light text-text-dark border-b border-text-dark/10 relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-6 text-center">

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
          className="flex flex-col items-center"
        >
          <div className="w-14 h-14 rounded-full border border-text-dark/20 flex items-center justify-center mb-8">
            <Clock size={24} strokeWidth={1} className="text-text-dark" />
          </div>

          <h2 className="text-3xl md:text-5xl lg:text-6xl font-heading tracking-wide mb-6">
            El Tiempo del <span className="italic font-light text-text-dark/70">Artesano</span>
          </h2>

          <h3 className="text-[10px] md:text-xs tracking-[0.3em] uppercase font-sans mb-10 text-text-dark/60 font-medium">La Alquimia de la Cera de Soja</h3>

          <p className="text-sm md:text-base font-sans font-light text-text-dark/80 mb-6 max-w-2xl leading-relaxed mx-auto">
            Cada vela que encargas no está esperando en un estante. Se elabora exclusivamente para ti en el momento en que confirmas tu pedido, volcando la cera botánica fundida a la temperatura exacta y fusionándola a mano con el aroma que acabas de elegir.
          </p>

          <p className="text-sm md:text-base font-sans font-light text-text-dark/80 mb-12 max-w-2xl leading-relaxed mx-auto">
            Para que una vela queme pareja, no forme túneles y libere su fragancia en su máximo esplendor, la cera de soja requiere un proceso irremplazable de cristalización. Es por este minucioso proceso orgánico de anclaje de aromas que tu encargo necesita un mínimo de <strong>24 horas de reposo absoluto y curado</strong> antes de viajar a tus manos.
          </p>
          
          <div className="w-[1px] h-16 bg-text-dark/20"></div>

        </motion.div>

      </div>
    </section>
  );
}
