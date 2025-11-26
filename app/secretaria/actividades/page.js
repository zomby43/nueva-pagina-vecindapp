'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export default function SecretariaActividadesPage() {
  const { user } = useAuth();
  const [actividades, setActividades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todas');
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    fetchActividades();
  }, []);

  const fetchActividades = async () => {
    try {
      setLoading(true);
      setError('');
      const supabase = createClient();

      const { data, error } = await supabase
        .from('actividades')
        .select(`
          *,
          organizador:organizador_id (
            nombres,
            apellidos
          ),
          inscripciones:inscripciones_actividades (
            id,
            estado
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setActividades(data || []);
    } catch (error) {
      console.error('Error fetching actividades:', error);
      setError('Error al cargar las actividades');
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async (id) => {
    if (!confirm('¿Estás seguro de eliminar esta actividad? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('actividades')
        .delete()
        .eq('id', id);

      if (error) throw error;
      alert('Actividad eliminada exitosamente');
      fetchActividades();
    } catch (error) {
      console.error('Error al eliminar:', error);
      alert('Error al eliminar la actividad');
    }
  };

  const handleCambiarEstado = async (id, nuevoEstado) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('actividades')
        .update({ estado: nuevoEstado })
        .eq('id', id);

      if (error) throw error;
      alert(`Actividad cambiada a estado: ${nuevoEstado}`);
      fetchActividades();
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      alert('Error al cambiar el estado');
    }
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEstadoBadge = (estado) => {
    const badges = {
      borrador: { bg: '#6c757d', text: 'white', label: 'Borrador', icon: 'bi-file-earmark' },
      publicada: { bg: '#0dcaf0', text: 'white', label: 'Publicada', icon: 'bi-megaphone' },
      en_curso: { bg: '#198754', text: 'white', label: 'En Curso', icon: 'bi-arrow-repeat' },
      finalizada: { bg: '#6c757d', text: 'white', label: 'Finalizada', icon: 'bi-check-circle' },
      cancelada: { bg: '#dc3545', text: 'white', label: 'Cancelada', icon: 'bi-x-circle' }
    };
    return badges[estado] || { bg: '#6c757d', text: 'white', label: estado, icon: 'bi-circle' };
  };

  const getCategoriaInfo = (categoria) => {
    const info = {
      deportiva: { label: 'Deportiva', icon: 'bi-trophy' },
      cultural: { label: 'Cultural', icon: 'bi-palette' },
      educativa: { label: 'Educativa', icon: 'bi-book' },
      social: { label: 'Social', icon: 'bi-people' },
      ambiental: { label: 'Ambiental', icon: 'bi-tree' },
      salud: { label: 'Salud', icon: 'bi-heart-pulse' },
      recreativa: { label: 'Recreativa', icon: 'bi-balloon' },
      otro: { label: 'Otro', icon: 'bi-bookmark' }
    };
    return info[categoria] || { label: categoria, icon: 'bi-circle' };
  };

  const actividadesFiltradas = actividades.filter(actividad => {
    if (filtroEstado !== 'todas' && actividad.estado !== filtroEstado) return false;
    if (busqueda && !actividad.titulo.toLowerCase().includes(busqueda.toLowerCase())) return false;
    return true;
  });

  const contarInscripciones = (inscripciones, estado) => {
    return inscripciones?.filter(i => i.estado === estado).length || 0;
  };

  if (loading) {
    return (
      <div style={{ width: '100%', maxWidth: '100%', padding: '2rem', background: '#f4f8f9', borderRadius: '16px' }}>
        <div className="text-center py-5">
          <div className="spinner-border mb-3" role="status"></div>
          <p>Cargando actividades...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', maxWidth: '100%', padding: '2rem', background: '#f4f8f9', borderRadius: '16px' }}>
      <div className="d-flex justify-content-between align-items-center mb-5">
        <div>
          <h1 className="display-6 fw-bold mb-2"><i className="bi bi-calendar-event me-2"></i>Gestión de Actividades</h1>
          <p className="text-muted">Administra las actividades vecinales</p>
        </div>
        <Link href="/secretaria/actividades/nueva" className="btn btn-primary btn-lg">
          <i className="bi bi-plus-circle me-2"></i>Nueva Actividad
        </Link>
      </div>

      {error && (
        <div className="alert alert-danger mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Filtros */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body p-4">
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label fw-semibold">
                <i className="bi bi-search me-2"></i>Buscar:
              </label>
              <input
                type="text"
                className="form-control form-control-lg"
                placeholder="Buscar por título..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">
                <i className="bi bi-funnel me-2"></i>Estado:
              </label>
              <select
                className="form-select form-select-lg"
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
              >
                <option value="todas">Todos los estados</option>
                <option value="borrador">Borrador</option>
                <option value="publicada">Publicada</option>
                <option value="en_curso">En Curso</option>
                <option value="finalizada">Finalizada</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de actividades */}
      {actividadesFiltradas.length === 0 ? (
        <div className="card border-0 shadow-sm text-center py-5">
          <div className="card-body">
            <i className="bi bi-inbox fs-1 mb-3 d-block text-muted"></i>
            <h3>No hay actividades</h3>
            <p className="text-muted mb-4">
              {busqueda || filtroEstado !== 'todas'
                ? 'No se encontraron actividades con estos filtros'
                : 'Aún no se han creado actividades'}
            </p>
            <Link href="/secretaria/actividades/nueva" className="btn btn-primary">
              <i className="bi bi-plus-circle me-2"></i>Crear Primera Actividad
            </Link>
          </div>
        </div>
      ) : (
        <div className="card border-0 shadow-sm">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="px-3 py-3 fw-bold">Título</th>
                    <th className="px-3 py-3 fw-bold text-center">Categoría</th>
                    <th className="px-3 py-3 fw-bold text-center" style={{ minWidth: '90px' }}>Cupos</th>
                    <th className="px-3 py-3 fw-bold text-center" style={{ minWidth: '110px' }}>Inscripciones</th>
                    <th className="px-3 py-3 fw-bold" style={{ minWidth: '130px' }}>Fecha Inicio</th>
                    <th className="px-3 py-3 fw-bold text-center" style={{ minWidth: '110px' }}>Estado</th>
                    <th className="px-3 py-3 fw-bold text-center" style={{ minWidth: '160px' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {actividadesFiltradas.map((actividad) => {
                    const estadoBadge = getEstadoBadge(actividad.estado);
                    const inscripcionesPendientes = contarInscripciones(actividad.inscripciones, 'pendiente');
                    const inscripcionesAprobadas = contarInscripciones(actividad.inscripciones, 'aprobada');
                    const totalInscripciones = actividad.inscripciones?.length || 0;

                    const categoriaInfo = getCategoriaInfo(actividad.categoria);

                    return (
                      <tr key={actividad.id}>
                        <td className="px-3 py-3">
                          <div>
                            <div className="fw-semibold text-dark">{actividad.titulo}</div>
                            <small className="text-muted">
                              <i className="bi bi-person-badge me-1"></i>
                              {actividad.organizador?.nombres} {actividad.organizador?.apellidos}
                            </small>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span
                            className="d-inline-flex align-items-center"
                            title={categoriaInfo.label}
                          >
                            <i className={`${categoriaInfo.icon} text-primary`} style={{ fontSize: '1.25rem' }}></i>
                          </span>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <div>
                            <strong className="text-dark">{actividad.cupo_disponible}</strong>
                            <span className="text-muted"> / {actividad.cupo_maximo}</span>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <div className="d-flex flex-column align-items-center">
                            <strong className="text-dark">{totalInscripciones}</strong>
                            {inscripcionesPendientes > 0 && (
                              <span className="badge bg-warning text-dark mt-1" style={{ fontSize: '0.7rem' }}>
                                {inscripcionesPendientes} pend.
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <small className="text-dark">{formatearFecha(actividad.fecha_inicio)}</small>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span
                            className="badge d-inline-flex align-items-center"
                            style={{
                              backgroundColor: estadoBadge.bg,
                              color: estadoBadge.text,
                              fontSize: '0.8rem',
                              padding: '0.35rem 0.65rem'
                            }}
                          >
                            <i className={`${estadoBadge.icon} me-1`}></i>
                            {estadoBadge.label}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <div className="btn-group" role="group">
                            <Link
                              href={`/secretaria/actividades/inscripciones/${actividad.id}`}
                              className="btn btn-sm btn-primary text-white"
                              title="Ver inscripciones"
                              style={{ padding: '0.25rem 0.5rem' }}
                            >
                              <i className="bi bi-people-fill"></i>
                            </Link>
                            <Link
                              href={`/secretaria/actividades/editar/${actividad.id}`}
                              className="btn btn-sm btn-warning text-white"
                              title="Editar actividad"
                              style={{ padding: '0.25rem 0.5rem' }}
                            >
                              <i className="bi bi-pencil-fill"></i>
                            </Link>

                            {/* Dropdown de cambiar estado */}
                            <div className="btn-group" role="group">
                              <button
                                className="btn btn-sm btn-info text-white dropdown-toggle"
                                type="button"
                                data-bs-toggle="dropdown"
                                title="Cambiar estado"
                                style={{ padding: '0.25rem 0.5rem' }}
                              >
                                <i className="bi bi-arrow-repeat"></i>
                              </button>
                              <ul className="dropdown-menu">
                                {actividad.estado !== 'borrador' && (
                                  <li>
                                    <a
                                      className="dropdown-item"
                                      href="#"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        handleCambiarEstado(actividad.id, 'borrador');
                                      }}
                                    >
                                      <i className="bi bi-file-earmark me-2"></i>Borrador
                                    </a>
                                  </li>
                                )}
                                {actividad.estado !== 'publicada' && (
                                  <li>
                                    <a
                                      className="dropdown-item"
                                      href="#"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        handleCambiarEstado(actividad.id, 'publicada');
                                      }}
                                    >
                                      <i className="bi bi-megaphone me-2"></i>Publicar
                                    </a>
                                  </li>
                                )}
                                {actividad.estado !== 'en_curso' && (
                                  <li>
                                    <a
                                      className="dropdown-item"
                                      href="#"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        handleCambiarEstado(actividad.id, 'en_curso');
                                      }}
                                    >
                                      <i className="bi bi-arrow-repeat me-2"></i>En Curso
                                    </a>
                                  </li>
                                )}
                                {actividad.estado !== 'finalizada' && (
                                  <li>
                                    <a
                                      className="dropdown-item"
                                      href="#"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        handleCambiarEstado(actividad.id, 'finalizada');
                                      }}
                                    >
                                      <i className="bi bi-check-circle me-2"></i>Finalizar
                                    </a>
                                  </li>
                                )}
                                {actividad.estado !== 'cancelada' && (
                                  <li>
                                    <a
                                      className="dropdown-item text-danger"
                                      href="#"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        if (confirm('¿Cancelar esta actividad?')) {
                                          handleCambiarEstado(actividad.id, 'cancelada');
                                        }
                                      }}
                                    >
                                      <i className="bi bi-x-circle me-2"></i>Cancelar
                                    </a>
                                  </li>
                                )}
                              </ul>
                            </div>

                            <button
                              onClick={() => handleEliminar(actividad.id)}
                              className="btn btn-sm btn-danger text-white"
                              title="Eliminar actividad"
                              style={{ padding: '0.25rem 0.5rem' }}
                            >
                              <i className="bi bi-trash-fill"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
