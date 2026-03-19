import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

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
    <nav className={`fixed w-full z-50 top-0 transition-all duration-500 ${navStyle}`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Left / Mobile Toggle */}
        <div className="flex-1 md:hidden">
          <button onClick={() => setIsOpen(!isOpen)} aria-label="Menu" className="hover:text-accent-2 transition-colors">
            {isOpen ? <X size={24} strokeWidth={1.5} /> : <Menu size={24} strokeWidth={1.5} />}
          </button>
        </div>

        {/* Left Links (Desktop) */}
        <div className="hidden md:flex flex-1 items-center space-x-3 md:space-x-4 lg:space-x-10 text-[8.5px] md:text-[9px] lg:text-[10px] tracking-[0.1em] md:tracking-[0.15em] lg:tracking-[0.2em] uppercase font-medium">
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
          <a href="#nosotros" className="hover:opacity-70 transition-opacity relative group whitespace-nowrap">
            Nosotros
            <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-current transition-all group-hover:w-full"></span>
          </a>
          <a href="#cuidados" className="hover:opacity-70 transition-opacity relative group whitespace-nowrap">
            Cuidados
            <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-current transition-all group-hover:w-full"></span>
          </a>
        </div>

        {/* Logo (Center) */}
        <div className="flex-shrink flex items-center justify-center px-2 md:px-6 lg:px-4 min-w-[80px]">
          <img src="/logo.png" alt="Tina Velas Logo" className="h-16 md:h-12 lg:h-20 w-auto max-w-full object-contain drop-shadow-sm transition-transform duration-500" />
        </div>

        {/* Right Icons */}
        <div className="flex-1 flex justify-end items-center space-x-3 md:space-x-4 lg:space-x-6 text-[8.5px] md:text-[9px] lg:text-[10px] tracking-[0.1em] md:tracking-[0.15em] lg:tracking-[0.2em] uppercase font-medium">
          <span className="hidden md:block opacity-60 cursor-default uppercase whitespace-nowrap" title="Próximamente">
            ¡Pronto Carrito!
          </span>
          <a href="https://wa.me/5492216031496" target="_blank" rel="noreferrer" className="hover:opacity-70 flex items-center justify-end gap-2 group transition-opacity min-w-max">
            <span className="hidden md:inline relative whitespace-nowrap">
              Hacer Pedido
              <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-current transition-all group-hover:w-full"></span>
            </span>
            <span className="md:hidden border-b border-current pb-0.5">WhatsApp</span>
          </a>
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
