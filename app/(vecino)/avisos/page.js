'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function AvisosVecinosPage() {
  const [avisos, setAvisos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todos');

  useEffect(() => {
    fetchAvisos();
  }, []);

  const fetchAvisos = async () => {
    try {
      setLoading(true);
      setError('');
      const supabase = createClient();

      const { data, error } = await supabase
        .from('avisos')
        .select('*')
        .eq('estado', 'activo')
        .order('prioridad', { ascending: false })
        .order('destacado', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAvisos(data || []);
    } catch (error) {
      console.error('Error fetching avisos:', error);
      setError('Error al cargar los avisos');
    } finally {
      setLoading(false);
    }
  };

  const getTipoTexto = (tipo) => {
    const textos = {
      informativo: 'Informativo',
      urgente: 'Urgente',
      mantenimiento: 'Mantenimiento',
      evento: 'Evento',
      corte_servicio: 'Corte de Servicio',
      seguridad: 'Seguridad',
      otro: 'Otro'
    };
    return textos[tipo] || tipo;
  };

  const getTipoIcon = (tipo) => {
    const iconos = {
      informativo: 'bi-info-circle-fill',
      urgente: 'bi-exclamation-triangle-fill',
      mantenimiento: 'bi-tools',
      evento: 'bi-calendar-event-fill',
      corte_servicio: 'bi-exclamation-octagon-fill',
      seguridad: 'bi-shield-lock-fill',
      otro: 'bi-pin-angle-fill'
    };
    return iconos[tipo] || 'bi-pin-angle-fill';
  };

  const getPrioridadColor = (prioridad) => {
    const colores = {
      critica: '#dc2626',
      alta: '#f59e0b',
      media: '#3b82f6',
      baja: '#6b7280'
    };
    return colores[prioridad] || '#6b7280';
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const avisosFiltrados = avisos.filter(aviso => {
    if (filtroTipo !== 'todos' && aviso.tipo !== filtroTipo) return false;
    return true;
  });

  const avisosDestacados = avisosFiltrados.filter(a => a.destacado || a.prioridad === 'critica');
  const avisosRegulares = avisosFiltrados.filter(a => !a.destacado && a.prioridad !== 'critica');

  if (loading) {
    return (
      <div style={{ width: '100%', maxWidth: '100%', padding: '2rem', background: '#f4f8f9', borderRadius: '16px' }}>
        <div className="text-center py-5">
          <div className="spinner-border mb-3" role="status"></div>
          <p>Cargando avisos...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', maxWidth: '100%', padding: '2rem', background: '#f4f8f9', borderRadius: '16px' }}>
      <div className="text-center mb-5 vecino-page-header">
        <h1 className="fw-bold mb-3"><i className="bi bi-megaphone me-2"></i>Avisos de la Junta de Vecinos</h1>
        <p className="text-muted vecino-text-base">Mantente informado sobre avisos importantes y urgentes</p>
      </div>

      {error && (
        <div className="alert alert-danger mb-5 vecino-alert">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Filtro */}
      <div className="card shadow-sm border-0 mb-5 vecino-card">
        <div className="card-body">
          <div className="row align-items-center g-4">
            <div className="col-12">
              <div className="vecino-form-group">
                <label htmlFor="filtroTipo" className="form-label vecino-form-label">
                  Filtrar por tipo de aviso:
                </label>
                <select
                  id="filtroTipo"
                  className="form-select vecino-form-select"
                  value={filtroTipo}
                  onChange={(e) => setFiltroTipo(e.target.value)}
                >
                  <option value="todos">Todos los tipos</option>
                  <option value="informativo">Informativo</option>
                  <option value="urgente">Urgente</option>
                  <option value="mantenimiento">Mantenimiento</option>
                  <option value="evento">Evento</option>
                  <option value="corte_servicio">Corte de Servicio</option>
                  <option value="seguridad">Seguridad</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
            </div>
            <div className="col-12 text-center">
              <div className="badge vecino-badge p-3" style={{ backgroundColor: '#154765', color: 'white', fontSize: '1.125rem' }}>
                {avisosFiltrados.length} {avisosFiltrados.length === 1 ? 'aviso' : 'avisos'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {avisosFiltrados.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-5">
            <div className="empty-icon mb-3" style={{ fontSize: '3rem' }}>📢</div>
            <h5>No hay avisos disponibles</h5>
            <p className="text-muted">
              {filtroTipo === 'todos'
                ? 'No hay avisos activos en este momento'
                : `No hay avisos del tipo "${getTipoTexto(filtroTipo)}"`
              }
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Avisos Destacados/Críticos */}
          {avisosDestacados.length > 0 && (
            <div className="mb-5">
              <h3 className="mb-4 d-flex align-items-center vecino-text-lg">
                <span className="badge bg-danger me-2 px-3 py-2 vecino-badge">🚨</span>
                <span>Avisos Urgentes e Importantes</span>
              </h3>
              <div className="row g-4">
                {avisosDestacados.map((aviso) => (
                  <div key={aviso.id} className="col-12">
                    <div
                      className="card shadow border-0 vecino-card"
                      style={{
                        borderLeft: `6px solid ${getPrioridadColor(aviso.prioridad)}`,
                        background: aviso.prioridad === 'critica' ? 'rgba(220, 38, 38, 0.05)' : 'white'
                      }}
                    >
                      <div className="card-body">
                        <div className="d-flex align-items-start gap-3 mb-3">
                          <div className="vecino-icon-lg" style={{ flexShrink: 0, color: getPrioridadColor(aviso.prioridad) }}>
                            <i className={`bi ${getTipoIcon(aviso.tipo)}`}></i>
                          </div>
                          <div className="flex-grow-1">
                            <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
                              <span className="badge bg-secondary vecino-badge">
                                {getTipoTexto(aviso.tipo)}
                              </span>
                              <span
                                className="badge vecino-badge"
                                style={{
                                  backgroundColor: getPrioridadColor(aviso.prioridad),
                                  color: 'white'
                                }}
                              >
                                {aviso.prioridad.toUpperCase()}
                              </span>
                              {aviso.destacado && (
                                <span className="badge vecino-badge" style={{ backgroundColor: '#f59e0b', color: '#ffffff', fontWeight: 'bold' }}>⭐ Destacado</span>
                              )}
                            </div>
                            <h4 className="card-title fw-bold mb-3 vecino-text-lg">{aviso.titulo}</h4>
                            {aviso.imagen_url && (
                              <div className="mb-3">
                                <img
                                  src={aviso.imagen_url}
                                  alt={aviso.titulo}
                                  className="img-fluid rounded"
                                  style={{ maxHeight: '400px', width: '100%', objectFit: 'cover' }}
                                />
                              </div>
                            )}
                            <p className="card-text mb-3 vecino-text-base" style={{ whiteSpace: 'pre-line' }}>
                              {aviso.mensaje}
                            </p>
                            <span className="text-muted vecino-text-sm">
                              📅 Publicado el {formatearFecha(aviso.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Avisos Regulares */}
          {avisosRegulares.length > 0 && (
            <div>
              <h3 className="mb-4 d-flex align-items-center vecino-text-lg">
                <span className="badge bg-primary me-2 px-3 py-2 vecino-badge">
                  <i className="bi bi-list-ul"></i>
                </span>
                <span>Otros Avisos</span>
              </h3>
              <div className="row g-4">
                {avisosRegulares.map((aviso) => (
                  <div key={aviso.id} className="col-12 col-lg-6">
                    <div
                      className="card h-100 shadow-sm border-0 vecino-card"
                      style={{
                        borderLeft: `4px solid ${getPrioridadColor(aviso.prioridad)}`
                      }}
                    >
                      <div className="card-body">
                        <div className="d-flex align-items-start gap-3 mb-3">
                          <div className="vecino-icon" style={{ flexShrink: 0, color: getPrioridadColor(aviso.prioridad) }}>
                            <i className={`bi ${getTipoIcon(aviso.tipo)}`}></i>
                          </div>
                          <div className="flex-grow-1">
                            <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
                              <span className="badge bg-secondary vecino-badge">
                                {getTipoTexto(aviso.tipo)}
                              </span>
                              <span
                                className="badge vecino-badge"
                                style={{
                                  backgroundColor: getPrioridadColor(aviso.prioridad),
                                  color: 'white'
                                }}
                              >
                                {aviso.prioridad.charAt(0).toUpperCase() + aviso.prioridad.slice(1)}
                              </span>
                            </div>
                            <h5 className="card-title fw-bold mb-3 vecino-text-base">{aviso.titulo}</h5>
                            {aviso.imagen_url && (
                              <div className="mb-3">
                                <img
                                  src={aviso.imagen_url}
                                  alt={aviso.titulo}
                                  className="img-fluid rounded"
                                  style={{ maxHeight: '250px', width: '100%', objectFit: 'cover' }}
                                />
                              </div>
                            )}
                            <p className="card-text mb-3 vecino-text-base" style={{ whiteSpace: 'pre-line' }}>
                              {aviso.mensaje.length > 200
                                ? `${aviso.mensaje.substring(0, 200)}...`
                                : aviso.mensaje}
                            </p>
                            <span className="text-muted vecino-text-sm">
                              <i className="bi bi-calendar3 me-1"></i>
                              {formatearFecha(aviso.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
