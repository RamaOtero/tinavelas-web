import AnnouncementBar from './components/AnnouncementBar';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProductList from './components/ProductList';
import Scents from './components/Scents';
import Accessories from './components/Accessories';
import Refill from './components/Refill';
import About from './components/About';
import Care from './components/Care';
import Footer from './components/Footer';
import WhatsAppFloating from './components/WhatsAppFloating';

function App() {
  return (
    <div className="min-h-screen bg-bg-light text-text-dark selection:bg-accent-2 selection:text-text-dark font-sans">
      <Navbar />
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
