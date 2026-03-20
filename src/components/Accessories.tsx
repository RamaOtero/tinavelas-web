import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { sanityClient, urlFor } from '../sanity';
import { useCartStore } from '../store/useCartStore';

interface Accessory {
  _id: string;
  name: string;
  price: string;
  priceNumber: number;
  stock: number;
  description: string;
  image: any;
}

export default function Accessories() {
  const [accessories, setAccessories] = useState<Accessory[]>([]);

  useEffect(() => {
    // Buscar herramientas extras en Sanity
    sanityClient
      .fetch<Accessory[]>(`*[_type == "accessory"]{ _id, name, price, priceNumber, stock, description, image }`)
      .then(setAccessories)
      .catch(console.error);
  }, []);

  // Ocultar sección completa si todavía no publicaron accesorios
  if (accessories.length === 0) return null;

  const { addItem } = useCartStore();

  const handleAddToCart = (product: Accessory) => {
    if (!product.priceNumber) {
      alert('Esta herramienta requiere un precio ingresado en el panel central de Sanity para comprarse online.');
      return;
    }
    
    addItem({
      id: product._id,
      name: product.name,
      price: product.priceNumber,
      stock: product.stock !== undefined ? product.stock : 10,
      image: product.image,
    });
  };

  return (
    <section id="accesorios" className="py-24 md:py-32 bg-bg-light border-t border-accent-2/20">
      <div className="max-w-7xl mx-auto px-6">

        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-16 md:mb-20 border-b border-accent-2/30 pb-10">
          <div>
            <motion.p initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-[10px] md:text-xs font-sans tracking-[0.4em] text-accent-1 uppercase mb-4">Accesorios</motion.p>
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="text-4xl md:text-5xl lg:text-6xl font-heading tracking-tight text-text-dark">Herramientas & <span className="italic font-light">Más</span></motion.h2>
          </div>
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 }} className="mt-8 md:mt-0 text-xs md:text-sm font-sans font-light text-text-dark/70 max-w-sm text-left md:text-right leading-relaxed">
            Pule la experiencia de encender y apagar tus velas con accesorios elegantemente diseñados para armonizar tu altar.
          </motion.p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {accessories.map((item, index) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: (index % 4) * 0.15, duration: 0.8 }}
              className="group flex flex-col items-center text-center h-full"
            >
              <div className="w-full aspect-[4/5] bg-accent-1/5 overflow-hidden rounded-sm mb-6 relative hover:shadow-lg transition-shadow duration-500">
                {item.image ? (
                  <img src={urlFor(item.image).url()} alt={item.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s] ease-out" loading="lazy" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-text-dark/30 text-[9px] uppercase tracking-widest font-sans bg-accent-1/10">Sin Foto</div>
                )}
              </div>
              <h3 className="text-xs md:text-sm lg:text-base font-heading text-text-dark tracking-widest uppercase mb-2">{item.name}</h3>
              <p className="text-[9px] md:text-[10px] font-sans font-light tracking-[0.05em] text-text-dark/80 mb-6 px-1 leading-relaxed md:h-12 overflow-hidden">{item.description}</p>

              <button onClick={() => handleAddToCart(item)} className="border border-accent-2/60 text-text-dark px-2 md:px-6 py-3 text-[8.5px] md:text-[9.5px] font-sans tracking-[0.2em] font-medium uppercase hover:bg-accent-2 hover:border-accent-2 hover:text-bg-light transition-colors duration-300 rounded-sm mt-auto w-full">
                {item.stock === 0 ? 'Encargar a Medida' : `Agregar ${item.price ? `(${item.price})` : ''}`}
              </button>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
