'use client';

import { Marker, Popup } from 'react-leaflet';
import { useEffect, useState } from 'react';

/**
 * Componente de marcador para un vecino en el mapa
 * Muestra un pin con popup de información al hacer clic
 */
export default function VecinoMarker({ vecino, onVerDetalles }) {
  const [L, setL] = useState(null);
  const [customIcon, setCustomIcon] = useState(null);

  useEffect(() => {
    // Cargar Leaflet solo en el cliente
    if (typeof window !== 'undefined') {
      const leaflet = require('leaflet');
      setL(leaflet);

      // Crear icono personalizado para vecinos
      const icon = new leaflet.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });
      setCustomIcon(icon);
    }
  }, []);

  if (!vecino.latitude || !vecino.longitude) {
    console.warn(`Vecino ${vecino.id} no tiene coordenadas`);
    return null;
  }

  if (!L || !customIcon) {
    return null; // Aún cargando Leaflet
  }

  const position = [vecino.latitude, vecino.longitude];

  return (
    <Marker position={position} icon={customIcon}>
      <Popup>
        <div className="vecino-popup" style={{ minWidth: '200px' }}>
          <h6 className="mb-2" style={{ color: '#154765', fontWeight: 600 }}>
            {vecino.nombres} {vecino.apellidos}
          </h6>

          <div className="mb-2">
            <small className="text-muted d-block">
              <i className="bi bi-geo-alt me-1"></i>
              {vecino.direccion}
            </small>
          </div>

          {vecino.rut && (
            <div className="mb-2">
              <small className="text-muted">
                <i className="bi bi-card-text me-1"></i>
                RUT: <code>{vecino.rut}</code>
              </small>
            </div>
          )}

          {vecino.email && (
            <div className="mb-2">
              <small className="text-muted d-block" style={{ wordBreak: 'break-all' }}>
                <i className="bi bi-envelope me-1"></i>
                {vecino.email}
              </small>
            </div>
          )}

          <div className="mb-2">
            <span className={`badge ${
              vecino.estado === 'activo' ? 'bg-success' :
              vecino.estado === 'pendiente_aprobacion' ? 'bg-warning text-dark' :
              'bg-secondary'
            }`}>
              {vecino.estado === 'activo' ? 'Activo' :
               vecino.estado === 'pendiente_aprobacion' ? 'Pendiente' :
               vecino.estado}
            </span>
          </div>

          {onVerDetalles && (
            <button
              className="btn btn-sm btn-primary w-100 mt-2"
              onClick={() => onVerDetalles(vecino)}
              style={{
                background: '#439fa4',
                border: 'none',
                borderRadius: '8px',
                padding: '0.375rem',
                fontSize: '0.875rem'
              }}
            >
              <i className="bi bi-eye me-1"></i>
              Ver Detalles
            </button>
          )}
        </div>
      </Popup>
    </Marker>
  );
}
