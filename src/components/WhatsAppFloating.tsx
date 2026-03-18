import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';

export default function WhatsAppFloating() {
  return (
    <motion.a
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 2, type: 'spring', stiffness: 200, damping: 20 }}
      href="https://wa.me/5492216031496?text=Hola,%20me%20gustaría%20saber%20más%20sobre%20el%20catálogo%20de%20Tina%20Velas"
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-50 bg-text-dark text-bg-light p-4 rounded-full shadow-[0_10px_40px_rgba(118,107,93,0.3)] hover:bg-[#25D366] hover:-translate-y-1 transition-all duration-500 flex items-center justify-center group"
      aria-label="Pedir por WhatsApp"
    >
      <MessageCircle size={28} strokeWidth={1.5} />
      <span className="absolute right-full mr-4 bg-bg-light text-text-dark border border-accent-2/50 px-4 py-2 text-[10px] tracking-[0.2em] font-medium uppercase font-sans whitespace-nowrap rounded-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-sm">
        Chateá con nosotros
      </span>
    </motion.a>
  );
}
