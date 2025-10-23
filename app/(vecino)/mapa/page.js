'use client';

import { useState } from 'react';

export default function MapaPage() {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const locations = [
    {
      id: 1,
      name: "Municipalidad",
      type: "gobierno",
      address: "Av. Principal 123",
      description: "Oficina municipal principal",
      distance: "5 min caminando"
    },
    {
      id: 2,
      name: "Centro de Salud",
      type: "salud",
      address: "Calle Salud 456", 
      description: "Consultorio médico del barrio",
      distance: "3 min caminando"
    },
    {
      id: 3,
      name: "Escuela Básica",
      type: "educacion",
      address: "Av. Educación 789",
      description: "Escuela pública del sector",
      distance: "8 min caminando"
    },
    {
      id: 4,
      name: "Comisaría",
      type: "seguridad",
      address: "Calle Seguridad 321",
      description: "Estación de policía local",
      distance: "6 min caminando"
    }
  ];

  const handleLocationClick = (location) => {
    setSelectedLocation(location);
  };

  return (
    <div className="mapa-user-page">
      <div className="page-header">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1>🗺️ Mapa de la Comunidad</h1>
            <p className="text-muted">Visualiza tu ubicación y conoce tu comunidad</p>
          </div>
          <button 
            className="btn btn-outline-primary btn-sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? 'Ocultar Filtros' : 'Filtros'}
          </button>
        </div>
      </div>

      {/* Filtros colapsables */}
      {showFilters && (
        <div className="map-filters-user mb-3">
          <div className="card">
            <div className="card-body py-2">
              <div className="filter-buttons-user">
                <button className="btn btn-sm btn-primary">Todos</button>
                <button className="btn btn-sm btn-outline-secondary">🏛️ Gobierno</button>
                <button className="btn btn-sm btn-outline-success">🏥 Salud</button>
                <button className="btn btn-sm btn-outline-warning">🎓 Educación</button>
                <button className="btn btn-sm btn-outline-danger">🚔 Seguridad</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="row">
        {/* Mapa principal */}
        <div className="col-lg-8">
          <div className="map-container-user">
            <iframe
              src="https://www.openstreetmap.org/export/embed.html?bbox=-70.75%2C-33.6%2C-70.55%2C-33.4&layer=mapnik&marker=-33.45%2C-70.65"
              style={{ border: "none", width: "100%", height: "100%" }}
              title="Mapa interactivo de la comunidad"
            ></iframe>
            
            {/* Indicador de ubicación actual */}
            <div className="map-overlay-user">
              <div className="current-location-user">
                <div className="location-dot-user"></div>
                <div className="location-info-user">
                  <strong>Tu ubicación</strong>
                  <small>Av. Providencia 1234</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Panel lateral con información */}
        <div className="col-lg-4">
          <div className="map-sidebar-user">
            {/* Mi ubicación */}
            <div className="card mb-3">
              <div className="card-header">
                <h6 className="mb-0">📍 Mi Ubicación</h6>
              </div>
              <div className="card-body py-2">
                <address className="mb-1 small">
                  <strong>Juan Pérez</strong><br />
                  Av. Providencia 1234, Dpto 56<br />
                  Providencia, Santiago
                </address>
              </div>
            </div>

            {/* Lugares cercanos */}
            <div className="card">
              <div className="card-header">
                <h6 className="mb-0">🏢 Lugares Cercanos</h6>
              </div>
              <div className="card-body p-0">
                <div className="places-list-user">
                  {locations.map((location) => (
                    <div 
                      key={location.id}
                      className={`place-item-user ${selectedLocation?.id === location.id ? 'selected' : ''}`}
                      onClick={() => handleLocationClick(location)}
                    >
                      <div className="place-icon-user">
                        {location.type === 'gobierno' && '🏛️'}
                        {location.type === 'salud' && '🏥'}
                        {location.type === 'educacion' && '🎓'}
                        {location.type === 'seguridad' && '🚔'}
                      </div>
                      <div className="place-info-user">
                        <h6 className="mb-0">{location.name}</h6>
                        <p className="text-muted small mb-0">{location.address}</p>
                        <small className="text-success">{location.distance}</small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Información del lugar seleccionado */}
            {selectedLocation && (
              <div className="card mt-3">
                <div className="card-header bg-primary text-white">
                  <h6 className="mb-0">📌 {selectedLocation.name}</h6>
                </div>
                <div className="card-body py-2">
                  <p className="text-muted small mb-1">{selectedLocation.address}</p>
                  <p className="small mb-2">{selectedLocation.description}</p>
                  <div className="d-grid gap-1">
                    <button className="btn btn-primary btn-sm">
                      📍 Cómo llegar
                    </button>
                    <button className="btn btn-outline-primary btn-sm">
                      📞 Contactar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Información adicional en la parte inferior */}
      <div className="row mt-3">
        <div className="col-md-6">
          <div className="info-card-small">
            <h6 className="small fw-bold">🚶‍♂️ Distancias</h6>
            <ul className="list-unstyled small mb-0">
              <li>• Municipalidad: 5 min</li>
              <li>• Centro de Salud: 3 min</li>
              <li>• Escuela: 8 min</li>
              <li>• Comisaría: 6 min</li>
            </ul>
          </div>
        </div>
        <div className="col-md-6">
          <div className="info-card-small">
            <h6 className="small fw-bold">🕒 Horarios</h6>
            <ul className="list-unstyled small mb-0">
              <li>• Municipalidad: L-V 8:30-17:00</li>
              <li>• Centro de Salud: L-V 8:00-18:00</li>
              <li>• Escuela: L-V 8:00-18:00</li>
              <li>• Comisaría: 24 horas</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}