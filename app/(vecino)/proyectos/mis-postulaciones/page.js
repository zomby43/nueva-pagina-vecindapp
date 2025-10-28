'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export default function MisPostulacionesPage() {
  const { user } = useAuth();
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');

  useEffect(() => {
    if (user) {
      fetchMisProyectos();
    }
  }, [user]);

  const fetchMisProyectos = async () => {
    try {
      setLoading(true);
      setError('');
      const supabase = createClient();

      const { data, error } = await supabase
        .from('proyectos')
        .select(`
          *,
          aprobador:aprobador_id (
            nombres,
            apellidos
          )
        `)
        .eq('creador_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProyectos(data || []);
    } catch (error) {
      console.error('Error fetching proyectos:', error);
      setError('Error al cargar tus postulaciones');
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

  const getEstadoBadge = (estado) => {
    const badges = {
      pendiente: 'bg-warning text-dark',
      aprobado: 'bg-success',
      rechazado: 'bg-danger',
      en_ejecucion: 'bg-info',
      completado: 'bg-secondary'
    };
    return badges[estado] || 'bg-secondary';
  };

  const getEstadoTexto = (estado) => {
    const textos = {
      pendiente: 'Pendiente de Revisión',
      aprobado: 'Aprobado',
      rechazado: 'Rechazado',
      en_ejecucion: 'En Ejecución',
      completado: 'Completado'
    };
    return textos[estado] || estado;
  };

  const getEstadoIcon = (estado) => {
    const iconos = {
      pendiente: '⏳',
      aprobado: '✅',
      rechazado: '❌',
      en_ejecucion: '🚧',
      completado: '🎉'
    };
    return iconos[estado] || '📋';
  };

  const proyectosFiltrados = proyectos.filter(proyecto => {
    if (filtroEstado !== 'todos' && proyecto.estado !== filtroEstado) return false;
    return true;
  });

  // Agrupar por estado
  const proyectosPendientes = proyectosFiltrados.filter(p => p.estado === 'pendiente');
  const proyectosAprobados = proyectosFiltrados.filter(p => p.estado === 'aprobado');
  const proyectosEnEjecucion = proyectosFiltrados.filter(p => p.estado === 'en_ejecucion');
  const proyectosCompletados = proyectosFiltrados.filter(p => p.estado === 'completado');
  const proyectosRechazados = proyectosFiltrados.filter(p => p.estado === 'rechazado');

  if (loading) {
    return (
      <div style={{ width: '100%', maxWidth: '100%', padding: '2rem', background: '#f4f8f9', borderRadius: '16px' }}>
        <div className="text-center py-5">
          <div className="spinner-border mb-3" role="status"></div>
          <p>Cargando tus postulaciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', maxWidth: '100%', padding: '2rem', background: '#f4f8f9', borderRadius: '16px' }}>
      <div className="mb-4">
        <h1 className="display-6 fw-bold mb-3">📋 Mis Postulaciones de Proyectos</h1>
        <p className="lead text-muted">Revisa el estado de todos tus proyectos postulados</p>
      </div>

      {error && (
        <div className="alert alert-danger mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Estadísticas */}
      <div className="row g-3 mb-4">
        <div className="col-md-2">
          <div className="card border-0 shadow-sm text-center">
            <div className="card-body py-3">
              <div className="fs-2 fw-bold text-primary">{proyectos.length}</div>
              <small className="text-muted">Total</small>
            </div>
          </div>
        </div>
        <div className="col-md-2">
          <div className="card border-0 shadow-sm text-center">
            <div className="card-body py-3">
              <div className="fs-2 fw-bold text-warning">{proyectosPendientes.length}</div>
              <small className="text-muted">Pendientes</small>
            </div>
          </div>
        </div>
        <div className="col-md-2">
          <div className="card border-0 shadow-sm text-center">
            <div className="card-body py-3">
              <div className="fs-2 fw-bold text-success">{proyectosAprobados.length}</div>
              <small className="text-muted">Aprobados</small>
            </div>
          </div>
        </div>
        <div className="col-md-2">
          <div className="card border-0 shadow-sm text-center">
            <div className="card-body py-3">
              <div className="fs-2 fw-bold text-info">{proyectosEnEjecucion.length}</div>
              <small className="text-muted">En Ejecución</small>
            </div>
          </div>
        </div>
        <div className="col-md-2">
          <div className="card border-0 shadow-sm text-center">
            <div className="card-body py-3">
              <div className="fs-2 fw-bold text-secondary">{proyectosCompletados.length}</div>
              <small className="text-muted">Completados</small>
            </div>
          </div>
        </div>
        <div className="col-md-2">
          <div className="card border-0 shadow-sm text-center">
            <div className="card-body py-3">
              <div className="fs-2 fw-bold text-danger">{proyectosRechazados.length}</div>
              <small className="text-muted">Rechazados</small>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros y Acciones */}
      <div className="card shadow-sm border-0 mb-4">
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
                <option value="todos">Todos los estados</option>
                <option value="pendiente">Pendientes</option>
                <option value="aprobado">Aprobados</option>
                <option value="en_ejecucion">En Ejecución</option>
                <option value="completado">Completados</option>
                <option value="rechazado">Rechazados</option>
              </select>
            </div>
            <div className="col-md-6 text-md-end">
              <Link href="/proyectos/postular" className="btn btn-primary btn-lg">
                ➕ Postular Nuevo Proyecto
              </Link>
            </div>
          </div>
        </div>
      </div>

      {proyectosFiltrados.length === 0 ? (
        <div className="card shadow-sm border-0">
          <div className="card-body text-center py-5">
            <div className="empty-icon mb-3" style={{ fontSize: '3rem' }}>📋</div>
            <h5>No tienes postulaciones</h5>
            <p className="text-muted mb-4">
              {filtroEstado === 'todos'
                ? 'Aún no has postulado ningún proyecto. ¡Presenta tu propuesta para mejorar nuestra comunidad!'
                : `No tienes proyectos en estado "${getEstadoTexto(filtroEstado)}"`
              }
            </p>
            <Link href="/proyectos/postular" className="btn btn-primary">
              ➕ Postular mi Primer Proyecto
            </Link>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          {proyectosFiltrados.map((proyecto) => (
            <div key={proyecto.id} className="col-12 col-lg-6">
              <div className="card h-100 shadow-sm border-0">
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <h5 className="card-title fw-bold mb-0">{proyecto.titulo}</h5>
                    <span className={`badge ${getEstadoBadge(proyecto.estado)} px-3 py-2`}>
                      {getEstadoIcon(proyecto.estado)} {getEstadoTexto(proyecto.estado)}
                    </span>
                  </div>

                  <p className="card-text text-muted mb-3" style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>
                    {proyecto.descripcion.length > 150
                      ? `${proyecto.descripcion.substring(0, 150)}...`
                      : proyecto.descripcion}
                  </p>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <small className="text-muted d-block">Presupuesto</small>
                      <strong className="text-primary">{formatearPresupuesto(proyecto.presupuesto)}</strong>
                    </div>
                    <div className="col-6">
                      <small className="text-muted d-block">Beneficiarios</small>
                      <strong>👥 {proyecto.num_beneficiarios} vecinos</strong>
                    </div>
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <small className="text-muted d-block">Inicio Estimado</small>
                      <strong>{formatearFecha(proyecto.fecha_inicio_estimada)}</strong>
                    </div>
                    <div className="col-6">
                      <small className="text-muted d-block">Fin Estimado</small>
                      <strong>{formatearFecha(proyecto.fecha_fin_estimada)}</strong>
                    </div>
                  </div>

                  {proyecto.estado === 'rechazado' && proyecto.motivo_rechazo && (
                    <div className="alert alert-danger mb-3 py-2">
                      <small className="d-block mb-1"><strong>Motivo de rechazo:</strong></small>
                      <small>{proyecto.motivo_rechazo}</small>
                    </div>
                  )}

                  {proyecto.estado === 'aprobado' && proyecto.fecha_aprobacion && (
                    <div className="alert alert-success mb-3 py-2">
                      <small>
                        ✅ Aprobado el {formatearFecha(proyecto.fecha_aprobacion)}
                        {proyecto.aprobador && ` por ${proyecto.aprobador.nombres} ${proyecto.aprobador.apellidos}`}
                      </small>
                    </div>
                  )}

                  <div className="border-top pt-3 mt-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <small className="text-muted">
                        📅 Postulado el {formatearFecha(proyecto.created_at)}
                      </small>
                      <Link
                        href={`/proyectos/${proyecto.id}`}
                        className="btn btn-outline-primary btn-sm"
                      >
                        Ver Detalle →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
