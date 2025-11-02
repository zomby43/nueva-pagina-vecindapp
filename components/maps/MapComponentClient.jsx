'use client';

import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';

/**
 * Componente interno del mapa que solo se carga en el cliente
 * Separado para evitar problemas de SSR con Leaflet
 */
export default function MapComponentClient({ children, center, zoom, style, className }) {
  useEffect(() => {
    // Fix para los iconos de Leaflet en Next.js
    // Los iconos no se cargan correctamente por defecto
    if (typeof window !== 'undefined') {
      const L = require('leaflet');
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });
    }
  }, []);

  const defaultStyle = {
    width: '100%',
    height: '400px',
    borderRadius: '12px',
    border: '2px solid #bfd3d9',
    zIndex: 0,
    ...style
  };

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={defaultStyle}
      className={className}
      scrollWheelZoom={true}
    >
      {/* OpenStreetMap Tiles */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {children}
    </MapContainer>
  );
}
