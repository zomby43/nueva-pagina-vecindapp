'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';

export default function SecretariaNoticiasPage() {
  const { user, userProfile } = useAuth();
  const [noticias, setNoticias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroCategoria, setFiltroCategoria] = useState('todas');
  const [noticiaSeleccionada, setNoticiaSeleccionada] = useState(null);
  const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false);

  useEffect(() => {
    if (user && userProfile?.rol === 'secretaria') {
      fetchNoticias();
    }
  }, [user, userProfile]);

  const fetchNoticias = async () => {
    try {
      setLoading(true);
      setError('');
      const supabase = createClient();

      const { data, error } = await supabase
        .from('noticias')
        .select(`
          *,
          autor:autor_id (
            nombres,
            apellidos
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching noticias:', error);
        throw error;
      }

      setNoticias(data || []);
    } catch (error) {
      console.error('Error completo:', error);
      setError('Error al cargar las noticias');
    } finally {
      setLoading(false);
    }
  };

  const cambiarEstadoNoticia = async (noticiaId, nuevoEstado) => {
    const noticiaActual = noticias.find(n => n.id === noticiaId);

    try {
      // Si es publicación y la noticia no estaba publicada antes, usar API route
      if (nuevoEstado === 'publicado' && noticiaActual?.estado !== 'publicado') {
        const response = await fetch('/api/noticias/publicar', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ noticiaId })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Error al publicar la noticia');
        }

        // Actualizar lista local
        setNoticias(prev =>
          prev.map(n =>
            n.id === noticiaId
              ? { ...n, estado: 'publicado', fecha_publicacion: new Date().toISOString() }
              : n
          )
        );

        alert('Noticia publicada exitosamente y notificaciones enviadas');

      } else {
        // Para otros cambios de estado, usar Supabase directamente
        const supabase = createClient();

        const updateData = { estado: nuevoEstado };

        const { error } = await supabase
          .from('noticias')
          .update(updateData)
          .eq('id', noticiaId);

        if (error) throw error;

        // Actualizar lista local
        setNoticias(prev =>
          prev.map(n =>
            n.id === noticiaId ? { ...n, estado: nuevoEstado } : n
          )
        );

        alert(`Noticia ${nuevoEstado === 'archivado' ? 'archivada' : 'guardada como borrador'} exitosamente`);
      }

    } catch (error) {
      console.error('Error updating noticia:', error);
      alert('Error al cambiar el estado de la noticia: ' + error.message);
    }
  };

  const toggleDestacado = async (noticiaId, destacadoActual) => {
    try {
      const supabase = createClient();

      const { error } = await supabase
        .from('noticias')
        .update({ destacado: !destacadoActual })
        .eq('id', noticiaId);

      if (error) throw error;

      setNoticias(prev =>
        prev.map(n =>
          n.id === noticiaId ? { ...n, destacado: !destacadoActual } : n
        )
      );

    } catch (error) {
      console.error('Error toggling destacado:', error);
      alert('Error al cambiar estado destacado');
    }
  };

  const eliminarNoticia = async () => {
    if (!noticiaSeleccionada) return;

    try {
      const supabase = createClient();

      const { error } = await supabase
        .from('noticias')
        .delete()
        .eq('id', noticiaSeleccionada.id);

      if (error) throw error;

      setNoticias(prev => prev.filter(n => n.id !== noticiaSeleccionada.id));
      setMostrarModalEliminar(false);
      setNoticiaSeleccionada(null);
      alert('Noticia eliminada exitosamente');

    } catch (error) {
      console.error('Error deleting noticia:', error);
      alert('Error al eliminar la noticia');
    }
  };

  const getEstadoBadge = (estado) => {
    switch (estado) {
      case 'publicado':
        return 'bg-success';
      case 'borrador':
        return 'bg-warning text-dark';
      case 'archivado':
        return 'bg-secondary';
      default:
        return 'bg-secondary';
    }
  };

  const getCategoriaBadge = (categoria) => {
    const colores = {
      general: 'bg-primary',
      eventos: 'bg-info',
      obras: 'bg-warning text-dark',
      seguridad: 'bg-danger',
      medio_ambiente: 'bg-success',
      cultura: 'bg-purple',
      deportes: 'bg-orange',
      otro: 'bg-secondary'
    };
    return colores[categoria] || 'bg-secondary';
  };

  const getCategoriaTexto = (categoria) => {
    const textos = {
      general: 'General',
      eventos: 'Eventos',
      obras: 'Obras',
      seguridad: 'Seguridad',
      medio_ambiente: 'Medio Ambiente',
      cultura: 'Cultura',
      deportes: 'Deportes',
      otro: 'Otro'
    };
    return textos[categoria] || categoria;
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'Sin fecha';
    return new Date(fecha).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Filtrar noticias
  const noticiasFiltradas = noticias.filter(noticia => {
    if (filtroEstado !== 'todos' && noticia.estado !== filtroEstado) return false;
    if (filtroCategoria !== 'todas' && noticia.categoria !== filtroCategoria) return false;
    return true;
  });

  const getResumenEstadisticas = () => {
    const total = noticias.length;
    const publicadas = noticias.filter(n => n.estado === 'publicado').length;
    const borradores = noticias.filter(n => n.estado === 'borrador').length;
    const archivadas = noticias.filter(n => n.estado === 'archivado').length;
    const destacadas = noticias.filter(n => n.destacado).length;

    return { total, publicadas, borradores, archivadas, destacadas };
  };

  const stats = getResumenEstadisticas();

  if (loading) {
    return (
      <div className="page-container">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="text-center">
            <div className="spinner-border mb-3" role="status"></div>
            <p>Cargando noticias...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1><i className="bi bi-newspaper me-2"></i>Gestión de Noticias</h1>
            <p className="text-muted">Administrar noticias y comunicados de la junta de vecinos</p>
          </div>
          <div className="d-flex gap-2">
            <button
              className="btn btn-primary"
              onClick={fetchNoticias}
              disabled={loading}
            >
              <i className="bi bi-arrow-clockwise me-2"></i>Actualizar
            </button>
            <Link href="/secretaria/noticias/nueva" className="btn btn-primary">
              <i className="bi bi-plus-circle me-2"></i>Nueva Noticia
            </Link>
          </div>
        </div>
      </div>

      <div className="solicitudes-content">
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
                <div className="fs-3 fw-bold text-primary">{stats.total}</div>
                <small className="text-muted">Total</small>
              </div>
            </div>
          </div>
          <div className="col-md-2">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center py-3">
                <div className="fs-3 fw-bold text-success">{stats.publicadas}</div>
                <small className="text-muted">Publicadas</small>
              </div>
            </div>
          </div>
          <div className="col-md-2">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center py-3">
                <div className="fs-3 fw-bold text-warning">{stats.borradores}</div>
                <small className="text-muted">Borradores</small>
              </div>
            </div>
          </div>
          <div className="col-md-2">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center py-3">
                <div className="fs-3 fw-bold text-secondary">{stats.archivadas}</div>
                <small className="text-muted">Archivadas</small>
              </div>
            </div>
          </div>
          <div className="col-md-2">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center py-3">
                <div className="fs-3 fw-bold text-info">{stats.destacadas}</div>
                <small className="text-muted">Destacadas</small>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="card mb-4">
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-4">
                <label htmlFor="filtroEstado" className="form-label">Estado:</label>
                <select
                  id="filtroEstado"
                  className="form-select"
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                >
                  <option value="todos">Todos los estados</option>
                  <option value="publicado">Publicadas</option>
                  <option value="borrador">Borradores</option>
                  <option value="archivado">Archivadas</option>
                </select>
              </div>
              <div className="col-md-4">
                <label htmlFor="filtroCategoria" className="form-label">Categoría:</label>
                <select
                  id="filtroCategoria"
                  className="form-select"
                  value={filtroCategoria}
                  onChange={(e) => setFiltroCategoria(e.target.value)}
                >
                  <option value="todas">Todas las categorías</option>
                  <option value="general">General</option>
                  <option value="eventos">Eventos</option>
                  <option value="obras">Obras</option>
                  <option value="seguridad">Seguridad</option>
                  <option value="medio_ambiente">Medio Ambiente</option>
                  <option value="cultura">Cultura</option>
                  <option value="deportes">Deportes</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
              <div className="col-md-4 d-flex align-items-end">
                <span className="text-muted">
                  Mostrando {noticiasFiltradas.length} de {noticias.length} noticias
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de noticias */}
        <div className="card">
          <div className="card-header">
            <h5 className="mb-0">Noticias</h5>
          </div>
          <div className="card-body">
            {noticiasFiltradas.length === 0 ? (
              <div className="empty-state text-center py-5">
                <i className="bi bi-newspaper d-block text-muted mb-3" style={{ fontSize: '3rem' }}></i>
                <h5>No hay noticias</h5>
                <p className="text-muted">Crea tu primera noticia para comunicarte con los vecinos</p>
                <Link href="/secretaria/noticias/nueva" className="btn btn-primary">
                  <i className="bi bi-plus-circle me-2"></i>Nueva Noticia
                </Link>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th style={{ width: '80px' }}>Imagen</th>
                      <th>Título</th>
                      <th>Categoría</th>
                      <th>Estado</th>
                      <th>Fecha Publicación</th>
                      <th>Destacado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {noticiasFiltradas.map((noticia) => (
                      <tr key={noticia.id}>
                        <td>
                          {noticia.imagen_url ? (
                            <div style={{ width: '60px', height: '40px', overflow: 'hidden', borderRadius: '4px', backgroundColor: '#f5f5f5' }}>
                              <img
                                src={noticia.imagen_url}
                                alt={noticia.titulo}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            </div>
                          ) : (
                            <div style={{ width: '60px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                              <i className="bi bi-newspaper" style={{ fontSize: '1.2rem', color: '#999' }}></i>
                            </div>
                          )}
                        </td>
                        <td>
                          <div>
                            <div className="fw-medium">{noticia.titulo}</div>
                            {noticia.resumen && (
                              <small className="text-muted">
                                {noticia.resumen.length > 50
                                  ? `${noticia.resumen.substring(0, 50)}...`
                                  : noticia.resumen}
                              </small>
                            )}
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${getCategoriaBadge(noticia.categoria)}`}>
                            {getCategoriaTexto(noticia.categoria)}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${getEstadoBadge(noticia.estado)}`}>
                            {noticia.estado}
                          </span>
                        </td>
                        <td>
                          <small>{formatearFecha(noticia.fecha_publicacion)}</small>
                        </td>
                        <td>
                          <button
                            className={`btn btn-sm ${noticia.destacado ? 'btn-warning text-white' : 'btn-secondary text-white'}`}
                            onClick={() => toggleDestacado(noticia.id, noticia.destacado)}
                            title={noticia.destacado ? 'Quitar destacado' : 'Marcar como destacado'}
                          >
                            <i className={`bi ${noticia.destacado ? 'bi-star-fill' : 'bi-star'}`}></i>
                          </button>
                        </td>
                        <td>
                          <div className="btn-group btn-group-sm">
                            <Link
                              href={`/secretaria/noticias/editar/${noticia.id}`}
                              className="btn btn-primary text-white"
                              title="Editar noticia"
                            >
                              <i className="bi bi-pencil-fill me-1"></i>Editar
                            </Link>
                            {noticia.estado === 'borrador' && (
                              <button
                                className="btn btn-success text-white"
                                onClick={() => cambiarEstadoNoticia(noticia.id, 'publicado')}
                                title="Publicar noticia"
                              >
                                <i className="bi bi-megaphone me-1"></i>Publicar
                              </button>
                            )}
                            {noticia.estado === 'publicado' && (
                              <button
                                className="btn btn-warning text-white"
                                onClick={() => cambiarEstadoNoticia(noticia.id, 'archivado')}
                                title="Archivar noticia"
                              >
                                <i className="bi bi-archive me-1"></i>Archivar
                              </button>
                            )}
                            <button
                              className="btn btn-danger text-white"
                              onClick={() => {
                                setNoticiaSeleccionada(noticia);
                                setMostrarModalEliminar(true);
                              }}
                              title="Eliminar noticia"
                            >
                              <i className="bi bi-trash-fill me-1"></i>Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de confirmación de eliminación */}
      {mostrarModalEliminar && noticiaSeleccionada && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setMostrarModalEliminar(false)}>
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirmar Eliminación</h5>
                <button type="button" className="btn-close" onClick={() => setMostrarModalEliminar(false)}></button>
              </div>
              <div className="modal-body">
                <p>¿Estás segura de que deseas eliminar la noticia <strong>"{noticiaSeleccionada.titulo}"</strong>?</p>
                <p className="text-danger mb-0">Esta acción no se puede deshacer.</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setMostrarModalEliminar(false)}>
                  Cancelar
                </button>
                <button type="button" className="btn btn-danger" onClick={eliminarNoticia}>
                  Eliminar Noticia
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
