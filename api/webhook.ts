import { MercadoPagoConfig, Payment } from 'mercadopago';
import { createClient } from '@sanity/client';

// Configurar cliente de Sanity PRIVADO con token de escritura
const sanity = createClient({
  projectId: 'zfea3bvu',
  dataset: 'production',
  apiVersion: '2024-03-20',
  token: process.env.SANITY_SECRET_TOKEN, // Se aloja en Vercel Env Vars para no exponerlo en Github
  useCdn: false,
});

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

  try {
    const { action, type, data } = req.body;
    
    // A Mercado Pago le gusta enviar "action" o "type" como aviso de creación de pago.
    if ((type === 'payment' || action === 'payment.created') && data && data.id) {
      if (!process.env.MP_ACCESS_TOKEN) throw new Error("Missing MP Token");

      const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });
      const paymentAPI = new Payment(client);
      
      // Consultar la propia plataforma bancaria de Mercado Pago para evitar fraudes en el webhook
      const paymentInfo = await paymentAPI.get({ id: data.id });
      
      if (paymentInfo.status === 'approved') {
        const meta = paymentInfo.metadata || {};
        const items = paymentInfo.additional_info?.items || [];
        
        // 1. Guardar la Orden Definitiva en el panel de Sanity (Libro Mayor)
        await sanity.create({
          _type: 'order',
          orderId: String(paymentInfo.id),
          customerName: paymentInfo.payer?.first_name || 'Comprador Verificado',
          customerPhone: (paymentInfo.payer?.phone?.area_code || '') + (paymentInfo.payer?.phone?.number || ''),
          deliveryAddress: meta.delivery_address || 'Sin especificar',
          deliveryCoordinates: meta.delivery_lat ? {
            _type: 'geopoint',
            lat: Number(meta.delivery_lat),
            lng: Number(meta.delivery_lng)
          } : undefined,
          totalAmount: paymentInfo.transaction_amount,
          status: 'paid', // Aparece como cobrado en el panel CMS
          items: items.map((i: any) => ({
             _key: i.id + Math.random().toString(36).substring(7),
             name: i.title,
             quantity: Number(i.quantity),
             price: Number(i.unit_price)
          }))
        });

        // 2. Control Inteligente de Stock
        // Descontamos físicamente cada vela o accesorio comprado de la estantería general en Sanity.
        for (const item of items) {
          if (item.id === 'envio_la_plata') continue; // El envío no tiene stock
          
          try {
            await sanity.patch(item.id).dec({ stock: Number(item.quantity) }).commit();
          } catch (e) {
            console.error(`Error descontando stock del ítem ${item.id}`, e);
          }
        }
      }
    }

    // Mercado Pago requiere una respuesta 200/201 inmediata confirmando recepción
    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('WEBHOOK ERROR:', error);
    return res.status(500).json({ error: 'Webhook handler failed' });
  }
}
