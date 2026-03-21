import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ChevronDown, X, Loader2, Flame } from 'lucide-react';
import { sanityClient, urlFor } from '../sanity';
import { useCartStore } from '../store/useCartStore';
import { toast } from 'react-hot-toast';

export interface Candle {
  _id: string;
  name: string;
  creator: string;
  price: string;
  priceNumber: number;
  stock: number;
  description: string;
  allowedScents?: string[];
  images: any[];
}

type LightboxState = {
  product: Candle;
  index: number;
} | null;

function ProductCard({ product, index, globalScents, openLightbox }: { product: Candle; index: number; globalScents: string[]; openLightbox: (state: LightboxState) => void }) {
  const [currentImage, setCurrentImage] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [selectedScent, setSelectedScent] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const images = product.images || [];

  const isMdStaggered = index % 2 === 1;
  const isLgStaggered = index % 3 === 1;
  const staggerClass = `${isMdStaggered ? 'md:mt-24' : 'md:mt-0'} ${isLgStaggered ? 'lg:mt-32' : 'lg:mt-0'}`;
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

  const { addItem } = useCartStore();

  const handleAddToCart = () => {
    if (!product.priceNumber) {
      toast.error('Esta pieza requiere precio de panel.', { style: { background: '#EBE9DD', color: '#1A1A1A', borderRadius: '2px', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' } });
      return;
    }
    if (globalScents.length > 0 && !selectedScent) {
      toast.error('Por favor selecciona un aroma.', { style: { background: '#EBE9DD', color: '#1A1A1A', borderRadius: '2px', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' } });
      return;
    }

    addItem({
      id: product._id,
      name: product.name,
      price: product.priceNumber,
      stock: product.stock !== undefined ? product.stock : 10,
      scent: selectedScent || undefined, // Adjuntamos la esencia a Zustand
      image: hasImages ? images[0] : null,
    });
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
      transition={{ delay: (index % 3) * 0.15, duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
      className={`group flex flex-col ${staggerClass}`}
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
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-accent-1/5">
              <Flame size={40} strokeWidth={1} className="text-text-dark/20 mb-3" />
              <span className="text-[10px] uppercase tracking-widest text-text-dark/30">Tina Velas</span>
            </div>
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

      <div className="flex flex-col items-center text-center px-4 w-full">
        <h3 className="text-sm md:text-base font-sans tracking-widest uppercase mb-1">{product.name}</h3>
        <p className="text-[9px] md:text-[10px] text-text-dark/50 font-sans tracking-[0.2em] uppercase mb-4">por {product.creator || 'Colección Lujo'}</p>
        <div className="w-8 h-[1px] bg-accent-2/60 mb-4"></div>
        <p className="text-[11px] font-sans text-text-dark/80 font-light leading-relaxed max-w-xs mb-6 h-12 overflow-hidden">{product.description}</p>

        {globalScents.length > 0 && (
          <div className="w-full mb-5 relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full flex items-center justify-between border-b border-text-dark/20 pb-2 text-[9px] md:text-[10px] font-sans tracking-[0.1em] transition-colors hover:border-text-dark group"
            >
              <span className="flex-1 text-center tracking-[0.2em] pl-4">{selectedScent ? selectedScent.toUpperCase() : 'SELECCIONAR AROMA'}</span>
              <ChevronDown size={14} className={`text-text-dark/60 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.2 }}
                  className="absolute left-0 right-0 top-full mt-1 bg-bg-light border border-accent-2/30 shadow-xl z-20 py-1 rounded-sm overflow-hidden"
                >
                  {globalScents.map(scent => (
                    <button
                      key={scent}
                      onClick={() => { setSelectedScent(scent); setIsDropdownOpen(false); }}
                      className={`w-full text-center py-2.5 px-2 text-[9px] md:text-[10px] font-sans tracking-[0.2em] uppercase transition-colors ${selectedScent === scent ? 'bg-accent-2/10 text-accent-2 font-medium' : 'text-text-dark/70 hover:bg-accent-1/20 hover:text-text-dark'}`}
                    >
                      {scent}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <p className="text-[8px] text-text-dark/40 mt-2 uppercase tracking-widest text-center">Aroma Personalizado</p>
          </div>
        )}

        {product.stock > 0 && product.stock <= 5 && (
          <span className="absolute top-4 left-4 z-10 bg-accent-2 text-bg-light px-3 py-1 text-[8px] font-sans tracking-[0.2em] font-medium uppercase rounded-sm shadow-sm ring-1 ring-accent-2/50 backdrop-blur-sm">Últimos {product.stock} Envases</span>
        )}
        {product.stock === 0 && (
          <span className="absolute top-4 left-4 z-10 bg-text-dark text-bg-light px-3 py-1 text-[8px] font-sans tracking-[0.2em] font-medium uppercase rounded-sm shadow-sm opacity-90 backdrop-blur-sm">Sin Envase Físico</span>
        )}
        <button onClick={handleAddToCart} className="border border-text-dark/40 w-full text-text-dark px-2 py-3 text-[9px] md:text-[10px] font-sans tracking-[0.2em] font-medium uppercase hover:bg-text-dark hover:border-text-dark hover:text-bg-light transition-all duration-300 rounded-sm mt-auto">
          {product.stock === 0 ? `Encargar por ${product.price} (Con Demora)` : `Agregar por ${product.price}`}
        </button>
      </div>
    </motion.div>
  );
}

export default function ProductList() {
  const [candles, setCandles] = useState<Candle[]>([]);
  const [globalScents, setGlobalScents] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState<LightboxState>(null);

  useEffect(() => {
    sanityClient.fetch(`*[_type == "scent"] | order(name asc) { name }`)
      .then((data) => {
        setGlobalScents(data.map((s: any) => s.name));
      })
      .catch(console.error);

    sanityClient.fetch(`*[_type == "candle"] | order(_createdAt asc) {
        _id, name, creator, price, priceNumber, stock, description, images
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
              {candles.map((candle, index) => (
                <ProductCard key={candle._id} product={candle} index={index} globalScents={globalScents} openLightbox={setLightbox} />
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
