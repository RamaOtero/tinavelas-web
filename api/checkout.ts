import { MercadoPagoConfig, Preference } from 'mercadopago';
import { createClient } from '@sanity/client';

// Configurar cliente de lectura de Sanity (seguro, desde el backend)
const sanity = createClient({
  projectId: 'zfea3bvu',
  dataset: 'production',
  apiVersion: '2024-03-20',
  useCdn: false, // Siempre obtener datos en tiempo real al facturar
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
    const { items, customer, delivery, isFreeShipping } = req.body;

    // 1. Configurar Mercado Pago usando la llave que estará encriptada en Vercel
    if (!process.env.MP_ACCESS_TOKEN) {
      throw new Error("Falta el TOKEN de acceso de Mercado Pago en Vercel");
    }

    const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });

    // 2. Traer el precio de envío de Sanity (Costo global maestro)
    const settings = await sanity.fetch(`*[_type == "siteSettings"][0]{ shippingCostLaPlata, freeShippingThreshold }`);
    const shippingCost = isFreeShipping ? 0 : (settings?.shippingCostLaPlata || 0);

    // 3. Validar los items armando un array para Mercado Pago
    const backendItems = [];
    
    // Consultar Sanity para verificar precios in-hackeables
    // Recolectar Candle IDs
    const itemIds = items.map((i: any) => i.id);
    
    // Hacemos una búsqueda para todas las ceras y accesorios que tengan esos IDs.
    const sanityProducts = await sanity.fetch(`*[_id in $ids]{ _id, name, priceNumber }`, { ids: itemIds });

    for (const item of items) {
      // Cruzar datos de forma segura
      const dbProduct = sanityProducts.find((p: any) => p._id === item.id);
      
      if (!dbProduct) throw new Error(`El producto ${item.name} ya no existe.`);

      backendItems.push({
        id: dbProduct._id,
        title: dbProduct.name,
        currency_id: 'ARS',
        picture_url: item.image, // URL generada desde el front
        category_id: 'home',
        quantity: item.quantity,
        unit_price: dbProduct.priceNumber // NUNCA CONFIAMOS EN EL FRONTEND. USAMOS EL PRECIO DB.
      });
    }

    // 4. Agregar costo de envío como un Ítem separado oficial de Mercado Pago
    if (shippingCost > 0) {
      backendItems.push({
        id: 'envio_la_plata',
        title: 'Envío Privado en La Plata',
        currency_id: 'ARS',
        unit_price: shippingCost,
        quantity: 1,
      });
    }

    // 5. Crear la Obligación (Preferencia de Pago) en Mercado Pago
    const preference = new Preference(client);
    
    // Registramos en metadatos para que nuestra Base de Datos conecte el envío luego.
    const body: any = {
      items: backendItems,
      payer: {
        name: customer.name,
        phone: {
          area_code: "54",
          number: customer.phone
        }
      },
      back_urls: {
        success: 'https://tinavelas.com/?status=success',
        failure: 'https://tinavelas.com/?status=failure',
        pending: 'https://tinavelas.com/?status=pending',
      },
      auto_return: 'approved',
      metadata: {
        delivery_address: delivery.address,
        delivery_lat: delivery.lat,
        delivery_lng: delivery.lng
      }
    };

    const response = await preference.create({ body });

    // 6. Devolver el enlace de la bóveda (init_point) a la aplicación React
    res.status(200).json({ 
      id: response.id,
      init_point: response.init_point 
    });

  } catch (error: any) {
    console.error('SERVER CATCH:', error);
    res.status(500).json({ error: error.message || 'Error en validación bancaria' });
  }
}
