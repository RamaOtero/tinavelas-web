import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Loader2 } from 'lucide-react';
import { sanityClient, urlFor } from '../sanity';

export interface Candle {
  _id: string;
  name: string;
  creator: string;
  price: string;
  description: string;
  images: any[]; 
}

type LightboxState = {
  product: Candle;
  index: number;
} | null;

function ProductCard({ product, index, openLightbox }: { product: Candle; index: number; openLightbox: (state: LightboxState) => void }) {
  const [currentImage, setCurrentImage] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const images = product.images || [];
  const hasImages = images.length > 0;

  const nextImage = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (hasImages) setCurrentImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (hasImages) setCurrentImage((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    
    if (diff > 40) nextImage();
    if (diff < -40) prevImage();
    setTouchStart(null);
  };

  const handleWhatsApp = () => {
    const text = `¡Hola! Me encantó la ${product.name || 'vela'} (valor de ref: ${product.price || ''}). Quisiera saber más detalles y disponibilidad.`;
    window.open(`https://wa.me/5492216031496?text=${encodeURIComponent(text)}`, '_blank');
  };

  const getImageUrl = (image: any) => {
    try {
      return urlFor(image).url();
    } catch {
      return '';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: index * 0.2, duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
      className={`group flex flex-col ${index === 1 ? 'md:mt-24 lg:mt-32' : ''}`}
    >
      <div
        className="relative aspect-[3/4] bg-accent-1/10 overflow-hidden mb-8 w-full cursor-zoom-in rounded-sm"
        onClick={() => hasImages && openLightbox({ product, index: currentImage })}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <AnimatePresence initial={false} mode="popLayout">
          {hasImages ? (
            <motion.img
              key={currentImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              src={getImageUrl(images[currentImage])}
              loading="lazy"
              decoding="async"
              style={{ willChange: "opacity, transform" }}
              alt={`${product.name} - Vista ${currentImage + 1}`}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2s] ease-[0.25,0.46,0.45,0.94]"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-200 text-gray-500">No Image</div>
          )}
        </AnimatePresence>

        {product.images?.length > 1 && (
          <>
            <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 bg-bg-light/80 text-text-dark p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-bg-light z-10"><ChevronLeft size={16} strokeWidth={1.5} /></button>
            <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 bg-bg-light/80 text-text-dark p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-bg-light z-10"><ChevronRight size={16} strokeWidth={1.5} /></button>
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
              {product.images.map((_, i) => (
                <div key={i} className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${i === currentImage ? 'bg-bg-light' : 'bg-bg-light/40'}`} />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="flex flex-col items-center text-center px-4">
        <h3 className="text-sm md:text-base font-sans tracking-widest uppercase mb-1">{product.name}</h3>
        <p className="text-[9px] md:text-[10px] text-text-dark/50 font-sans tracking-[0.2em] uppercase mb-4">por {product.creator || 'Colección Lujo'}</p>
        <div className="w-8 h-[1px] bg-accent-2/60 mb-4"></div>
        <p className="text-[11px] font-sans text-text-dark/80 font-light leading-relaxed max-w-xs mb-6">{product.description}</p>

        <button onClick={handleWhatsApp} className="border border-text-dark/40 text-text-dark px-10 py-3 text-[9px] md:text-[10px] font-sans tracking-[0.2em] font-medium uppercase hover:bg-text-dark hover:border-text-dark hover:text-bg-light transition-all duration-300 rounded-sm">
          Encargar por {product.price}
        </button>
      </div>
    </motion.div>
  );
}

export default function ProductList() {
  const [candles, setCandles] = useState<Candle[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState<LightboxState>(null);

  useEffect(() => {
    sanityClient.fetch(`*[_type == "candle"]{
      _id,
      name,
      creator,
      price,
      description,
      images
    }`).then((data) => {
      setCandles(data);
      setLoading(false);
    }).catch((err) => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (lightbox) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'auto';
    return () => { document.body.style.overflow = 'auto'; };
  }, [lightbox]);

  const handleLightboxNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!lightbox) return;
    setLightbox({ ...lightbox, index: (lightbox.index + 1) % lightbox.product.images.length });
  };

  const handleLightboxPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!lightbox) return;
    setLightbox({ ...lightbox, index: (lightbox.index - 1 + lightbox.product.images.length) % lightbox.product.images.length });
  };

  return (
    <>
      <section id="shop" className="py-24 md:py-32 bg-bg-light min-h-[50vh]">
        <div className="max-w-7xl mx-auto px-6">

          <div className="mb-20 md:mb-24 flex flex-col md:flex-row md:items-end justify-between border-b border-accent-2/30 pb-12">
            <div className="max-w-xl">
              <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} className="text-5xl md:text-6xl lg:text-7xl font-heading tracking-tight mb-4">
                Catálogo <br /> <span className="italic font-light text-text-dark/70">Esencial</span>
              </motion.h2>
            </div>
            <div className="mt-12 md:mt-0 relative">
              <span className="text-[10px] md:text-xs font-sans tracking-[0.3em] font-medium uppercase md:origin-bottom-right lg:absolute lg:right-0 lg:bottom-2 whitespace-nowrap text-text-dark inline-block md:transform md:-rotate-90">
                Colecciones
              </span>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
               <Loader2 className="animate-spin text-accent-2" size={32} />
               <p className="text-[10px] font-sans tracking-[0.3em] text-text-dark uppercase">Encendiendo catálogo online...</p>
            </div>
          ) : candles.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-32 space-y-4 text-center">
               <p className="text-[12px] font-sans tracking-[0.2em] text-text-dark/60 uppercase">Catálogo en preparación</p>
               <h3 className="text-3xl font-heading text-text-dark">Sube tus primera velas en tu panel de control</h3>
               <p className="font-sans text-xs max-w-sm mt-4 text-text-dark/60">En cuanto publiques un producto en Sanity, aparecerá mágicamente aquí.</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16 lg:gap-8">
              {candles.map((product, index) => (
                <ProductCard key={product._id} product={product} index={index} openLightbox={setLightbox} />
              ))}
            </div>
          )}

        </div>
      </section>

      <AnimatePresence>
        {lightbox && lightbox.product.images && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} className="fixed inset-0 z-[100] bg-text-dark/95 backdrop-blur-md flex items-center justify-center p-4 md:p-12 cursor-zoom-out" onClick={() => setLightbox(null)}>
            <button onClick={() => setLightbox(null)} className="absolute top-6 right-6 md:top-10 md:right-10 text-bg-light/60 hover:text-bg-light transition-colors z-[110] p-2" aria-label="Cerrar vista"><X size={32} strokeWidth={1} /></button>
            {lightbox.product.images.length > 1 && <button onClick={handleLightboxPrev} className="absolute left-4 md:left-12 top-1/2 -translate-y-1/2 text-bg-light/60 hover:text-bg-light hover:scale-110 transition-all z-[110] p-4 cursor-pointer"><ChevronLeft size={40} strokeWidth={1} /></button>}
            {lightbox.product.images.length > 1 && <button onClick={handleLightboxNext} className="absolute right-4 md:right-12 top-1/2 -translate-y-1/2 text-bg-light/60 hover:text-bg-light hover:scale-110 transition-all z-[110] p-4 cursor-pointer"><ChevronRight size={40} strokeWidth={1} /></button>}
            
            <AnimatePresence mode="wait">
              <motion.img key={lightbox.index} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }} src={urlFor(lightbox.product.images[lightbox.index]).url()} alt={`${lightbox.product.name} - Vista completa ${lightbox.index + 1}`} className="w-auto h-auto max-w-full max-h-full object-contain cursor-default shadow-2xl rounded-sm" onClick={(e) => e.stopPropagation()} />
            </AnimatePresence>

            {lightbox.product.images.length > 1 && (
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex space-x-3 z-[110]" onClick={(e) => e.stopPropagation()}>
                {lightbox.product.images.map((_, i) => (
                  <button key={i} onClick={(e) => { e.stopPropagation(); setLightbox({ ...lightbox, index: i }); }} className={`w-2 h-2 rounded-full transition-colors duration-300 ${i === lightbox.index ? 'bg-bg-light' : 'bg-bg-light/30 hover:bg-bg-light/60'}`} />
                ))}
              </div>
            )}
            
            {lightbox.product.images.length > 1 && (
              <div className="absolute top-10 left-10 md:top-12 md:left-12 text-bg-light/60 font-sans text-xs tracking-[0.3em]">{lightbox.index + 1} / {lightbox.product.images.length}</div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
