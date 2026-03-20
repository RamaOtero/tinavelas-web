import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Trash2, ShoppingBag, MapPin, ArrowLeft, Loader2 } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { urlFor, sanityClient } from '../sanity';
import CheckoutMap from './CheckoutMap';

export default function Cart() {
  const { items, isCartOpen, toggleCart, updateQuantity, removeItem } = useCartStore();
  const [view, setView] = useState<'CART' | 'CHECKOUT'>('CART');
  
  // Checkout Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [coordinates, setCoordinates] = useState<{lat: number, lng: number} | null>(null);
  
  // Logistics Settings from Sanity
  const [shippingCost, setShippingCost] = useState(0);
  const [freeThreshold, setFreeThreshold] = useState(50000);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (isCartOpen) {
      sanityClient.fetch(`*[_type == "siteSettings"][0]{ shippingCostLaPlata, freeShippingThreshold }`)
      .then(data => {
        if(data) {
           setShippingCost(data.shippingCostLaPlata || 0);
           setFreeThreshold(data.freeShippingThreshold || 0);
        }
      }).catch(console.error);
    }
  }, [isCartOpen]);

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const isFreeShipping = freeThreshold > 0 && subtotal >= freeThreshold;
  const finalShipping = isFreeShipping ? 0 : shippingCost;
  const total = subtotal + finalShipping;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(price);
  };

  const handleCheckout = async () => {
    if (!name || !phone || !address || !coordinates) return;
    setProcessing(true);
    
    try {
      const payload = {
        // Enviar datos encriptados hacia nuestro blindaje en Vercel
        items: items.map(i => ({ 
          id: i.id, // ID físico real en BD
          quantity: i.quantity, 
          name: i.scent ? `${i.name} (${i.scent})` : i.name, // Empaquetar el aroma para que MP genere el recibo completo.
          image: i.image && i.image.asset ? urlFor(i.image).url() : null 
        })),
        customer: { name, phone },
        delivery: { address, lat: coordinates.lat, lng: coordinates.lng },
        isFreeShipping
      };

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al procesar la bóveda bancaria');
      }

      if (data.init_point) {
        // Todo autorizado de lado de Vercel y Sanity, mandamos al cliente a la ventana oficial de Mercado Pago!
        window.location.href = data.init_point; 
      } else {
         throw new Error('No se pudo generar el enlace de pago seguro');
      }

    } catch (error: any) {
      console.error(error);
      alert('Hubo un problema procesando la orden: ' + error.message);
      setProcessing(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isCartOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => toggleCart(false)}
            className="fixed inset-0 bg-text-dark/60 backdrop-blur-sm z-[100] cursor-pointer"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isCartOpen && (
          <motion.div
            key="drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: "tween", ease: "easeOut", duration: 0.35 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-bg-light z-[110] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 md:p-8 border-b border-accent-2/20 shrink-0">
              <div className="flex items-center space-x-4">
                {view === 'CHECKOUT' && (
                  <button onClick={() => setView('CART')} className="hover:text-accent-2 transition-colors">
                    <ArrowLeft size={20} strokeWidth={1.5} />
                  </button>
                )}
                <h2 className="text-xl md:text-2xl font-heading tracking-widest uppercase">
                  {view === 'CART' ? 'Tu Compra' : 'Envío Seguro'}
                </h2>
              </div>
              <button onClick={() => toggleCart(false)} className="hover:text-accent-2 transition-colors">
                <X size={28} strokeWidth={1} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
              {view === 'CART' ? (
                // --- CART VIEW ---
                items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-text-dark/40 space-y-6">
                    <ShoppingBag size={56} strokeWidth={1} />
                    <p className="font-sans text-xs tracking-widest uppercase text-center leading-relaxed">Tu carrito está vacío<br />descubre nuestras colecciones.</p>
                  </div>
                ) : (
                  items.map((item) => (
                    <div key={item.cartItemId || item.id} className="flex gap-6 items-center">
                      <div className="w-20 h-28 md:w-24 md:h-32 bg-accent-1/10 rounded-sm shrink-0 overflow-hidden relative">
                        {item.image ? (
                          <img src={urlFor(item.image).width(200).url()} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-[8px] uppercase tracking-widest text-text-dark/30">Sin Foto</div>
                        )}
                      </div>
                      
                      <div className="flex-1 flex flex-col h-full justify-between py-1">
                        <div>
                          <h3 className="text-xs md:text-sm font-heading font-medium tracking-widest uppercase mb-1">{item.name}</h3>
                          {item.scent && (
                            <p className="text-[9.5px] font-sans tracking-widest text-text-dark/60 mb-2 uppercase border border-text-dark/20 inline-block px-1.5 py-0.5 rounded-sm bg-text-dark/5">{item.scent}</p>
                          )}
                          <p className={`text-[10px] md:text-[11px] font-sans tracking-widest mb-2 ${item.scent ? 'text-text-dark/80' : 'text-text-dark/60'}`}>{formatPrice(item.price)}</p>
                          {item.stock === 0 && (
                            <span className="inline-block bg-accent-2/10 text-accent-2 text-[8px] tracking-widest uppercase px-2 py-0.5 rounded-sm">A Pedido</span>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between mt-auto">
                          <div className="flex items-center border border-accent-2/40 rounded-sm relative">
                            <button 
                              onClick={() => updateQuantity(item.cartItemId || item.id, Math.max(1, item.quantity - 1))}
                              className="p-1.5 md:p-2 hover:bg-accent-2/10 transition-colors"
                            >
                              <Minus size={12} strokeWidth={1.5} />
                            </button>
                            <span className="text-[10px] md:text-[11px] font-sans px-3 min-w-[24px] text-center font-medium">{item.quantity}</span>
                            <button 
                              onClick={() => {
                                if (item.stock === 0 || item.quantity < item.stock) {
                                  updateQuantity(item.cartItemId || item.id, item.quantity + 1);
                                }
                              }}
                              className="p-1.5 md:p-2 hover:bg-accent-2/10 transition-colors"
                            >
                              <Plus size={12} strokeWidth={1.5} />
                            </button>
                          </div>
                          <button onClick={() => removeItem(item.cartItemId || item.id)} className="text-text-dark/40 hover:text-red-800 transition-colors p-2">
                            <Trash2 size={16} strokeWidth={1.5} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )
              ) : (
                // --- CHECKOUT VIEW ---
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="space-y-4">
                    <h3 className="text-xs font-sans tracking-widest uppercase text-text-dark/60 mb-2">1. Mis Datos</h3>
                    <input 
                      type="text" placeholder="Nombre completo" value={name} onChange={e => setName(e.target.value)}
                      className="w-full bg-transparent border-b border-text-dark/20 py-2 text-sm font-sans focus:outline-none focus:border-text-dark transition-colors placeholder:text-text-dark/30"
                    />
                    <input 
                      type="text" placeholder="WhatsApp (Ej: 221...)" value={phone} onChange={e => setPhone(e.target.value)}
                      className="w-full bg-transparent border-b border-text-dark/20 py-2 text-sm font-sans focus:outline-none focus:border-text-dark transition-colors placeholder:text-text-dark/30"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xs font-sans tracking-widest uppercase text-text-dark/60">2. Envío en La Plata</h3>
                      <MapPin size={16} className="text-accent-2" strokeWidth={1.5} />
                    </div>
                    <input 
                      type="text" placeholder="Dirección escrita (Calle, número, depto)" value={address} onChange={e => setAddress(e.target.value)}
                      className="w-full bg-transparent border-b border-text-dark/20 py-2 text-sm font-sans focus:outline-none focus:border-text-dark transition-colors placeholder:text-text-dark/30"
                    />
                    
                    <div className="pt-2">
                      <p className="text-[10px] font-sans tracking-wide text-text-dark/60 mb-3 leading-relaxed">
                        Mueve el mapa y haz **click sobre tu casa** para marcar el punto exacto al que debe llegar el repartidor.
                      </p>
                      <CheckoutMap onLocationSelect={(lat, lng) => setCoordinates({ lat, lng })} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            {items.length > 0 && (
              <div className="p-6 md:p-8 border-t border-accent-2/20 bg-bg-light shrink-0">
                {view === 'CHECKOUT' && (
                  <div className="mb-4 pb-4 border-b border-text-dark/10 space-y-2">
                    <div className="flex justify-between items-center text-xs font-sans text-text-dark/70">
                      <span>Subtotal ({items.length} ítems)</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-sans text-text-dark/70">
                      <span>Envío Privado</span>
                      <span>{isFreeShipping ? 'Bonificado' : formatPrice(shippingCost)}</span>
                    </div>
                  </div>
                )}
                
                <div className="flex justify-between items-end mb-6">
                  <span className="text-[10px] md:text-xs font-sans tracking-widest uppercase text-text-dark/60">
                    {view === 'CART' ? 'Subtotal' : 'Total a Pagar'}
                  </span>
                  <span className="text-xl md:text-2xl font-heading tracking-wider">{view === 'CART' ? formatPrice(subtotal) : formatPrice(total)}</span>
                </div>
                
                {view === 'CART' ? (
                  <button onClick={() => setView('CHECKOUT')} className="w-full bg-text-dark text-bg-light py-4 md:py-5 text-[10px] md:text-[11px] font-sans font-medium hover:bg-accent-2 transition-all duration-300 uppercase tracking-[0.25em] rounded-sm">
                    Continuar al Envío
                  </button>
                ) : (
                  <button 
                    onClick={handleCheckout} 
                    disabled={!name || !phone || !address || !coordinates || processing}
                    className="w-full bg-[#009EE3] text-white py-4 md:py-5 text-[10px] md:text-[11px] font-sans font-medium hover:brightness-110 disabled:opacity-50 transition-all duration-300 uppercase tracking-[0.25em] rounded-sm flex items-center justify-center space-x-2"
                  >
                    {processing ? <Loader2 className="animate-spin" size={16} /> : null}
                    <span>Pagar con Mercado Pago</span>
                  </button>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
