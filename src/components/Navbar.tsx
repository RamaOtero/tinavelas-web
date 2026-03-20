import { useState, useEffect } from 'react';
import { Menu, X, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '../store/useCartStore';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { toggleCart, items } = useCartStore();
  
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Inherit color based on scroll state: Light text over Hero, dark text over solid background
  const navStyle = scrolled
    ? 'bg-bg-light shadow-sm border-b border-accent-2/20 py-4 text-text-dark'
    : 'bg-transparent py-6 text-[#FAF9F6]'; // Ultra clear/white text for the hero

  return (
    <nav className={`fixed w-full z-50 transition-all duration-500 ${navStyle} ${scrolled ? 'top-0' : 'top-8'}`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between relative min-h-[4rem] md:min-h-[3rem] lg:min-h-[5rem]">
        {/* Left / Mobile Toggle */}
        <div className="flex-1 md:hidden">
          <button onClick={() => setIsOpen(!isOpen)} aria-label="Menu" className="hover:text-accent-2 transition-colors">
            {isOpen ? <X size={24} strokeWidth={1.5} /> : <Menu size={24} strokeWidth={1.5} />}
          </button>
        </div>

        {/* Left Links (Desktop) */}
        <div className="hidden md:flex flex-1 items-center space-x-3 md:space-x-4 lg:space-x-10 text-[8.5px] md:text-[9px] lg:text-[10px] tracking-[0.1em] md:tracking-[0.15em] lg:tracking-[0.2em] uppercase font-medium whitespace-nowrap overflow-hidden">
          <a href="#shop" className="hover:opacity-70 transition-opacity relative group whitespace-nowrap">
            Catálogo
            <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-current transition-all group-hover:w-full"></span>
          </a>
          <a href="#aromas" className="hover:opacity-70 transition-opacity relative group whitespace-nowrap">
            Aromas
            <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-current transition-all group-hover:w-full"></span>
          </a>
          <a href="#accesorios" className="hover:opacity-70 transition-opacity relative group whitespace-nowrap">
            Accesorios
            <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-current transition-all group-hover:w-full"></span>
          </a>
          <a href="#refill" className="hover:opacity-70 transition-opacity relative group whitespace-nowrap">
            Refill
            <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-current transition-all group-hover:w-full"></span>
          </a>
        </div>

        {/* Logo (Center) */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none z-10">
          <img src="/logo.png" alt="Tina Velas Logo" className="h-16 md:h-12 lg:h-20 w-auto object-contain drop-shadow-sm transition-transform duration-500 pointer-events-auto" />
        </div>

            {/* Right Icons */}
        <div className="flex-1 flex justify-end items-center space-x-3 md:space-x-4 lg:space-x-6 text-[8.5px] md:text-[9px] lg:text-[10px] tracking-[0.1em] md:tracking-[0.15em] lg:tracking-[0.2em] uppercase font-medium whitespace-nowrap overflow-hidden">
          <a href="#nosotros" className="hidden md:inline hover:opacity-70 transition-opacity relative group whitespace-nowrap">
            Nosotros
            <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-current transition-all group-hover:w-full"></span>
          </a>
          <a href="#cuidados" className="hidden md:inline hover:opacity-70 transition-opacity relative group whitespace-nowrap">
            Cuidados
            <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-current transition-all group-hover:w-full"></span>
          </a>
          <span className="hidden lg:inline opacity-60 cursor-default uppercase whitespace-nowrap" title="Próximamente">
            ¡Pronto Carrito!
          </span>
          {/* Cart Icon */}
          <button onClick={() => toggleCart(true)} className="relative hover:opacity-70 transition-opacity ml-2 group flex items-center justify-center">
            <ShoppingBag size={18} strokeWidth={1.5} />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-accent-2 text-bg-light text-[8px] font-sans font-bold w-[16px] h-[16px] flex items-center justify-center rounded-full">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: '100vh' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
            className="md:hidden bg-bg-light fixed top-0 left-0 w-full flex flex-col items-center justify-center space-y-10 text-2xl font-heading tracking-widest text-text-dark overflow-hidden z-40"
          >
            <button onClick={() => setIsOpen(false)} className="absolute top-8 left-6 hover:text-accent-1">
              <X size={28} strokeWidth={1.5} />
            </button>
            <a href="#shop" onClick={() => setIsOpen(false)} className="hover:text-accent-1 transition-colors">Catálogo</a>
            <a href="#aromas" onClick={() => setIsOpen(false)} className="hover:text-accent-1 transition-colors">Aromas</a>
            <a href="#accesorios" onClick={() => setIsOpen(false)} className="hover:text-accent-1 transition-colors">Accesorios</a>
            <a href="#refill" onClick={() => setIsOpen(false)} className="hover:text-accent-1 transition-colors">Refill</a>
            <a href="#nosotros" onClick={() => setIsOpen(false)} className="hover:text-accent-1 transition-colors">Nosotros</a>
            <a href="#cuidados" onClick={() => setIsOpen(false)} className="hover:text-accent-1 transition-colors">Cuidados</a>

            <a href="https://wa.me/5492216031496" target="_blank" rel="noreferrer" className="mt-8 text-xs font-sans tracking-[0.2em] uppercase border border-text-dark px-8 py-4 rounded-sm hover:bg-text-dark hover:text-bg-light transition-all">
              Pedir por WhatsApp
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
