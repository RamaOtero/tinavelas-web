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

function LocationMarker({ onSelect, bounds }: { onSelect: (lat: number, lng: number) => void, bounds: L.LatLngBounds }) {
  const [position, setPosition] = useState<L.LatLng | null>(null);

  useMapEvents({
    click(e) {
      if (bounds.contains(e.latlng)) {
        setPosition(e.latlng);
        onSelect(e.latlng.lat, e.latlng.lng);
      } else {
        toast.error('Fuera de zona: Solo entregamos dentro del área céntrica.', { style: { background: '#ef4444', color: '#ffffff', borderRadius: '2px', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em'} });
      }
    },
  });

  return position === null ? null : <Marker position={position}></Marker>;
}

export default function CheckoutMap({ onLocationSelect }: MapProps) {
  // Centro por defecto: Plaza Moreno, La Plata
  const center: [number, number] = [-34.9205, -57.9536];
  
  // Limitar el mapa exclusivamente al "Casco Urbano" (Cuadrado de La Plata)
  const cascoUrbanoBounds: L.LatLngBoundsExpression = [
    [-34.945, -57.995], // Sudoeste (pasando la 72 y 31)
    [-34.890, -57.915]  // Noreste (pasando la 32 y 120)
  ];

  const boundsObj = L.latLngBounds(cascoUrbanoBounds);

  // Hueco transparente (Casco Urbano)
  const innerHole: [number, number][] = [
    [-34.945, -57.995],
    [-34.890, -57.995],
    [-34.890, -57.915],
    [-34.945, -57.915]
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
        {/* Usamos boundsObj para validar el click internamente */}
        <LocationMarker onSelect={onLocationSelect} bounds={boundsObj} />
      </MapContainer>
    </div>
  );
}
