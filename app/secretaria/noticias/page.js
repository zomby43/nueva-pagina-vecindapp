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
    try {
      const supabase = createClient();

      const updateData = {
        estado: nuevoEstado
      };

      // Si se publica, agregar fecha de publicación
      if (nuevoEstado === 'publicado') {
        updateData.fecha_publicacion = new Date().toISOString();
      }

      const { error } = await supabase
        .from('noticias')
        .update(updateData)
        .eq('id', noticiaId);

      if (error) throw error;

      // Actualizar lista local
      setNoticias(prev =>
        prev.map(n =>
          n.id === noticiaId
            ? { ...n, estado: nuevoEstado, fecha_publicacion: nuevoEstado === 'publicado' ? new Date().toISOString() : n.fecha_publicacion }
            : n
        )
      );

      alert(`Noticia ${nuevoEstado === 'publicado' ? 'publicada' : nuevoEstado === 'archivado' ? 'archivada' : 'guardada como borrador'} exitosamente`);

    } catch (error) {
      console.error('Error updating noticia:', error);
      alert('Error al cambiar el estado de la noticia');
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
            <h1>Gestión de Noticias</h1>
            <p className="text-muted">Administrar noticias y comunicados de la junta de vecinos</p>
          </div>
          <div className="d-flex gap-2">
            <button
              className="btn btn-outline-primary"
              onClick={fetchNoticias}
              disabled={loading}
            >
              🔄 Actualizar
            </button>
            <Link href="/secretaria/noticias/nueva" className="btn btn-primary">
              ➕ Nueva Noticia
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
        <div className="row mb-4">
          <div className="col-md-2">
            <div className="stat-card text-center">
              <div className="stat-number">{stats.total}</div>
              <div className="stat-label">Total</div>
            </div>
          </div>
          <div className="col-md-2">
            <div className="stat-card text-center">
              <div className="stat-number text-success">{stats.publicadas}</div>
              <div className="stat-label">Publicadas</div>
            </div>
          </div>
          <div className="col-md-2">
            <div className="stat-card text-center">
              <div className="stat-number text-warning">{stats.borradores}</div>
              <div className="stat-label">Borradores</div>
            </div>
          </div>
          <div className="col-md-2">
            <div className="stat-card text-center">
              <div className="stat-number text-secondary">{stats.archivadas}</div>
              <div className="stat-label">Archivadas</div>
            </div>
          </div>
          <div className="col-md-2">
            <div className="stat-card text-center">
              <div className="stat-number text-info">{stats.destacadas}</div>
              <div className="stat-label">Destacadas</div>
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
                <div className="empty-icon mb-3" style={{ fontSize: '3rem' }}>📰</div>
                <h5>No hay noticias</h5>
                <p className="text-muted">Crea tu primera noticia para comunicarte con los vecinos</p>
                <Link href="/secretaria/noticias/nueva" className="btn btn-primary">
                  ➕ Nueva Noticia
                </Link>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
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
                            className={`btn btn-sm ${noticia.destacado ? 'btn-warning' : 'btn-outline-secondary'}`}
                            onClick={() => toggleDestacado(noticia.id, noticia.destacado)}
                            title={noticia.destacado ? 'Quitar destacado' : 'Marcar como destacado'}
                          >
                            {noticia.destacado ? '⭐' : '☆'}
                          </button>
                        </td>
                        <td>
                          <div className="btn-group btn-group-sm">
                            <Link
                              href={`/secretaria/noticias/editar/${noticia.id}`}
                              className="btn btn-outline-primary"
                            >
                              ✏️ Editar
                            </Link>
                            {noticia.estado === 'borrador' && (
                              <button
                                className="btn btn-outline-success"
                                onClick={() => cambiarEstadoNoticia(noticia.id, 'publicado')}
                              >
                                📢 Publicar
                              </button>
                            )}
                            {noticia.estado === 'publicado' && (
                              <button
                                className="btn btn-outline-warning"
                                onClick={() => cambiarEstadoNoticia(noticia.id, 'archivado')}
                              >
                                📦 Archivar
                              </button>
                            )}
                            <button
                              className="btn btn-outline-danger"
                              onClick={() => {
                                setNoticiaSeleccionada(noticia);
                                setMostrarModalEliminar(true);
                              }}
                            >
                              🗑️ Eliminar
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
