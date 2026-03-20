import AnnouncementBar from './components/AnnouncementBar';
import Navbar from './components/Navbar';
import Cart from './components/Cart';
import Hero from './components/Hero';
import ProductList from './components/ProductList';
import Scents from './components/Scents';
import Accessories from './components/Accessories';
import Refill from './components/Refill';
import About from './components/About';
import Care from './components/Care';
import Footer from './components/Footer';
import WhatsAppFloating from './components/WhatsAppFloating';
import { useEffect } from 'react';
import { useCartStore } from './store/useCartStore';

function App() {
  const { clearCart } = useCartStore();

  useEffect(() => {
    // Si la URL tiene '?status=success', significa que el cliente viene redirigido de Mercado Pago
    const params = new URLSearchParams(window.location.search);
    const status = params.get('status');
    
    if (status === 'success') {
      clearCart();
      window.history.replaceState({}, '', '/'); // Limpiar la URL de fondo
      setTimeout(() => alert('¡Pago Aprobado! 🥂 Hemos recibido tu orden y prepararemos tu paquete.'), 800);
    } else if (status === 'failure') {
      window.history.replaceState({}, '', '/');
      setTimeout(() => alert('Upps, el pago fue rechazado. Revisa tu saldo o intenta de nuevo.'), 800);
    } else if (status === 'pending') {
      clearCart();
      window.history.replaceState({}, '', '/');
      setTimeout(() => alert('Tu pago está pendiente de aprobación bancaria. ¡Te avisaremos!'), 800);
    }
  }, [clearCart]);
  return (
    <div className="min-h-screen bg-bg-light text-text-dark selection:bg-accent-2 selection:text-text-dark font-sans relative">
      <AnnouncementBar />
      <Navbar />
      <Cart />
      <main>
        <Hero />
        <ProductList />
        <Scents />
        <Accessories />
        <Refill />
        <About />
        <Care />
      </main>
      <Footer />
      <WhatsAppFloating />
    </div>
  );
}

export default App;
