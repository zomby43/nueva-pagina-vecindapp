'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

/**
 * Componente base de mapa con carga dinámica
 *
 * Leaflet requiere window, por lo que debe cargarse solo en el cliente.
 * Este componente maneja la carga dinámica y evita errores de SSR.
 */

// Importar dinámicamente Leaflet solo en el cliente
const MapComponent = dynamic(
  () => import('./MapComponentClient'),
  {
    ssr: false,
    loading: () => (
      <div className="map-loading" style={{
        width: '100%',
        height: '400px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f4f8f9',
        borderRadius: '12px',
        border: '2px solid #bfd3d9'
      }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-2" role="status">
            <span className="visually-hidden">Cargando mapa...</span>
          </div>
          <p className="text-muted">Cargando mapa interactivo...</p>
        </div>
      </div>
    )
  }
);

export default function MapContainer({ children, center, zoom = 13, style, className }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="map-loading" style={{
        width: '100%',
        height: '400px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f4f8f9',
        borderRadius: '12px',
        border: '2px solid #bfd3d9'
      }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-2" role="status">
            <span className="visually-hidden">Cargando mapa...</span>
          </div>
          <p className="text-muted">Inicializando mapa...</p>
        </div>
      </div>
    );
  }

  return (
    <MapComponent
      center={center}
      zoom={zoom}
      style={style}
      className={className}
    >
      {children}
    </MapComponent>
  );
}
