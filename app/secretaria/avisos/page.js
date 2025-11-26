'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function AvisosSecretariaPage() {
  const [avisos, setAvisos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroPrioridad, setFiltroPrioridad] = useState('todos');

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
        .select(`
          *,
          autor:autor_id (
            nombres,
            apellidos
          )
        `)
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

  const cambiarEstado = async (avisoId, nuevoEstado) => {
    const avisoActual = avisos.find(a => a.id === avisoId);

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('avisos')
        .update({ estado: nuevoEstado })
        .eq('id', avisoId);

      if (error) throw error;

      alert(`Aviso ${nuevoEstado === 'activo' ? 'activado' : nuevoEstado === 'inactivo' ? 'desactivado' : 'archivado'} exitosamente`);

      // Si se activa un aviso que no estaba activo, enviar notificaciones via API
      if (nuevoEstado === 'activo' && avisoActual?.estado !== 'activo') {
        try {
          const response = await fetch('/api/avisos/publicar', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ avisoId })
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || 'Error al enviar notificaciones');
          }

          console.log('✅ Notificaciones de aviso enviadas:', data);
        } catch (emailError) {
          console.error('⚠️ Error al enviar notificaciones de aviso:', emailError);
          alert(`Aviso activado pero no se pudieron enviar las notificaciones: ${emailError.message}`);
        }
      }

      fetchAvisos();
    } catch (error) {
      console.error('Error cambiando estado:', error);
      alert('Error al cambiar el estado del aviso');
    }
  };

  const toggleDestacado = async (avisoId, destacadoActual) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('avisos')
        .update({ destacado: !destacadoActual })
        .eq('id', avisoId);

      if (error) throw error;
      fetchAvisos();
    } catch (error) {
      console.error('Error toggle destacado:', error);
      alert('Error al cambiar destacado');
    }
  };

  const eliminarAviso = async (avisoId) => {
    if (!confirm('¿Estás seguro de eliminar este aviso? Esta acción no se puede deshacer.')) return;

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('avisos')
        .delete()
        .eq('id', avisoId);

      if (error) throw error;

      alert('Aviso eliminado exitosamente');
      fetchAvisos();
    } catch (error) {
      console.error('Error eliminando aviso:', error);
      alert('Error al eliminar el aviso');
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

  const getTipoBadge = (tipo) => {
    const badges = {
      informativo: 'bg-info',
      urgente: 'bg-danger',
      mantenimiento: 'bg-warning text-dark',
      evento: 'bg-success',
      corte_servicio: 'bg-warning text-dark',
      seguridad: 'bg-danger',
      otro: 'bg-secondary'
    };
    return badges[tipo] || 'bg-secondary';
  };

  const getPrioridadBadge = (prioridad) => {
    const badges = {
      baja: 'bg-secondary',
      media: 'bg-info',
      alta: 'bg-warning text-dark',
      critica: 'bg-danger'
    };
    return badges[prioridad] || 'bg-secondary';
  };

  const avisosFiltrados = avisos.filter(aviso => {
    if (filtroEstado !== 'todos' && aviso.estado !== filtroEstado) return false;
    if (filtroPrioridad !== 'todos' && aviso.prioridad !== filtroPrioridad) return false;
    return true;
  });

  const stats = {
    total: avisos.length,
    activos: avisos.filter(a => a.estado === 'activo').length,
    destacados: avisos.filter(a => a.destacado).length,
    criticos: avisos.filter(a => a.prioridad === 'critica').length
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="text-center py-5">
          <div className="spinner-border mb-3" role="status"></div>
          <p>Cargando avisos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1><i className="bi bi-megaphone me-2"></i>Gestión de Avisos</h1>
          <p className="text-muted">Administra los avisos y notificaciones de la junta de vecinos</p>
        </div>
        <Link href="/secretaria/avisos/nuevo" className="btn btn-primary">
          <i className="bi bi-plus-circle me-2"></i>Nuevo Aviso
        </Link>
      </div>

      {error && (
        <div className="alert alert-danger mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Estadísticas */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <h3 className="text-primary mb-0">{stats.total}</h3>
              <small className="text-muted">Total Avisos</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <h3 className="text-success mb-0">{stats.activos}</h3>
              <small className="text-muted">Activos</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <h3 className="text-warning mb-0">{stats.destacados}</h3>
              <small className="text-muted">Destacados</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <h3 className="text-danger mb-0">{stats.criticos}</h3>
              <small className="text-muted">Críticos</small>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Filtrar por estado:</label>
              <select
                className="form-select"
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
              >
                <option value="todos">Todos los estados</option>
                <option value="activo">Activos</option>
                <option value="inactivo">Inactivos</option>
                <option value="archivado">Archivados</option>
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label">Filtrar por prioridad:</label>
              <select
                className="form-select"
                value={filtroPrioridad}
                onChange={(e) => setFiltroPrioridad(e.target.value)}
              >
                <option value="todos">Todas las prioridades</option>
                <option value="critica">Crítica</option>
                <option value="alta">Alta</option>
                <option value="media">Media</option>
                <option value="baja">Baja</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Avisos */}
      {avisosFiltrados.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-5">
            <i className="bi bi-megaphone d-block text-muted mb-3" style={{ fontSize: '3rem' }}></i>
            <h5>No hay avisos</h5>
            <p className="text-muted">
              {filtroEstado === 'todos' && filtroPrioridad === 'todos'
                ? 'Aún no se han creado avisos'
                : 'No hay avisos con los filtros seleccionados'}
            </p>
          </div>
        </div>
      ) : (
        <div className="row g-3">
          {avisosFiltrados.map((aviso) => (
            <div key={aviso.id} className="col-12">
              <div className={`card ${aviso.destacado ? 'border-warning' : ''}`} style={aviso.destacado ? { borderWidth: '2px' } : {}}>
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-3 gap-3">
                    {aviso.imagen_url && (
                      <div style={{ flexShrink: 0 }}>
                        <img
                          src={aviso.imagen_url}
                          alt={aviso.titulo}
                          className="rounded"
                          style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                        />
                      </div>
                    )}
                    <div className="flex-grow-1">
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <span className={`badge ${getTipoBadge(aviso.tipo)}`}>
                          {getTipoTexto(aviso.tipo)}
                        </span>
                        <span className={`badge ${getPrioridadBadge(aviso.prioridad)}`}>
                          {aviso.prioridad.charAt(0).toUpperCase() + aviso.prioridad.slice(1)}
                        </span>
                        <span className={`badge ${aviso.estado === 'activo' ? 'bg-success' : aviso.estado === 'inactivo' ? 'bg-secondary' : 'bg-dark'}`}>
                          {aviso.estado.charAt(0).toUpperCase() + aviso.estado.slice(1)}
                        </span>
                        {aviso.destacado && (
                          <span className="badge bg-warning text-dark d-inline-flex align-items-center">
                            <i className="bi bi-star-fill me-1"></i>Destacado
                          </span>
                        )}
                        {aviso.imagen_url && (
                          <span className="badge bg-info text-white d-inline-flex align-items-center">
                            <i className="bi bi-image me-1"></i>Con imagen
                          </span>
                        )}
                      </div>
                      <h5 className="card-title mb-2">{aviso.titulo}</h5>
                      <p className="card-text mb-2">{aviso.mensaje}</p>
                      <small className="text-muted">
                        Creado el {new Date(aviso.created_at).toLocaleDateString('es-CL')}
                        {aviso.autor && ` por ${aviso.autor.nombres} ${aviso.autor.apellidos}`}
                      </small>
                    </div>
                  </div>

                  <div className="d-flex gap-2 flex-wrap">
                    <Link
                      href={`/secretaria/avisos/editar/${aviso.id}`}
                      className="btn btn-sm btn-primary text-white"
                      title="Editar aviso"
                    >
                      <i className="bi bi-pencil-fill me-1"></i>Editar
                    </Link>
                    <button
                      onClick={() => toggleDestacado(aviso.id, aviso.destacado)}
                      className="btn btn-sm btn-warning text-white"
                      title={aviso.destacado ? "Quitar destacado" : "Destacar aviso"}
                    >
                      {aviso.destacado ? (
                        <>
                          <i className="bi bi-star me-1"></i>Quitar destacado
                        </>
                      ) : (
                        <>
                          <i className="bi bi-star-fill me-1"></i>Destacar
                        </>
                      )}
                    </button>
                    {aviso.estado === 'activo' && (
                      <button
                        onClick={() => cambiarEstado(aviso.id, 'inactivo')}
                        className="btn btn-sm btn-secondary text-white"
                        title="Desactivar aviso"
                      >
                        <i className="bi bi-dash-circle me-1"></i>Desactivar
                      </button>
                    )}
                    {aviso.estado === 'inactivo' && (
                      <button
                        onClick={() => cambiarEstado(aviso.id, 'activo')}
                        className="btn btn-sm btn-success text-white"
                        title="Activar aviso"
                      >
                        <i className="bi bi-check-circle me-1"></i>Activar
                      </button>
                    )}
                    <button
                      onClick={() => cambiarEstado(aviso.id, 'archivado')}
                      className="btn btn-sm btn-dark text-white"
                      title="Archivar aviso"
                    >
                      <i className="bi bi-archive me-1"></i>Archivar
                    </button>
                    <button
                      onClick={() => eliminarAviso(aviso.id)}
                      className="btn btn-sm btn-danger text-white"
                      title="Eliminar aviso"
                    >
                      <i className="bi bi-trash-fill me-1"></i>Eliminar
                    </button>
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
