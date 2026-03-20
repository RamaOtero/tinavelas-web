import { motion } from 'framer-motion';

export default function AnnouncementBar() {
  // Duplicamos el mensaje múltiples veces para lograr el efecto infinito sin cortes matemáticos.
  const messages = Array(12).fill("VELAS DE SOJA PREMIUM • @TINAVELASARTESANALES • ENVÍOS LA PLATA");

  return (
    <div className="bg-text-dark text-bg-light overflow-hidden h-8 flex items-center absolute top-0 w-full z-[60]">
      <motion.div
        animate={{ x: ["0%", "-50%"] }}
        transition={{ repeat: Infinity, ease: "linear", duration: 35 }}
        className="flex whitespace-nowrap text-[8.5px] md:text-[9.5px] tracking-[0.2em] font-sans font-light w-max"
      >
        {messages.map((text, i) => (
          <span key={i} className="px-4 md:px-8">
            {text}
          </span>
        ))}
      </motion.div>
    </div>
  );
}
