'use client';

import { useState, useEffect } from 'react';
import MapContainer from './MapContainer';
import VecinoMarker from './VecinoMarker';
import { geocodificarDireccion } from '@/lib/geocoding/nominatim';
import { createClient } from '@/lib/supabase/client';

/**
 * Mapa detallado para un vecino individual
 * Se muestra en el modal de detalles
 * Incluye geocodificación automática si no hay coordenadas
 */
export default function MapaDetalle({ vecino, onCoordenadasActualizadas }) {
  const [coordenadas, setCoordenadas] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [geocodificando, setGeocodificando] = useState(false);

  useEffect(() => {
    // Verificar si el vecino ya tiene coordenadas
    if (vecino.latitude && vecino.longitude) {
      setCoordenadas({
        lat: vecino.latitude,
        lng: vecino.longitude
      });
    } else {
      // Si no tiene coordenadas, intentar geocodificar automáticamente
      geocodificarAutomaticamente();
    }
  }, [vecino]);

  const geocodificarAutomaticamente = async () => {
    if (!vecino.direccion) {
      setError('No hay dirección disponible para geocodificar');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log(`🌍 Geocodificando dirección: ${vecino.direccion}`);

      const resultado = await geocodificarDireccion(vecino.direccion);

      if (resultado) {
        setCoordenadas(resultado);

        // Guardar coordenadas en la base de datos
        await guardarCoordenadas(resultado.lat, resultado.lng);

        console.log('✅ Coordenadas obtenidas y guardadas');
      } else {
        setError('No se pudo encontrar la ubicación para esta dirección');
      }
    } catch (err) {
      console.error('❌ Error al geocodificar:', err);
      setError('Error al obtener la ubicación');
    } finally {
      setLoading(false);
    }
  };

  const guardarCoordenadas = async (lat, lng) => {
    const supabase = createClient();

    try {
      const { error } = await supabase
        .from('usuarios')
        .update({
          latitude: lat,
          longitude: lng,
          geocoded_at: new Date().toISOString()
        })
        .eq('id', vecino.id);

      if (error) throw error;

      // Notificar al componente padre si existe callback
      if (onCoordenadasActualizadas) {
        onCoordenadasActualizadas(vecino.id, lat, lng);
      }
    } catch (err) {
      console.error('Error al guardar coordenadas:', err);
    }
  };

  const handleActualizarUbicacion = async () => {
    setGeocodificando(true);
    await geocodificarAutomaticamente();
    setGeocodificando(false);
  };

  if (loading) {
    return (
      <div className="map-loading" style={{
        width: '100%',
        height: '300px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f4f8f9',
        borderRadius: '12px',
        border: '2px solid #bfd3d9'
      }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-2" role="status">
            <span className="visually-hidden">Buscando ubicación...</span>
          </div>
          <p className="text-muted">Buscando ubicación en el mapa...</p>
          <small className="text-muted">Esto puede tomar unos segundos</small>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="map-error" style={{
        width: '100%',
        height: '300px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#fff3cd',
        borderRadius: '12px',
        border: '2px solid #ffc107',
        padding: '2rem',
        textAlign: 'center'
      }}>
        <div>
          <i className="bi bi-exclamation-triangle-fill text-warning" style={{ fontSize: '2rem' }}></i>
          <h6 className="mt-3" style={{ color: '#154765' }}>No se pudo cargar el mapa</h6>
          <p className="text-muted mb-3">{error}</p>
          <button
            className="btn btn-warning btn-sm"
            onClick={handleActualizarUbicacion}
            disabled={geocodificando}
          >
            {geocodificando ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Intentando...
              </>
            ) : (
              <>
                <i className="bi bi-arrow-repeat me-2"></i>
                Reintentar
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  if (!coordenadas) {
    return (
      <div className="map-loading" style={{
        width: '100%',
        height: '300px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f4f8f9',
        borderRadius: '12px',
        border: '2px solid #bfd3d9'
      }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  const vecinoConCoordenadas = {
    ...vecino,
    latitude: coordenadas.lat,
    longitude: coordenadas.lng
  };

  return (
    <div className="mapa-detalle-container">
      {/* Header con información */}
      <div className="mb-3 d-flex justify-content-between align-items-center">
        <div>
          <h6 className="mb-1" style={{ color: '#154765' }}>
            <i className="bi bi-geo-alt-fill me-2 text-primary"></i>
            Ubicación en el Mapa
          </h6>
          <small className="text-muted">
            {coordenadas.display_name || vecino.direccion}
          </small>
        </div>
        <button
          className="btn btn-outline-primary btn-sm"
          onClick={handleActualizarUbicacion}
          disabled={geocodificando}
          title="Actualizar ubicación desde la dirección"
        >
          {geocodificando ? (
            <span className="spinner-border spinner-border-sm"></span>
          ) : (
            <i className="bi bi-arrow-repeat"></i>
          )}
        </button>
      </div>

      {/* Mapa */}
      <MapContainer
        center={[coordenadas.lat, coordenadas.lng]}
        zoom={16}
        style={{ height: '300px' }}
      >
        <VecinoMarker vecino={vecinoConCoordenadas} />
      </MapContainer>

      {/* Footer con info adicional */}
      <div className="mt-2">
        <small className="text-muted">
          <i className="bi bi-info-circle me-1"></i>
          Coordenadas: {coordenadas.lat.toFixed(6)}, {coordenadas.lng.toFixed(6)}
        </small>
      </div>
    </div>
  );
}
