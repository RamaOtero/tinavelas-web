import { motion } from 'framer-motion';
import { Recycle } from 'lucide-react';

export default function Refill() {
  const handleWhatsApp = () => {
    const text = '¡Hola! Quisiera consultar los precios y aromas disponibles para hacer el refill de mi envase.';
    window.open(`https://wa.me/5492216031496?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <section id="refill" className="py-20 md:py-28 bg-text-dark text-bg-light relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-6 text-center">

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
          className="flex flex-col items-center"
        >
          <div className="w-14 h-14 rounded-full border border-bg-light/20 flex items-center justify-center mb-8">
            <Recycle size={24} strokeWidth={1} className="text-accent-2" />
          </div>

          <h2 className="text-3xl md:text-5xl lg:text-6xl font-heading tracking-wide mb-6">
            Servicio de <span className="italic font-light text-accent-2">Refill</span>
          </h2>

          <p className="text-sm md:text-base font-sans font-light text-bg-light/70 mb-12 max-w-2xl leading-relaxed mx-auto">
            Creemos en la sostenibilidad sin perder la elegancia. Una vez que tu vela se haya consumido, no descartes su envase. Límpialo y acércalo a nuestro taller: lo rellenaremos artesanalmente con la fragancia que elijas, dándole una segunda vida a tu pieza escultórica por un precio menor.
          </p>

          <button
            onClick={handleWhatsApp}
            className="border border-accent-2 text-accent-2 px-10 py-4 text-[9px] md:text-[10px] font-sans tracking-[0.25em] font-medium uppercase hover:bg-accent-2 hover:text-text-dark transition-all duration-500 rounded-sm"
          >
            Consultar precios de Refill
          </button>
        </motion.div>

      </div>
    </section>
  );
}
