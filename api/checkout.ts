import { createClient } from '@sanity/client';

// Configurar cliente de lectura/escritura de Sanity (seguro, desde el backend)
const sanity = createClient({
  projectId: 'zfea3bvu',
  dataset: 'production',
  apiVersion: '2024-03-20',
  useCdn: false, // Siempre obtener datos en tiempo real al facturar
  token: process.env.SANITY_API_TOKEN // Token oficial requerido para escribir órdenes
});

export default async function handler(req: any, res: any) {
  // CORS Headers para Vite
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { items, customer, delivery, isFreeShipping, paymentMethod } = req.body;

    // Verificar llaves
    if (!process.env.SANITY_API_TOKEN) {
      throw new Error("ALERTA: Falta configurar SANITY_API_TOKEN en Vercel para auto-guardar órdenes.");
    }

    // 1. Traer el precio de envío de Sanity (Costo global maestro)
    const settings = await sanity.fetch(`*[_type == "siteSettings"][0]{ shippingCostLaPlata, freeShippingThreshold }`);
    const shippingCost = isFreeShipping ? 0 : (settings?.shippingCostLaPlata || 0);

    // 2. Validar los items cruzando con DB para imposibilitar hackeos de precio
    const backendItems = [];
    const itemIds = items.map((i: any) => i.id);
    const sanityProducts = await sanity.fetch(`*[_id in $ids]{ _id, name, priceNumber }`, { ids: itemIds });

    let calculatedProductTotal = 0;

    for (const item of items) {
      const dbProduct = sanityProducts.find((p: any) => p._id === item.id);
      if (!dbProduct) throw new Error(`Error de validación: El producto ${item.name} ha sido alterado o ya no existe.`);

      calculatedProductTotal += (dbProduct.priceNumber * item.quantity);

      backendItems.push({
        _key: Math.random().toString(36).substring(7), // Requerido por arreglos de Sanity
        name: item.name, 
        quantity: item.quantity,
        price: dbProduct.priceNumber
      });
    }

    const finalTotalAmount = calculatedProductTotal + shippingCost;

    // 3. Escribir la Orden de Compra oficial directo a la Base de Datos
    const newOrder = {
      _type: 'order',
      orderId: `MANUAL-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      customerName: customer.name,
      customerPhone: customer.phone,
      deliveryAddress: delivery.address,
      ...(delivery.lat && delivery.lng ? {
        deliveryCoordinates: {
          _type: 'geopoint',
          lat: delivery.lat,
          lng: delivery.lng
        }
      } : {}),
      items: backendItems,
      totalAmount: finalTotalAmount,
      status: paymentMethod === 'TRANSFERENCIA' ? 'pending_transfer' : 'pending_cash'
    };

    const createdOrder = await sanity.create(newOrder);

    // 4. Devolver confirmación a React para que dispare el WhatsApp
    res.status(200).json({ 
      success: true,
      orderId: createdOrder._id 
    });

  } catch (error: any) {
    console.error('SERVER CATCH:', error);
    res.status(500).json({ error: error.message || 'Fallo de registro de encargo' });
  }
}

