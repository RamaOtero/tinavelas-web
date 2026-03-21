import { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
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

function LocationMarker({ onSelect }: { onSelect: (lat: number, lng: number) => void }) {
  const [position, setPosition] = useState<L.LatLng | null>(null);

  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onSelect(e.latlng.lat, e.latlng.lng);
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
        <LocationMarker onSelect={onLocationSelect} />
      </MapContainer>
    </div>
  );
}
