'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import MapContainer from './MapContainer';
import VecinoMarker from './VecinoMarker';

// Importar MarkerClusterGroup dinámicamente para evitar problemas de SSR
const MarkerClusterGroup = dynamic(
  () => import('react-leaflet-cluster'),
  { ssr: false }
);

/**
 * Mapa general que muestra todos los vecinos del barrio
 * Permite ver la distribución geográfica de los vecinos
 * Incluye clustering para agrupar marcadores cercanos
 */
export default function MapaGeneral({ vecinos, onVerDetalles }) {
  const [center, setCenter] = useState([-33.4489, -70.6693]); // Santiago por defecto
  const [zoom, setZoom] = useState(13);

  // Calcular el centro del mapa basándose en los vecinos con coordenadas
  useEffect(() => {
    console.log('🗺️ MapaGeneral - Recalculando centro con', vecinos.length, 'vecinos');
    const vecinosConCoordenadas = vecinos.filter(v => v.latitude && v.longitude);
    console.log('📍 Vecinos con coordenadas:', vecinosConCoordenadas.length);

    if (vecinosConCoordenadas.length === 0) {
      console.warn('⚠️ No hay vecinos con coordenadas para mostrar en el mapa');
      return;
    }

    // Calcular el centro promedio
    const sumLat = vecinosConCoordenadas.reduce((sum, v) => sum + v.latitude, 0);
    const sumLng = vecinosConCoordenadas.reduce((sum, v) => sum + v.longitude, 0);

    const avgLat = sumLat / vecinosConCoordenadas.length;
    const avgLng = sumLng / vecinosConCoordenadas.length;

    setCenter([avgLat, avgLng]);

    // Ajustar zoom basándose en la dispersión de los puntos
    const latitudes = vecinosConCoordenadas.map(v => v.latitude);
    const longitudes = vecinosConCoordenadas.map(v => v.longitude);

    const latRange = Math.max(...latitudes) - Math.min(...latitudes);
    const lngRange = Math.max(...longitudes) - Math.min(...longitudes);
    const maxRange = Math.max(latRange, lngRange);

    // Calcular zoom apropiado (más dispersión = menos zoom)
    if (maxRange > 0.1) {
      setZoom(11);
    } else if (maxRange > 0.05) {
      setZoom(12);
    } else if (maxRange > 0.02) {
      setZoom(13);
    } else {
      setZoom(14);
    }

  }, [vecinos]);

  const vecinosConCoordenadas = vecinos.filter(v => v.latitude && v.longitude);
  const vecinosSinCoordenadas = vecinos.filter(v => !v.latitude || !v.longitude);

  // Generar key única basada en los IDs de vecinos con coordenadas
  // Esto fuerza el re-render del mapa cuando cambian los vecinos
  const mapKey = vecinosConCoordenadas.map(v => v.id).sort().join('-') || 'empty';

  return (
    <div className="mapa-general-container">
      {/* Estadísticas del mapa */}
      <div className="map-stats mb-3" style={{
        display: 'flex',
        gap: '1rem',
        flexWrap: 'wrap'
      }}>
        <div className="stat-badge" style={{
          background: '#e3f2fd',
          padding: '0.5rem 1rem',
          borderRadius: '8px',
          fontSize: '0.875rem'
        }}>
          <i className="bi bi-geo-alt-fill text-primary me-2"></i>
          <strong>{vecinosConCoordenadas.length}</strong> vecinos en el mapa
        </div>

        {vecinosSinCoordenadas.length > 0 && (
          <div className="stat-badge" style={{
            background: '#fff3cd',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            fontSize: '0.875rem'
          }}>
            <i className="bi bi-exclamation-triangle-fill text-warning me-2"></i>
            <strong>{vecinosSinCoordenadas.length}</strong> sin coordenadas
          </div>
        )}
      </div>

      {/* Mapa interactivo */}
      {vecinosConCoordenadas.length > 0 ? (
        <MapContainer
          key={mapKey}
          center={center}
          zoom={zoom}
          style={{ height: '600px' }}
        >
          <MarkerClusterGroup
            chunkedLoading
            maxClusterRadius={60}
            spiderfyOnMaxZoom={true}
            showCoverageOnHover={false}
            zoomToBoundsOnClick={true}
            iconCreateFunction={(cluster) => {
              const count = cluster.getChildCount();
              let size = 'small';
              let colorClass = 'cluster-small';

              if (count > 10) {
                size = 'large';
                colorClass = 'cluster-large';
              } else if (count > 5) {
                size = 'medium';
                colorClass = 'cluster-medium';
              }

              return new L.DivIcon({
                html: `<div class="custom-cluster-icon ${colorClass}"><span>${count}</span></div>`,
                className: 'custom-cluster',
                iconSize: L.point(40, 40, true),
              });
            }}
          >
            {vecinosConCoordenadas.map(vecino => (
              <VecinoMarker
                key={vecino.id}
                vecino={vecino}
                onVerDetalles={onVerDetalles}
              />
            ))}
          </MarkerClusterGroup>
        </MapContainer>
      ) : (
        <div className="empty-map" style={{
          width: '100%',
          height: '400px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f4f8f9',
          borderRadius: '12px',
          border: '2px solid #bfd3d9',
          textAlign: 'center',
          padding: '2rem'
        }}>
          <div>
            <i className="bi bi-map" style={{ fontSize: '3rem', color: '#bfd3d9' }}></i>
            <h5 className="mt-3" style={{ color: '#154765' }}>No hay vecinos para mostrar en el mapa</h5>
            <p className="text-muted">
              Los vecinos necesitan tener coordenadas geográficas para aparecer en el mapa.
              Las coordenadas se obtienen automáticamente de sus direcciones.
            </p>
          </div>
        </div>
      )}

      {/* Lista de vecinos sin coordenadas */}
      {vecinosSinCoordenadas.length > 0 && (
        <div className="alert alert-warning mt-3">
          <h6 className="alert-heading">
            <i className="bi bi-exclamation-triangle me-2"></i>
            Vecinos sin ubicación en el mapa
          </h6>
          <p className="mb-2">
            Los siguientes vecinos no pueden mostrarse en el mapa porque no tienen coordenadas:
          </p>
          <ul className="mb-0" style={{ fontSize: '0.875rem' }}>
            {vecinosSinCoordenadas.slice(0, 5).map(vecino => (
              <li key={vecino.id}>
                <strong>{vecino.nombres} {vecino.apellidos}</strong> - {vecino.direccion}
              </li>
            ))}
            {vecinosSinCoordenadas.length > 5 && (
              <li className="text-muted">
                ...y {vecinosSinCoordenadas.length - 5} más
              </li>
            )}
          </ul>
          <small className="text-muted mt-2 d-block">
            <i className="bi bi-info-circle me-1"></i>
            Las coordenadas se obtienen automáticamente al abrir los detalles de cada vecino.
          </small>
        </div>
      )}
    </div>
  );
}
