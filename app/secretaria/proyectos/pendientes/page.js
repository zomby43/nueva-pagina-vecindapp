'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function ProyectosPendientesPage() {
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProyectosPendientes();
  }, []);

  const fetchProyectosPendientes = async () => {
    try {
      setLoading(true);
      setError('');
      const supabase = createClient();

      const { data, error } = await supabase
        .from('proyectos')
        .select(`
          *,
          creador:creador_id (
            nombres,
            apellidos,
            email,
            telefono
          )
        `)
        .eq('estado', 'pendiente')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setProyectos(data || []);
    } catch (error) {
      console.error('Error fetching proyectos:', error);
      setError('Error al cargar los proyectos pendientes');
    } finally {
      setLoading(false);
    }
  };

  const formatearPresupuesto = (monto) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(monto);
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatearFechaHora = (fecha) => {
    return new Date(fecha).toLocaleString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calcularDiasEspera = (fechaCreacion) => {
    const hoy = new Date();
    const creacion = new Date(fechaCreacion);
    const diferencia = Math.floor((hoy - creacion) / (1000 * 60 * 60 * 24));
    return diferencia;
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="text-center py-5">
          <div className="spinner-border mb-3" role="status"></div>
          <p>Cargando proyectos pendientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1><i className="bi bi-hourglass-split me-2"></i>Proyectos Pendientes de Revisión</h1>
          <p className="text-muted">Revisa y gestiona los proyectos que esperan aprobación</p>
        </div>
        <Link href="/secretaria/proyectos" className="btn btn-secondary">
          ← Volver a Todos los Proyectos
        </Link>
      </div>

      {error && (
        <div className="alert alert-danger mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Estadística */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body p-4 text-center">
          <div className="fs-1 fw-bold text-warning mb-2">{proyectos.length}</div>
          <p className="mb-0 text-muted">
            {proyectos.length === 1 ? 'Proyecto pendiente de revisión' : 'Proyectos pendientes de revisión'}
          </p>
        </div>
      </div>

      {proyectos.length === 0 ? (
        <div className="card shadow-sm border-0">
          <div className="card-body text-center py-5">
            <div className="empty-icon mb-3" style={{ fontSize: '3rem' }}>✅</div>
            <h5>No hay proyectos pendientes</h5>
            <p className="text-muted">Todos los proyectos han sido revisados</p>
            <Link href="/secretaria/proyectos" className="btn btn-primary">
              Ver Todos los Proyectos
            </Link>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          {proyectos.map((proyecto) => {
            const diasEspera = calcularDiasEspera(proyecto.created_at);
            const esUrgente = diasEspera >= 7;

            return (
              <div key={proyecto.id} className="col-12">
                <div
                  className={`card shadow-sm border-0 ${esUrgente ? 'border-warning' : ''}`}
                  style={esUrgente ? { borderLeft: '4px solid #ffc107' } : {}}
                >
                  <div className="card-body p-4">
                    <div className="row">
                      {/* Columna Principal */}
                      <div className="col-lg-8">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <div>
                            <h4 className="card-title fw-bold mb-2">{proyecto.titulo}</h4>
                            <span className="badge bg-warning text-dark px-3 py-2">
                              ⏳ Pendiente de Revisión
                            </span>
                            {esUrgente && (
                              <span className="badge bg-danger ms-2 px-3 py-2">
                                🚨 Esperando {diasEspera} días
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="mb-3">
                          <h6 className="fw-semibold mb-2">📝 Descripción:</h6>
                          <p style={{ whiteSpace: 'pre-line', lineHeight: '1.7' }}>
                            {proyecto.descripcion}
                          </p>
                        </div>

                        <div className="mb-3">
                          <h6 className="fw-semibold mb-2">🎯 Objetivo:</h6>
                          <p style={{ whiteSpace: 'pre-line', lineHeight: '1.7' }}>
                            {proyecto.objetivo}
                          </p>
                        </div>

                        {proyecto.ubicacion && (
                          <div className="mb-3">
                            <h6 className="fw-semibold mb-2">📍 Ubicación:</h6>
                            <p>{proyecto.ubicacion}</p>
                          </div>
                        )}
                      </div>

                      {/* Columna Lateral */}
                      <div className="col-lg-4">
                        <div className="card bg-light border-0 mb-3">
                          <div className="card-body p-3">
                            <h6 className="fw-semibold mb-3">💰 Información del Proyecto</h6>

                            <div className="mb-2">
                              <small className="text-muted d-block">Presupuesto</small>
                              <strong className="text-primary fs-5">
                                {formatearPresupuesto(proyecto.presupuesto)}
                              </strong>
                            </div>

                            <div className="mb-2">
                              <small className="text-muted d-block">Beneficiarios</small>
                              <strong>👥 {proyecto.num_beneficiarios} vecinos</strong>
                            </div>

                            <div className="mb-2">
                              <small className="text-muted d-block">Fecha Inicio</small>
                              <strong>{formatearFecha(proyecto.fecha_inicio_estimada)}</strong>
                            </div>

                            <div className="mb-2">
                              <small className="text-muted d-block">Fecha Fin</small>
                              <strong>{formatearFecha(proyecto.fecha_fin_estimada)}</strong>
                            </div>

                            <div>
                              <small className="text-muted d-block">Duración</small>
                              <strong>
                                {Math.ceil((new Date(proyecto.fecha_fin_estimada) - new Date(proyecto.fecha_inicio_estimada)) / (1000 * 60 * 60 * 24))} días
                              </strong>
                            </div>
                          </div>
                        </div>

                        <div className="card bg-light border-0 mb-3">
                          <div className="card-body p-3">
                            <h6 className="fw-semibold mb-3">👤 Postulado por</h6>
                            {proyecto.creador ? (
                              <>
                                <div className="mb-2">
                                  <strong>{proyecto.creador.nombres} {proyecto.creador.apellidos}</strong>
                                </div>
                                <div className="mb-2">
                                  <small className="text-muted d-block">Email</small>
                                  <small>{proyecto.creador.email}</small>
                                </div>
                                {proyecto.creador.telefono && (
                                  <div className="mb-2">
                                    <small className="text-muted d-block">Teléfono</small>
                                    <small>{proyecto.creador.telefono}</small>
                                  </div>
                                )}
                                <div>
                                  <small className="text-muted d-block">Fecha de postulación</small>
                                  <small>{formatearFechaHora(proyecto.created_at)}</small>
                                </div>
                              </>
                            ) : (
                              <p className="text-muted mb-0">Información no disponible</p>
                            )}
                          </div>
                        </div>

                        <Link
                          href={`/secretaria/proyectos/${proyecto.id}`}
                          className="btn btn-primary w-100"
                        >
                          Revisar y Gestionar →
                        </Link>
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
