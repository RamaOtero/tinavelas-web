import { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, Polygon } from 'react-leaflet';
import { toast } from 'react-hot-toast';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix internal React-Leaflet icon rendering bugs with Webpack/Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface MapProps {
  onLocationSelect: (lat: number, lng: number) => void;
}

// Algoritmo de "Ray Casting" para determinar si un punto exacto cayó dentro del perímetro romboidal
const isPointInPolygon = (lat: number, lng: number, polygon: [number, number][]) => {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0], yi = polygon[i][1];
    const xj = polygon[j][0], yj = polygon[j][1];
    const intersect = ((yi > lng) !== (yj > lng)) && (lat < (xj - xi) * (lng - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
};

function LocationMarker({ onSelect, polygonArea }: { onSelect: (lat: number, lng: number) => void, polygonArea: [number, number][] }) {
  const [position, setPosition] = useState<L.LatLng | null>(null);

  useMapEvents({
    click(e) {
      if (isPointInPolygon(e.latlng.lat, e.latlng.lng, polygonArea)) {
        setPosition(e.latlng);
        onSelect(e.latlng.lat, e.latlng.lng);
      } else {
        toast.error('Fuera de zona: Solo entregamos dentro del rectángulo de Avenidas 32 a 72 y 31 a 122.', { style: { background: '#ef4444', color: '#ffffff', borderRadius: '2px', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em'} });
      }
    },
  });

  return position === null ? null : <Marker position={position}></Marker>;
}

export default function CheckoutMap({ onLocationSelect }: MapProps) {
  // Centro por defecto: Plaza Moreno, La Plata
  const center: [number, number] = [-34.9205, -57.9536];
  
  // Limitar el mapa exclusivamente al "Casco Urbano" (Cuadrado de La Plata)
  // Limitar el mapa exclusivamente al "Casco Urbano" (Cuadrado de La Plata)
  const cascoUrbanoBounds: L.LatLngBoundsExpression = [
    [-34.955, -58.005], // Sudoeste (margen exterior general)
    [-34.885, -57.910]  // Noreste (margen exterior general)
  ];

  // Hueco transparente de la Circunvalación (Dirección Anti-horaria para crear el hueco real SVG)
  const innerHole: [number, number][] = [
    [-34.8973, -57.9620], // Norte (Av. 32 y 120)
    [-34.9080, -57.9902], // Oeste (Av. 32 y 31)
    [-34.9431, -57.9566], // Sur (Av. 72 y 31)
    [-34.9351, -57.9242]  // Este (Av. 72 y 120)
  ];

  // Máscara gigante para tapar el resto del mundo
  const outerWorld: [number, number][] = [
    [-90, -180],
    [90, -180],
    [90, 180],
    [-90, 180]
  ];

  return (
    <div className="w-full h-48 md:h-56 bg-accent-1/20 rounded-sm relative overflow-hidden ring-1 ring-accent-2/20">
      {/* Es imperativo que el z-index del mapa sea 0 para que no rompa el drawer de UI superior */}
      <MapContainer 
        center={center} 
        zoom={13} 
        minZoom={12}
        scrollWheelZoom={true} 
        maxBounds={cascoUrbanoBounds}
        maxBoundsViscosity={1.0}
        className="w-full h-full z-0"
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        <Polygon 
          positions={[outerWorld, innerHole]} 
          pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.15, stroke: false }} 
        />
        {/* Usamos el array geométrico para validar el click internamente */}
        <LocationMarker onSelect={onLocationSelect} polygonArea={innerHole} />
      </MapContainer>
    </div>
  );
}
