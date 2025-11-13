'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';

export default function MapaPage() {
  const { user, userProfile } = useAuth();
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConfiguracion();
  }, []);

  const fetchConfiguracion = async () => {
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from('configuracion_organizacion')
        .select('*')
        .limit(1)
        .single();

      if (data) {
        setConfig(data);
      }
    } catch (error) {
      console.error('Error al cargar configuración:', error);
    } finally {
      setLoading(false);
    }
  };

  // Lugares de interés (estos podrían venir de la BD en el futuro)
  const locations = [
    {
      id: 1,
      name: config?.nombre_organizacion || "Junta de Vecinos",
      type: "gobierno",
      address: config?.direccion || "Dirección no disponible",
      description: "Sede de la Junta de Vecinos",
      distance: "5 min caminando"
    },
    {
      id: 2,
      name: "Centro de Salud",
      type: "salud",
      address: "Información próximamente",
      description: "Consultorio médico del barrio",
      distance: "3 min caminando"
    },
    {
      id: 3,
      name: "Escuela Básica",
      type: "educacion",
      address: "Información próximamente",
      description: "Escuela pública del sector",
      distance: "8 min caminando"
    },
    {
      id: 4,
      name: "Comisaría",
      type: "seguridad",
      address: "Información próximamente",
      description: "Estación de policía local",
      distance: "6 min caminando"
    }
  ];

  const handleLocationClick = (location) => {
    setSelectedLocation(location);
  };

  // Construir dirección completa del usuario
  const userAddress = userProfile?.direccion || 'Dirección no disponible';
  const userName = userProfile
    ? `${userProfile.nombres} ${userProfile.apellidos}`
    : 'Usuario';
  const userComuna = config?.comuna || '';
  const userRegion = config?.region || '';

  if (loading) {
    return (
      <div style={{ width: '100%', maxWidth: '100%', padding: '2rem', background: '#f4f8f9', borderRadius: '16px' }}>
        <div className="text-center py-5">
          <div className="spinner-border mb-3" role="status"></div>
          <p>Cargando mapa...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', maxWidth: '100%', padding: '2rem', background: '#f4f8f9', borderRadius: '16px' }}>
      <div className="mb-4 vecino-page-header">
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
          <div>
            <h1 className="fw-bold mb-2">
              <i className="bi bi-map me-2"></i>Mapa de la Comunidad
            </h1>
            <p className="text-muted mb-0 vecino-text-base">Visualiza tu ubicación y conoce tu comunidad</p>
          </div>
          <button
            className="btn btn-outline-primary vecino-btn"
            onClick={() => setShowFilters(!showFilters)}
          >
            <i className="bi bi-funnel me-2"></i>
            {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
          </button>
        </div>
      </div>

      {/* Filtros colapsables */}
      {showFilters && (
        <div className="card shadow-sm border-0 mb-4 vecino-card">
          <div className="card-body">
            <h6 className="fw-bold mb-3 vecino-text-base">Filtrar por categoría:</h6>
            <div className="d-flex flex-wrap gap-3 vecino-btn-group">
              <button className="btn btn-primary vecino-btn">
                <i className="bi bi-check-circle me-1"></i>Todos
              </button>
              <button className="btn btn-outline-secondary vecino-btn">
                <i className="bi bi-building me-1"></i>Gobierno
              </button>
              <button className="btn btn-outline-success vecino-btn">
                <i className="bi bi-hospital me-1"></i>Salud
              </button>
              <button className="btn btn-outline-warning vecino-btn">
                <i className="bi bi-mortarboard me-1"></i>Educación
              </button>
              <button className="btn btn-outline-danger vecino-btn">
                <i className="bi bi-shield-check me-1"></i>Seguridad
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="row g-4">
        {/* Mapa principal */}
        <div className="col-lg-8">
          <div className="card shadow-sm border-0" style={{ height: '600px', position: 'relative' }}>
            <iframe
              src="https://www.openstreetmap.org/export/embed.html?bbox=-70.75%2C-33.6%2C-70.55%2C-33.4&layer=mapnik&marker=-33.45%2C-70.65"
              style={{
                border: 'none',
                width: '100%',
                height: '100%',
                borderRadius: '12px'
              }}
              title="Mapa interactivo de la comunidad"
            ></iframe>

            {/* Indicador de ubicación actual */}
            <div style={{
              position: 'absolute',
              top: '1rem',
              left: '1rem',
              background: 'white',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              maxWidth: '300px'
            }}>
              <div style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: '#4CAF50',
                boxShadow: '0 0 0 4px rgba(76, 175, 80, 0.2)',
                animation: 'pulse 2s infinite'
              }}></div>
              <div style={{ flex: 1 }}>
                <strong style={{ fontSize: '0.875rem', display: 'block' }}>Tu ubicación</strong>
                <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                  {userAddress}
                </small>
              </div>
            </div>
          </div>
        </div>

        {/* Panel lateral con información */}
        <div className="col-lg-4">
          <div className="d-flex flex-column gap-3">
            {/* Mi ubicación */}
            <div className="card shadow-sm border-0">
              <div className="card-header bg-light">
                <h6 className="mb-0 fw-bold">
                  <i className="bi bi-geo-alt-fill text-primary me-2"></i>
                  Mi Ubicación
                </h6>
              </div>
              <div className="card-body">
                <div className="mb-2">
                  <strong className="d-block mb-1">{userName}</strong>
                  <small className="text-muted d-block">{userAddress}</small>
                  {(userComuna || userRegion) && (
                    <small className="text-muted d-block">
                      {userComuna}{userComuna && userRegion ? ', ' : ''}{userRegion}
                    </small>
                  )}
                </div>
              </div>
            </div>

            {/* Lugares cercanos */}
            <div className="card shadow-sm border-0">
              <div className="card-header bg-light">
                <h6 className="mb-0 fw-bold">
                  <i className="bi bi-building text-primary me-2"></i>
                  Lugares Cercanos
                </h6>
              </div>
              <div className="card-body p-0">
                <div className="list-group list-group-flush">
                  {locations.map((location) => (
                    <button
                      key={location.id}
                      className={`list-group-item list-group-item-action ${selectedLocation?.id === location.id ? 'active' : ''}`}
                      onClick={() => handleLocationClick(location)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="d-flex align-items-start gap-2">
                        <div style={{ fontSize: '1.5rem', marginTop: '-2px' }}>
                          {location.type === 'gobierno' && <i className="bi bi-building"></i>}
                          {location.type === 'salud' && <i className="bi bi-hospital"></i>}
                          {location.type === 'educacion' && <i className="bi bi-mortarboard"></i>}
                          {location.type === 'seguridad' && <i className="bi bi-shield-check"></i>}
                        </div>
                        <div className="flex-grow-1">
                          <h6 className="mb-1">{location.name}</h6>
                          <p className="mb-1 small">{location.address}</p>
                          <small className="text-success">
                            <i className="bi bi-clock me-1"></i>
                            {location.distance}
                          </small>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Información del lugar seleccionado */}
            {selectedLocation && (
              <div className="card shadow-sm border-0 border-primary" style={{ borderWidth: '2px !important' }}>
                <div className="card-header bg-primary text-white">
                  <h6 className="mb-0 fw-bold">
                    <i className="bi bi-pin-map-fill me-2"></i>
                    {selectedLocation.name}
                  </h6>
                </div>
                <div className="card-body">
                  <p className="text-muted small mb-2">
                    <i className="bi bi-geo-alt me-1"></i>
                    {selectedLocation.address}
                  </p>
                  <p className="small mb-3">{selectedLocation.description}</p>
                  <div className="d-grid gap-2">
                    <button className="btn btn-primary btn-sm">
                      <i className="bi bi-geo-alt me-1"></i>
                      Cómo llegar
                    </button>
                    <button className="btn btn-outline-primary btn-sm">
                      <i className="bi bi-telephone me-1"></i>
                      Contactar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Información adicional en la parte inferior */}
      <div className="row g-3 mt-3">
        <div className="col-md-6">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h6 className="fw-bold mb-3">
                <i className="bi bi-speedometer2 text-primary me-2"></i>
                Distancias Aproximadas
              </h6>
              <ul className="list-unstyled small mb-0">
                <li className="mb-2">
                  <i className="bi bi-building me-2 text-muted"></i>
                  Junta de Vecinos: <strong>5 min</strong>
                </li>
                <li className="mb-2">
                  <i className="bi bi-hospital me-2 text-muted"></i>
                  Centro de Salud: <strong>3 min</strong>
                </li>
                <li className="mb-2">
                  <i className="bi bi-mortarboard me-2 text-muted"></i>
                  Escuela: <strong>8 min</strong>
                </li>
                <li>
                  <i className="bi bi-shield-check me-2 text-muted"></i>
                  Comisaría: <strong>6 min</strong>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h6 className="fw-bold mb-3">
                <i className="bi bi-clock text-primary me-2"></i>
                Horarios de Atención
              </h6>
              <ul className="list-unstyled small mb-0">
                <li className="mb-2">
                  <i className="bi bi-building me-2 text-muted"></i>
                  Junta de Vecinos: <strong>L-V 9:00-17:00</strong>
                </li>
                <li className="mb-2">
                  <i className="bi bi-hospital me-2 text-muted"></i>
                  Centro de Salud: <strong>L-V 8:00-18:00</strong>
                </li>
                <li className="mb-2">
                  <i className="bi bi-mortarboard me-2 text-muted"></i>
                  Escuela: <strong>L-V 8:00-18:00</strong>
                </li>
                <li>
                  <i className="bi bi-shield-check me-2 text-muted"></i>
                  Comisaría: <strong>24 horas</strong>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Nota informativa */}
      <div className="alert alert-info mt-4" role="alert">
        <div className="d-flex align-items-start gap-2">
          <i className="bi bi-info-circle-fill" style={{ fontSize: '1.25rem' }}></i>
          <div>
            <h6 className="alert-heading mb-1">Información del Mapa</h6>
            <p className="mb-0 small">
              Este mapa muestra tu ubicación y puntos de interés cercanos en la comunidad.
              Las distancias y horarios son aproximados. Para información actualizada,
              contacta directamente con cada establecimiento.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
