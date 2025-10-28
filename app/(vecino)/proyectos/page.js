'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function ProyectosPage() {
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');

  useEffect(() => {
    fetchProyectos();
  }, []);

  const fetchProyectos = async () => {
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
            apellidos
          )
        `)
        .in('estado', ['aprobado', 'en_ejecucion', 'completado'])
        .order('estado', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProyectos(data || []);
    } catch (error) {
      console.error('Error fetching proyectos:', error);
      setError('Error al cargar los proyectos');
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
      aprobado: 'bg-success',
      en_ejecucion: 'bg-info',
      completado: 'bg-secondary'
    };
    return badges[estado] || 'bg-secondary';
  };

  const getEstadoTexto = (estado) => {
    const textos = {
      aprobado: 'Aprobado',
      en_ejecucion: 'En Ejecución',
      completado: 'Completado'
    };
    return textos[estado] || estado;
  };

  const getEstadoIcon = (estado) => {
    const iconos = {
      aprobado: '✅',
      en_ejecucion: '🚧',
      completado: '🎉'
    };
    return iconos[estado] || '📋';
  };

  const proyectosFiltrados = proyectos.filter(proyecto => {
    if (filtroEstado !== 'todos' && proyecto.estado !== filtroEstado) return false;
    return true;
  });

  const proyectosEnEjecucion = proyectosFiltrados.filter(p => p.estado === 'en_ejecucion');
  const proyectosAprobados = proyectosFiltrados.filter(p => p.estado === 'aprobado');
  const proyectosCompletados = proyectosFiltrados.filter(p => p.estado === 'completado');

  if (loading) {
    return (
      <div style={{ width: '100%', maxWidth: '100%', padding: '2rem', background: '#f4f8f9', borderRadius: '16px' }}>
        <div className="text-center py-5">
          <div className="spinner-border mb-3" role="status"></div>
          <p>Cargando proyectos...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', maxWidth: '100%', padding: '2rem', background: '#f4f8f9', borderRadius: '16px' }}>
      <div className="text-center mb-5">
        <h1 className="display-5 fw-bold mb-3">🏗️ Proyectos Vecinales</h1>
        <p className="lead text-muted">Conoce los proyectos que están transformando nuestra comunidad</p>
      </div>

      {error && (
        <div className="alert alert-danger mb-5">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Filtro y Acciones */}
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
                <option value="todos">Todos los estados</option>
                <option value="en_ejecucion">En Ejecución</option>
                <option value="aprobado">Aprobados</option>
                <option value="completado">Completados</option>
              </select>
            </div>
            <div className="col-md-6 text-md-end">
              <Link href="/proyectos/postular" className="btn btn-primary btn-lg">
                ➕ Postular Proyecto
              </Link>
              <Link href="/proyectos/mis-postulaciones" className="btn btn-outline-primary btn-lg ms-2">
                📋 Mis Postulaciones
              </Link>
            </div>
          </div>
        </div>
      </div>

      {proyectosFiltrados.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-5">
            <div className="empty-icon mb-3" style={{ fontSize: '3rem' }}>🏗️</div>
            <h5>No hay proyectos disponibles</h5>
            <p className="text-muted">
              {filtroEstado === 'todos'
                ? 'No hay proyectos registrados aún'
                : `No hay proyectos en estado "${getEstadoTexto(filtroEstado)}"`
              }
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Proyectos en Ejecución */}
          {proyectosEnEjecucion.length > 0 && (
            <div className="mb-5">
              <h3 className="mb-4 d-flex align-items-center">
                <span className="badge bg-info me-2 px-3 py-2">🚧</span>
                <span>Proyectos en Ejecución</span>
              </h3>
              <div className="row g-4">
                {proyectosEnEjecucion.map((proyecto) => (
                  <div key={proyecto.id} className="col-12 col-lg-6">
                    <div
                      className="card h-100 shadow border-info"
                      style={{ borderWidth: '3px', borderLeft: '6px solid #0dcaf0' }}
                    >
                      <div className="card-body p-4">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <span className={`badge ${getEstadoBadge(proyecto.estado)} px-3 py-2`}>
                            {getEstadoIcon(proyecto.estado)} {getEstadoTexto(proyecto.estado)}
                          </span>
                          <span className="badge bg-light text-dark px-3 py-2">
                            {formatearPresupuesto(proyecto.presupuesto)}
                          </span>
                        </div>
                        <h5 className="card-title fw-bold mb-3">{proyecto.titulo}</h5>
                        <p className="card-text text-muted mb-3" style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>
                          {proyecto.descripcion.length > 150
                            ? `${proyecto.descripcion.substring(0, 150)}...`
                            : proyecto.descripcion}
                        </p>
                        <div className="mb-3">
                          <small className="text-muted d-block mb-1">
                            👥 Beneficia a <strong>{proyecto.num_beneficiarios}</strong> vecinos
                          </small>
                          {proyecto.ubicacion && (
                            <small className="text-muted d-block">
                              📍 {proyecto.ubicacion}
                            </small>
                          )}
                        </div>
                        <div className="d-flex justify-content-between align-items-center mt-auto pt-3 border-top">
                          <small className="text-muted">
                            📅 {formatearFecha(proyecto.fecha_inicio_estimada)} - {formatearFecha(proyecto.fecha_fin_estimada)}
                          </small>
                          <Link
                            href={`/proyectos/${proyecto.id}`}
                            className="btn btn-primary"
                          >
                            Ver Detalles
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Proyectos Aprobados */}
          {proyectosAprobados.length > 0 && (
            <div className="mb-5">
              <h3 className="mb-4 d-flex align-items-center">
                <span className="badge bg-success me-2 px-3 py-2">✅</span>
                <span>Proyectos Aprobados</span>
              </h3>
              <div className="row g-4">
                {proyectosAprobados.map((proyecto) => (
                  <div key={proyecto.id} className="col-12 col-lg-6">
                    <div className="card h-100 shadow-sm border-0">
                      <div className="card-body p-4">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <span className={`badge ${getEstadoBadge(proyecto.estado)} px-3 py-2`}>
                            {getEstadoIcon(proyecto.estado)} {getEstadoTexto(proyecto.estado)}
                          </span>
                          <span className="badge bg-light text-dark px-3 py-2">
                            {formatearPresupuesto(proyecto.presupuesto)}
                          </span>
                        </div>
                        <h5 className="card-title fw-bold mb-3">{proyecto.titulo}</h5>
                        <p className="card-text text-muted mb-3" style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>
                          {proyecto.descripcion.length > 120
                            ? `${proyecto.descripcion.substring(0, 120)}...`
                            : proyecto.descripcion}
                        </p>
                        <div className="mb-3">
                          <small className="text-muted d-block mb-1">
                            👥 Beneficia a <strong>{proyecto.num_beneficiarios}</strong> vecinos
                          </small>
                        </div>
                        <div className="d-flex justify-content-between align-items-center mt-auto pt-3 border-top">
                          <small className="text-muted">
                            📅 Inicio: {formatearFecha(proyecto.fecha_inicio_estimada)}
                          </small>
                          <Link
                            href={`/proyectos/${proyecto.id}`}
                            className="btn btn-outline-primary"
                          >
                            Ver Detalles
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Proyectos Completados */}
          {proyectosCompletados.length > 0 && (
            <div>
              <h3 className="mb-4 d-flex align-items-center">
                <span className="badge bg-secondary me-2 px-3 py-2">🎉</span>
                <span>Proyectos Completados</span>
              </h3>
              <div className="row g-4">
                {proyectosCompletados.map((proyecto) => (
                  <div key={proyecto.id} className="col-12 col-lg-6">
                    <div className="card h-100 shadow-sm border-0">
                      <div className="card-body p-4">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <span className={`badge ${getEstadoBadge(proyecto.estado)} px-3 py-2`}>
                            {getEstadoIcon(proyecto.estado)} {getEstadoTexto(proyecto.estado)}
                          </span>
                          <span className="badge bg-light text-dark px-3 py-2">
                            {formatearPresupuesto(proyecto.presupuesto)}
                          </span>
                        </div>
                        <h5 className="card-title fw-bold mb-3">{proyecto.titulo}</h5>
                        <p className="card-text text-muted mb-3" style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>
                          {proyecto.descripcion.length > 120
                            ? `${proyecto.descripcion.substring(0, 120)}...`
                            : proyecto.descripcion}
                        </p>
                        <div className="mb-3">
                          <small className="text-muted d-block">
                            👥 Benefició a <strong>{proyecto.num_beneficiarios}</strong> vecinos
                          </small>
                        </div>
                        <div className="d-flex justify-content-between align-items-center mt-auto pt-3 border-top">
                          <small className="text-muted">
                            ✅ Completado
                          </small>
                          <Link
                            href={`/proyectos/${proyecto.id}`}
                            className="btn btn-outline-secondary"
                          >
                            Ver Detalles
                          </Link>
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
