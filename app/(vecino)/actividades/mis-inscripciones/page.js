'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export default function MisInscripcionesPage() {
  const { user } = useAuth();
  const [inscripciones, setInscripciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todas');

  useEffect(() => {
    if (user) {
      fetchInscripciones();
    }
  }, [user]);

  const fetchInscripciones = async () => {
    try {
      setLoading(true);
      setError('');
      const supabase = createClient();

      const { data, error } = await supabase
        .from('inscripciones_actividades')
        .select(`
          *,
          actividad:actividad_id (
            id,
            titulo,
            descripcion,
            categoria,
            tipo,
            fecha_inicio,
            fecha_fin,
            ubicacion,
            cupo_disponible,
            cupo_maximo,
            es_gratuita,
            costo,
            estado
          )
        `)
        .eq('participante_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInscripciones(data || []);
    } catch (error) {
      console.error('Error fetching inscripciones:', error);
      setError('Error al cargar tus inscripciones');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelarInscripcion = async (inscripcionId) => {
    if (!confirm('¿Estás seguro de que deseas cancelar esta inscripción?')) {
      return;
    }

    try {
      const supabase = createClient();

      const { error } = await supabase
        .from('inscripciones_actividades')
        .update({ estado: 'cancelada' })
        .eq('id', inscripcionId)
        .eq('participante_id', user.id)
        .eq('estado', 'pendiente');

      if (error) throw error;

      alert('Inscripción cancelada exitosamente');
      fetchInscripciones();
    } catch (error) {
      console.error('Error al cancelar inscripción:', error);
      alert('Error al cancelar la inscripción');
    }
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-CL', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEstadoBadge = (estado) => {
    const badges = {
      pendiente: { bg: '#fbbf24', text: '#78350f', label: '⏳ Pendiente' },
      aprobada: { bg: '#34d399', text: '#064e3b', label: '✅ Aprobada' },
      rechazada: { bg: '#fb7185', text: '#881337', label: '❌ Rechazada' },
      cancelada: { bg: '#6b7280', text: 'white', label: '🚫 Cancelada' },
      asistio: { bg: '#10b981', text: 'white', label: '👍 Asistió' },
      no_asistio: { bg: '#ef4444', text: 'white', label: '👎 No Asistió' }
    };
    return badges[estado] || { bg: '#6b7280', text: 'white', label: estado };
  };

  const getCategoriaColor = (categoria) => {
    const colores = {
      deportiva: '#dc3545',
      cultural: '#6f42c1',
      educativa: '#0dcaf0',
      social: '#20c997',
      ambiental: '#198754',
      salud: '#fd7e14',
      recreativa: '#ffc107',
      otro: '#6c757d'
    };
    return colores[categoria] || '#6c757d';
  };

  const getCategoriaIcon = (categoria) => {
    const iconos = {
      deportiva: '⚽',
      cultural: '🎨',
      educativa: '📚',
      social: '🤝',
      ambiental: '🌱',
      salud: '❤️',
      recreativa: '🎉',
      otro: '📌'
    };
    return iconos[categoria] || '📌';
  };

  const inscripcionesFiltradas = inscripciones.filter(inscripcion => {
    if (filtroEstado !== 'todas' && inscripcion.estado !== filtroEstado) return false;
    return true;
  });

  const totalInscripciones = inscripcionesFiltradas.length;
  const pendientes = inscripcionesFiltradas.filter(i => i.estado === 'pendiente').length;
  const aprobadas = inscripcionesFiltradas.filter(i => i.estado === 'aprobada').length;
  const rechazadas = inscripcionesFiltradas.filter(i => i.estado === 'rechazada').length;
  const canceladas = inscripcionesFiltradas.filter(i => i.estado === 'cancelada').length;

  if (loading) {
    return (
      <div style={{ width: '100%', maxWidth: '100%', padding: '2rem', background: '#f4f8f9', borderRadius: '16px' }}>
        <div className="text-center py-5">
          <div className="spinner-border mb-3" role="status"></div>
          <p>Cargando tus inscripciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', maxWidth: '100%', padding: '2rem', background: '#f4f8f9', borderRadius: '16px' }}>
      <div className="text-center mb-5">
        <h1 className="display-5 fw-bold mb-3">📋 Mis Inscripciones</h1>
        <p className="lead text-muted">Gestiona tus inscripciones a actividades vecinales</p>
      </div>

      {error && (
        <div className="alert alert-danger mb-5">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Estadísticas */}
      <div className="row g-3 mb-5">
        <div className="col-md-2">
          <div className="card border-0 shadow-sm text-center">
            <div className="card-body py-3">
              <div className="fs-2 fw-bold text-primary">{totalInscripciones}</div>
              <small className="text-muted">Total</small>
            </div>
          </div>
        </div>
        <div className="col-md-2">
          <div className="card border-0 shadow-sm text-center">
            <div className="card-body py-3">
              <div className="fs-2 fw-bold" style={{ color: '#fbbf24' }}>{pendientes}</div>
              <small className="text-muted">Pendientes</small>
            </div>
          </div>
        </div>
        <div className="col-md-2">
          <div className="card border-0 shadow-sm text-center">
            <div className="card-body py-3">
              <div className="fs-2 fw-bold text-success">{aprobadas}</div>
              <small className="text-muted">Aprobadas</small>
            </div>
          </div>
        </div>
        <div className="col-md-2">
          <div className="card border-0 shadow-sm text-center">
            <div className="card-body py-3">
              <div className="fs-2 fw-bold" style={{ color: '#fb7185' }}>{rechazadas}</div>
              <small className="text-muted">Rechazadas</small>
            </div>
          </div>
        </div>
        <div className="col-md-2">
          <div className="card border-0 shadow-sm text-center">
            <div className="card-body py-3">
              <div className="fs-2 fw-bold text-secondary">{canceladas}</div>
              <small className="text-muted">Canceladas</small>
            </div>
          </div>
        </div>
      </div>

      {/* Filtro y acciones */}
      <div className="card shadow-sm border-0 mb-5">
        <div className="card-body p-4">
          <div className="row align-items-center g-3">
            <div className="col-md-6">
              <label htmlFor="filtroEstado" className="form-label fw-semibold mb-2">
                Filtrar por estado:
              </label>
              <select
                id="filtroEstado"
                className="form-select form-select-lg"
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
              >
                <option value="todas">Todas las inscripciones</option>
                <option value="pendiente">⏳ Pendientes</option>
                <option value="aprobada">✅ Aprobadas</option>
                <option value="rechazada">❌ Rechazadas</option>
                <option value="cancelada">🚫 Canceladas</option>
              </select>
            </div>
            <div className="col-md-6 text-md-end">
              <Link href="/actividades" className="btn btn-primary btn-lg">
                🎯 Ver Actividades Disponibles
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de inscripciones */}
      {inscripcionesFiltradas.length === 0 ? (
        <div className="card border-0 shadow-sm text-center py-5">
          <div className="card-body">
            <div className="fs-1 mb-3">📭</div>
            <h3>No tienes inscripciones</h3>
            <p className="text-muted mb-4">
              {filtroEstado !== 'todas'
                ? 'No hay inscripciones con este estado'
                : 'Aún no te has inscrito en ninguna actividad'}
            </p>
            <Link href="/actividades" className="btn btn-primary">
              🎯 Explorar Actividades
            </Link>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          {inscripcionesFiltradas.map((inscripcion) => {
            const estadoBadge = getEstadoBadge(inscripcion.estado);
            const categoriaColor = getCategoriaColor(inscripcion.actividad.categoria);

            return (
              <div key={inscripcion.id} className="col-12">
                <div
                  className="card border-0 shadow-sm"
                  style={{
                    borderLeft: `6px solid ${categoriaColor}`,
                    transition: 'transform 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateX(5px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                >
                  <div className="card-body p-4">
                    <div className="row align-items-center">
                      {/* Info de la actividad */}
                      <div className="col-lg-7">
                        <div className="d-flex align-items-center mb-3">
                          <span className="me-3 fs-3">
                            {getCategoriaIcon(inscripcion.actividad.categoria)}
                          </span>
                          <div className="flex-grow-1">
                            <h3 className="h5 fw-bold mb-1">{inscripcion.actividad.titulo}</h3>
                            <small className="text-muted">
                              Inscrito el {formatearFecha(inscripcion.created_at)}
                            </small>
                          </div>
                        </div>

                        <div className="mb-3">
                          <div className="row g-2">
                            <div className="col-auto">
                              <small className="text-muted">
                                📅 {formatearFecha(inscripcion.actividad.fecha_inicio)}
                              </small>
                            </div>
                            {inscripcion.actividad.ubicacion && (
                              <div className="col-auto">
                                <small className="text-muted">
                                  📍 {inscripcion.actividad.ubicacion}
                                </small>
                              </div>
                            )}
                            {inscripcion.actividad.es_gratuita ? (
                              <div className="col-auto">
                                <small className="text-success fw-semibold">✅ Gratuita</small>
                              </div>
                            ) : (
                              <div className="col-auto">
                                <small className="text-warning fw-semibold">
                                  💰 ${inscripcion.actividad.costo.toLocaleString('es-CL')}
                                </small>
                              </div>
                            )}
                          </div>
                        </div>

                        {inscripcion.comentario && (
                          <div className="alert alert-light py-2 mb-0">
                            <small>
                              <strong>Tu comentario:</strong> {inscripcion.comentario}
                            </small>
                          </div>
                        )}

                        {inscripcion.estado === 'rechazada' && inscripcion.motivo_rechazo && (
                          <div className="alert alert-warning py-2 mb-0 mt-2">
                            <small>
                              <strong>Motivo del rechazo:</strong> {inscripcion.motivo_rechazo}
                            </small>
                          </div>
                        )}
                      </div>

                      {/* Estado y acciones */}
                      <div className="col-lg-5">
                        <div className="d-flex flex-column align-items-lg-end gap-3">
                          <span
                            className="badge"
                            style={{
                              backgroundColor: estadoBadge.bg,
                              color: estadoBadge.text,
                              fontSize: '1rem',
                              padding: '0.6rem 1.2rem'
                            }}
                          >
                            {estadoBadge.label}
                          </span>

                          <div className="d-flex gap-2">
                            <Link
                              href={`/actividades/${inscripcion.actividad.id}`}
                              className="btn btn-sm btn-outline-primary"
                            >
                              Ver Actividad
                            </Link>

                            {inscripcion.estado === 'pendiente' && (
                              <button
                                onClick={() => handleCancelarInscripcion(inscripcion.id)}
                                className="btn btn-sm btn-outline-danger"
                              >
                                Cancelar
                              </button>
                            )}
                          </div>

                          {inscripcion.estado === 'aprobada' && (
                            <small className="text-success fw-semibold">
                              ✅ Confirmada - ¡Nos vemos!
                            </small>
                          )}

                          {inscripcion.fecha_aprobacion && (
                            <small className="text-muted">
                              Aprobada el {formatearFecha(inscripcion.fecha_aprobacion)}
                            </small>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
