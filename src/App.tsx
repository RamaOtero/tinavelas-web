import AnnouncementBar from './components/AnnouncementBar';
import Navbar from './components/Navbar';
import Cart from './components/Cart';
import Hero from './components/Hero';
import ArtisanalProcess from './components/ArtisanalProcess';
import ProductList from './components/ProductList';
import HomeSpray from './components/HomeSpray';
import Scents from './components/Scents';
import Accessories from './components/Accessories';
import Refill from './components/Refill';
import About from './components/About';
import Care from './components/Care';
import Footer from './components/Footer';
import WhatsAppFloating from './components/WhatsAppFloating';
import { useEffect } from 'react';
import { useCartStore } from './store/useCartStore';
import { Toaster, toast } from 'react-hot-toast';

function App() {
  const { clearCart } = useCartStore();

  useEffect(() => {
    // Si la URL tiene '?status=success', significa que el cliente viene redirigido de Mercado Pago
    const params = new URLSearchParams(window.location.search);
    const status = params.get('status');
    
    if (status === 'success') {
      clearCart();
      window.history.replaceState({}, '', '/'); // Limpiar la URL de fondo
      setTimeout(() => toast.success('¡Pago Aprobado! 🥂 Hemos recibido tu orden.', { duration: 6000, style: { background: '#EBE9DD', color: '#1A1A1A', borderRadius: '2px', border: '1px solid rgba(118, 107, 93, 0.2)', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase' } }), 800);
    } else if (status === 'failure') {
      window.history.replaceState({}, '', '/');
      setTimeout(() => toast.error('Upps, el pago fue rechazado. Revisa tu saldo o intenta de nuevo.', { duration: 5000, style: { background: '#EBE9DD', color: '#1A1A1A', borderRadius: '2px', border: '1px solid rgba(118, 107, 93, 0.2)', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase' } }), 800);
    } else if (status === 'pending') {
      clearCart();
      window.history.replaceState({}, '', '/');
      setTimeout(() => toast('Tu pago está pendiente de aprobación bancaria.', { icon: '⏳', duration: 5000, style: { background: '#EBE9DD', color: '#1A1A1A', borderRadius: '2px', border: '1px solid rgba(118, 107, 93, 0.2)', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase' } }), 800);
    }
  }, [clearCart]);
  return (
    <div className="min-h-screen bg-bg-light text-text-dark selection:bg-accent-2 selection:text-text-dark font-sans relative">
      <Toaster position="top-center" reverseOrder={false} />
      <AnnouncementBar />
      <Navbar />
      <Cart />
      <main>
        <Hero />
        <ArtisanalProcess />
        <ProductList />
        <Scents />
        <Refill />
        <Accessories />
        <HomeSpray />
        <About />
        <Care />
      </main>
      <Footer />
      <WhatsAppFloating />
    </div>
  );
}

export default App;
