import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Trash2, ShoppingBag, MapPin, ArrowLeft, Loader2 } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { urlFor, sanityClient } from '../sanity';
import CheckoutMap from './CheckoutMap';
import { toast } from 'react-hot-toast';

export default function Cart() {
  const { items, removeItem, updateQuantity, toggleCart, isCartOpen, clearCart } = useCartStore();
  const [view, setView] = useState<'CART' | 'CHECKOUT'>('CART');
  
  // Checkout Form State
  const [deliveryMethod, setDeliveryMethod] = useState<'SHIPPING' | 'PICKUP'>('SHIPPING');
  const [paymentMethod, setPaymentMethod] = useState<'TRANSFERENCIA' | 'EFECTIVO'>('TRANSFERENCIA');
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
  const finalShipping = deliveryMethod === 'PICKUP' ? 0 : (isFreeShipping ? 0 : shippingCost);
  const total = subtotal + finalShipping;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(price);
  };

  const handleWhatsappCheckout = () => {
    let msg = `*NUEVO PEDIDO - TINA VELAS* 🕯️\n\n`;
    msg += `*Cliente:* ${name}\n`;
    msg += `*WhatsApp:* ${phone}\n`;
    msg += `*Entrega:* ${deliveryMethod === 'PICKUP' ? '📦 Retiro en Punto a coordinar' : `📍 Envío a ${address}`}\n`;
    msg += `*Pago:* ${paymentMethod === 'TRANSFERENCIA' ? '🏦 Transferencia Bancaria' : '💵 Efectivo'}\n\n`;
    msg += `*MI CARRITO:*\n`;
    items.forEach(item => {
      msg += `- ${item.quantity}x ${item.name} ${item.scent ? `(Aroma: ${item.scent}) ` : ''}- ${formatPrice(item.price * item.quantity)}\n`;
    });
    msg += `\n*Subtotal:* ${formatPrice(subtotal)}\n`;
    msg += `*Envío:* ${deliveryMethod === 'PICKUP' ? 'Bonificado' : (isFreeShipping ? 'Bonificado' : formatPrice(shippingCost))}\n`;
    msg += `*TOTAL A ABONAR: ${formatPrice(total)}*\n\n`;

    if (paymentMethod === 'TRANSFERENCIA') {
      msg += `¡Hola! Confirmo este pedido. A continuación adjuntaré el comprobante de transferencia bancaria por ${formatPrice(total)}.`;
    } else {
      msg += `¡Hola! Confirmo este pedido. Abonaré con efectivo exacto al momento de ${deliveryMethod === 'PICKUP' ? 'retirar' : 'recibir'} el paquete.`;
    }
    
    const encodedMsg = encodeURIComponent(msg);
    // Número base extraído del Floating Widget configurado.
    window.open(`https://wa.me/5492216031496?text=${encodedMsg}`, '_blank');
    clearCart();
    toast.success('¡Redirigiendo a WhatsApp!', { style: { background: '#EBE9DD', color: '#1A1A1A', borderRadius: '2px', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em'} });
    toggleCart(false);
  };

  const handleCheckout = async () => {
    if (!name || !phone) {
       toast.error("Por favor completa tu nombre y WhatsApp.");
       return;
    }
    if (deliveryMethod === 'SHIPPING' && (!address || !coordinates)) {
       toast.error("Por favor ingresa tu dirección y ubícala en el mapa para el envío.");
       return;
    }

    // MercadoPago removido temporalmente por decisión de negocio.
    // Todos los cobros se delegan de forma segura 100% a WhatsApp.
    handleWhatsappCheckout();
    return;
    
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
        delivery: deliveryMethod === 'SHIPPING' 
          ? { address, lat: coordinates?.lat, lng: coordinates?.lng }
          : { address: 'A coordinar retiro por WhatsApp', lat: null, lng: null },
        isFreeShipping: deliveryMethod === 'PICKUP' ? true : isFreeShipping
      };

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Error al conectar con el servidor bancario.');
      }

      const data = await response.json();
      
      if (data.init_point) {
        // Redirigir al cliente a la bóveda encriptada de Mercado Pago
        window.location.href = data.init_point; 
      } else {
         throw new Error('No se pudo generar el enlace de pago seguro');
      }

    } catch (error: any) {
      console.error(error);
      toast.error('Hubo un problema procesando la orden: ' + error.message);
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
                          <p className={`text-[10px] md:text-[11px] font-sans tracking-widest mb-0 ${item.scent ? 'text-text-dark/80' : 'text-text-dark/60'}`}>{formatPrice(item.price)}</p>
                          
                          <div className="mt-2">
                            {item.stock === 0 ? (
                              <span className="inline-block border border-accent-2/60 bg-accent-2/10 text-accent-2 text-[8px] md:text-[9px] tracking-widest uppercase px-2 py-1 rounded-sm">Envase a pedido (Demora Mayor)</span>
                            ) : (
                              <span className="inline-block border border-text-dark/20 bg-transparent text-text-dark/60 text-[8px] md:text-[9px] tracking-widest uppercase px-2 py-1 rounded-sm">Armado en 24hs</span>
                            )}
                          </div>
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
                    <h3 className="text-xs font-sans tracking-widest uppercase text-text-dark/60 mb-2 mt-4">2. Método de Entrega</h3>
                    <div className="flex gap-4">
                      <button 
                        onClick={() => setDeliveryMethod('SHIPPING')}
                        className={`flex-1 py-3 text-[9px] md:text-[10px] font-sans tracking-widest uppercase rounded-sm border transition-colors ${deliveryMethod === 'SHIPPING' ? 'border-accent-2 bg-accent-2/10 text-accent-2' : 'border-text-dark/20 text-text-dark/60 hover:border-text-dark/40'}`}
                      >
                        Envío a Domicilio
                      </button>
                      <button 
                        onClick={() => setDeliveryMethod('PICKUP')}
                        className={`flex-1 py-3 text-[9px] md:text-[10px] font-sans tracking-widest uppercase rounded-sm border transition-colors ${deliveryMethod === 'PICKUP' ? 'border-accent-2 bg-accent-2/10 text-accent-2' : 'border-text-dark/20 text-text-dark/60 hover:border-text-dark/40'}`}
                      >
                        Punto de Retiro
                      </button>
                    </div>

                    {deliveryMethod === 'SHIPPING' ? (
                      <div className="space-y-4 animate-in fade-in duration-500 pt-2">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-xs font-sans tracking-widest uppercase text-text-dark/60">3. Datos de Envío</h3>
                          <MapPin size={16} className="text-accent-2" strokeWidth={1.5} />
                        </div>
                        <input 
                          type="text" placeholder="Dirección escrita (Calle, número, depto)" value={address} onChange={e => setAddress(e.target.value)}
                          className="w-full bg-transparent border-b border-text-dark/20 py-2 text-sm font-sans focus:outline-none focus:border-text-dark transition-colors placeholder:text-text-dark/30"
                        />
                        
                        <div className="pt-2">
                          <p className="text-[10px] font-sans tracking-wide text-text-dark/60 mb-3 leading-relaxed">
                            Mueve el mapa y haz click sobre tu casa para marcar el punto exacto al que debe llegar el repartidor.
                          </p>
                          <CheckoutMap onLocationSelect={(lat, lng) => setCoordinates({ lat, lng })} />
                        </div>
                      </div>
                    ) : (
                      <div className="pt-4 animate-in fade-in duration-500">
                        <div className="bg-accent-2/10 border border-accent-2/20 rounded-sm p-4 text-center">
                          <h4 className="text-[10px] md:text-xs font-heading tracking-widest uppercase text-text-dark mb-2">A coordinar por WhatsApp</h4>
                          <p className="text-[9px] md:text-[10px] font-sans text-text-dark/70 leading-relaxed">
                            Una vez efectuado el pago, nos pondremos en contacto a tu WhatsApp provisto para coordinar la entrega personal del producto en La Plata.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xs font-sans tracking-widest uppercase text-text-dark/60 mb-2 mt-8">4. Método de Pago</h3>
                    <div className="flex gap-4">
                      <button 
                        onClick={() => setPaymentMethod('TRANSFERENCIA')}
                        className={`flex-1 py-3 text-[9px] md:text-[10px] font-sans tracking-widest uppercase rounded-sm border transition-colors flex items-center justify-center gap-2 ${paymentMethod === 'TRANSFERENCIA' ? 'border-accent-2 bg-accent-2/10 text-accent-2' : 'border-text-dark/20 text-text-dark/60 hover:border-text-dark/40'}`}
                      >
                        Transferencia
                      </button>
                      <button 
                        onClick={() => setPaymentMethod('EFECTIVO')}
                        className={`flex-1 py-3 text-[9px] md:text-[10px] font-sans tracking-widest uppercase rounded-sm border transition-colors flex items-center justify-center gap-2 ${paymentMethod === 'EFECTIVO' ? 'border-accent-2 bg-accent-2/10 text-accent-2' : 'border-text-dark/20 text-text-dark/60 hover:border-text-dark/40'}`}
                      >
                        Efectivo
                      </button>
                    </div>

                    {paymentMethod === 'TRANSFERENCIA' && (
                      <div className="animate-in fade-in slide-in-from-top-2 duration-500 mt-4 bg-accent-2/5 border border-accent-2/20 p-4 rounded-sm">
                        <h4 className="text-[10px] md:text-xs font-heading tracking-widest uppercase text-text-dark mb-3">Datos Bancarios</h4>
                        <div className="space-y-2 text-[10px] md:text-[11px] font-sans text-text-dark/80">
                          <p><span className="font-semibold">Titular:</span> Maria Eugenia Pittatore</p>
                          <p><span className="font-semibold">CVU:</span> 0000003100037262012759</p>
                          <p><span className="font-semibold">Alias:</span> Tinavelasartesanales</p>
                        </div>
                        <p className="text-[9px] text-text-dark/60 mt-4 italic leading-relaxed">*Recuerda enviar el comprobante por WhatsApp una vez hecha la compra para confirmarla en nuestro sistema.*</p>
                      </div>
                    )}
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
                      <span>{deliveryMethod === 'PICKUP' ? 'A coordinar' : (isFreeShipping ? 'Bonificado' : formatPrice(shippingCost))}</span>
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
                    disabled={!name || !phone || (deliveryMethod === 'SHIPPING' && (!address || !coordinates)) || processing}
                    className={`w-full bg-[#25D366] text-white py-4 md:py-5 text-[10px] md:text-[11px] font-sans font-medium hover:brightness-110 disabled:opacity-50 transition-all duration-300 uppercase tracking-[0.25em] rounded-sm flex items-center justify-center space-x-2`}
                  >
                    {processing ? <Loader2 className="animate-spin" size={16} /> : null}
                    <span>Confirmar por WhatsApp</span>
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
