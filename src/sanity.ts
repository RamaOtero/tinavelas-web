import { createClient } from '@sanity/client';
import { createImageUrlBuilder } from '@sanity/image-url';

// Configuración del cliente para la cuenta recién creada de Tina Velas
export const sanityClient = createClient({
  projectId: 'zfea3bvu', // ID de tu proyecto Tina Velas Artesanales
  dataset: 'production', // Entorno de producción por defecto
  useCdn: true, // Usa la red de entrega de contenido para cargar todo rapidísimo
  apiVersion: '2024-03-18', // Fecha del estándar de la API de Sanity
});

const builder = createImageUrlBuilder(sanityClient);

// Función "mágica" para transformar las imágenes pesadas de Sanity en URLs optimizadas para la web
export function urlFor(source: any) {
  return builder.image(source);
}
