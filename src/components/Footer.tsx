import { Instagram, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-bg-light pt-24 pb-8 border-t border-accent-2/10">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8 text-center md:text-left">

        {/* Brand */}
        <div className="flex flex-col items-center md:items-start space-y-6">
          <h2 className="text-4xl font-heading tracking-widest">TINA</h2>
          <p className="text-xs text-text-dark/70 font-sans tracking-wide max-w-[220px] leading-loose">
            Piezas únicas y velas de soja vertidas a mano con pasión y dedicación.
          </p>
        </div>

        {/* Links */}
        <div className="flex flex-col items-center space-y-4">
          <h3 className="text-[10px] uppercase tracking-[0.3em] text-accent-1 mb-4">Descubrir</h3>
          <a href="#shop" className="text-sm text-text-dark/80 hover:text-text-dark hover:opacity-100 transition-opacity font-sans">Catálogo</a>
          <a href="#nosotros" className="text-sm text-text-dark/80 hover:text-text-dark hover:opacity-100 transition-opacity font-sans">Nuestra Historia</a>
          <a href="#cuidados" className="text-sm text-text-dark/80 hover:text-text-dark hover:opacity-100 transition-opacity font-sans">Cuidados de tu vela</a>
        </div>

        {/* Contact & Social */}
        <div className="flex flex-col items-center md:items-end space-y-6">
          <h3 className="text-[10px] uppercase tracking-[0.3em] text-accent-1 mb-2">Contacto</h3>

          <div className="flex flex-col items-center md:items-end space-y-3 text-sm text-text-dark/80">
            <a href="mailto:hola@tinavelas.com" className="flex items-center gap-2 hover:text-text-dark transition-colors">
              <Mail size={14} strokeWidth={1.5} /> tinavelasartesanales@gmail.com
            </a>
            <span className="flex items-center gap-2">
              <MapPin size={14} strokeWidth={1.5} />La Plata, Buenos Aires, Argentina
            </span>
          </div>

          <div className="flex space-x-6 pt-2">
            <a href="https://www.instagram.com/tinavelasartesanales/" target="_blank" rel="noreferrer" aria-label="Instagram" className="text-text-dark/60 hover:text-text-dark transition-colors">
              <Instagram strokeWidth={1.5} size={22} />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="mt-24 pt-8 border-t border-accent-2/20 flex flex-col md:flex-row items-center justify-between px-6 text-[9px] tracking-[0.2em] text-text-dark/50 uppercase">
        <p className="mb-4 md:mb-0">&copy; {new Date().getFullYear()} TINA VELAS. RESERVADOS TODOS LOS DERECHOS.</p>
        <div className="flex space-x-6">
          <a href="#" className="hover:text-text-dark transition-colors">Términos</a>
          <a href="#" className="hover:text-text-dark transition-colors">Privacidad</a>
        </div>
      </div>
    </footer>
  );
}
