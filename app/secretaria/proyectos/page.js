'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function GestionProyectosPage() {
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [busqueda, setBusqueda] = useState('');

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
            apellidos,
            email
          ),
          aprobador:aprobador_id (
            nombres,
            apellidos
          )
        `)
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
      month: 'short',
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
      pendiente: 'Pendiente',
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
    if (busqueda.trim() !== '') {
      const searchLower = busqueda.toLowerCase();
      return (
        proyecto.titulo.toLowerCase().includes(searchLower) ||
        proyecto.descripcion.toLowerCase().includes(searchLower) ||
        (proyecto.creador && `${proyecto.creador.nombres} ${proyecto.creador.apellidos}`.toLowerCase().includes(searchLower))
      );
    }
    return true;
  });

  // Estadísticas
  const totalProyectos = proyectos.length;
  const pendientes = proyectos.filter(p => p.estado === 'pendiente').length;
  const aprobados = proyectos.filter(p => p.estado === 'aprobado').length;
  const enEjecucion = proyectos.filter(p => p.estado === 'en_ejecucion').length;
  const completados = proyectos.filter(p => p.estado === 'completado').length;
  const rechazados = proyectos.filter(p => p.estado === 'rechazado').length;

  if (loading) {
    return (
      <div className="page-container">
        <div className="text-center py-5">
          <div className="spinner-border mb-3" role="status"></div>
          <p>Cargando proyectos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>🏗️ Gestión de Proyectos Vecinales</h1>
          <p className="text-muted">Administra todas las postulaciones de proyectos de la comunidad</p>
        </div>
        <Link href="/secretaria/proyectos/pendientes" className="btn btn-warning">
          ⏳ Ver Pendientes ({pendientes})
        </Link>
      </div>

      {error && (
        <div className="alert alert-danger mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Estadísticas */}
      <div className="row g-3 mb-4">
        <div className="col-md-2">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center py-3">
              <div className="fs-3 fw-bold text-primary">{totalProyectos}</div>
              <small className="text-muted">Total</small>
            </div>
          </div>
        </div>
        <div className="col-md-2">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center py-3">
              <div className="fs-3 fw-bold text-warning">{pendientes}</div>
              <small className="text-muted">Pendientes</small>
            </div>
          </div>
        </div>
        <div className="col-md-2">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center py-3">
              <div className="fs-3 fw-bold text-success">{aprobados}</div>
              <small className="text-muted">Aprobados</small>
            </div>
          </div>
        </div>
        <div className="col-md-2">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center py-3">
              <div className="fs-3 fw-bold text-info">{enEjecucion}</div>
              <small className="text-muted">En Ejecución</small>
            </div>
          </div>
        </div>
        <div className="col-md-2">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center py-3">
              <div className="fs-3 fw-bold text-secondary">{completados}</div>
              <small className="text-muted">Completados</small>
            </div>
          </div>
        </div>
        <div className="col-md-2">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center py-3">
              <div className="fs-3 fw-bold text-danger">{rechazados}</div>
              <small className="text-muted">Rechazados</small>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body p-4">
          <div className="row g-3">
            <div className="col-md-5">
              <label htmlFor="busqueda" className="form-label fw-semibold">
                Buscar proyecto:
              </label>
              <input
                type="text"
                id="busqueda"
                className="form-control"
                placeholder="Buscar por título, descripción o creador..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <label htmlFor="filtroEstado" className="form-label fw-semibold">
                Filtrar por estado:
              </label>
              <select
                id="filtroEstado"
                className="form-select"
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
            <div className="col-md-3 d-flex align-items-end">
              <div className="badge bg-light text-dark fs-6 p-3 w-100 text-center">
                {proyectosFiltrados.length} proyecto{proyectosFiltrados.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Proyectos */}
      {proyectosFiltrados.length === 0 ? (
        <div className="card shadow-sm border-0">
          <div className="card-body text-center py-5">
            <div className="empty-icon mb-3" style={{ fontSize: '3rem' }}>🏗️</div>
            <h5>No se encontraron proyectos</h5>
            <p className="text-muted">
              {busqueda ? 'Intenta con otros términos de búsqueda' : 'No hay proyectos registrados'}
            </p>
          </div>
        </div>
      ) : (
        <div className="card shadow-sm border-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th>Proyecto</th>
                  <th>Creador</th>
                  <th>Presupuesto</th>
                  <th>Beneficiarios</th>
                  <th>Fecha Postulación</th>
                  <th>Estado</th>
                  <th className="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {proyectosFiltrados.map((proyecto) => (
                  <tr key={proyecto.id}>
                    <td>
                      <div>
                        <strong>{proyecto.titulo}</strong>
                        <br />
                        <small className="text-muted">
                          {proyecto.descripcion.length > 80
                            ? `${proyecto.descripcion.substring(0, 80)}...`
                            : proyecto.descripcion}
                        </small>
                      </div>
                    </td>
                    <td>
                      {proyecto.creador ? (
                        <div>
                          <div>{proyecto.creador.nombres} {proyecto.creador.apellidos}</div>
                          <small className="text-muted">{proyecto.creador.email}</small>
                        </div>
                      ) : (
                        <span className="text-muted">N/A</span>
                      )}
                    </td>
                    <td>
                      <strong className="text-primary">{formatearPresupuesto(proyecto.presupuesto)}</strong>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark">
                        👥 {proyecto.num_beneficiarios}
                      </span>
                    </td>
                    <td>
                      <small>{formatearFecha(proyecto.created_at)}</small>
                    </td>
                    <td>
                      <span className={`badge ${getEstadoBadge(proyecto.estado)}`}>
                        {getEstadoIcon(proyecto.estado)} {getEstadoTexto(proyecto.estado)}
                      </span>
                    </td>
                    <td className="text-center">
                      <Link
                        href={`/secretaria/proyectos/${proyecto.id}`}
                        className="btn btn-sm btn-outline-primary"
                      >
                        Ver Detalle
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
