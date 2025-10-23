'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';

export default function SecretariaSolicitudesPage() {
  const { user, userProfile } = useAuth();
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [procesandoId, setProcesandoId] = useState(null);

  useEffect(() => {
    if (user && userProfile?.rol === 'secretaria') {
      fetchSolicitudes();
    }
  }, [user, userProfile]);

  const fetchSolicitudes = async () => {
    try {
      setLoading(true);
      setError('');
      const supabase = createClient();

      console.log('🔍 Intentando cargar solicitudes...');
      console.log('👤 Usuario actual:', user?.id);
      console.log('👔 Perfil de usuario:', userProfile);

      // Primero probemos una consulta simple
      const { data, error } = await supabase
        .from('solicitudes')
        .select(`
          id,
          tipo,
          estado,
          motivo,
          observaciones,
          fecha_solicitud,
          fecha_respuesta,
          created_at,
          usuario_id
        `)
        .order('fecha_solicitud', { ascending: false });

      if (error) {
        console.error('❌ Error de Supabase:', error);
        throw error;
      }

      console.log('✅ Solicitudes cargadas:', data?.length || 0);
      setSolicitudes(data || []);
    } catch (error) {
      console.error('❌ Error completo:', error);
      setError(`Error al cargar las solicitudes: ${error.message || error.toString()}`);
    } finally {
      setLoading(false);
    }
  };

  const cambiarEstadoSolicitud = async (solicitudId, nuevoEstado, motivo = null) => {
    try {
      setProcesandoId(solicitudId);
      const supabase = createClient();

      const updateData = {
        estado: nuevoEstado,
        atendido_por: user.id,
        updated_at: new Date().toISOString()
      };

      // Si se completa o rechaza, agregar fecha de respuesta
      if (nuevoEstado === 'completado' || nuevoEstado === 'rechazado') {
        updateData.fecha_respuesta = new Date().toISOString();
      }

      const { error } = await supabase
        .from('solicitudes')
        .update(updateData)
        .eq('id', solicitudId);

      if (error) {
        throw error;
      }

      // Actualizar la lista local
      setSolicitudes(prev => 
        prev.map(sol => 
          sol.id === solicitudId 
            ? { ...sol, estado: nuevoEstado, atendido_por: user.id, fecha_respuesta: nuevoEstado === 'completado' || nuevoEstado === 'rechazado' ? new Date().toISOString() : null }
            : sol
        )
      );

      alert(`Solicitud ${nuevoEstado === 'completado' ? 'aprobada' : nuevoEstado === 'rechazado' ? 'rechazada' : 'actualizada'} exitosamente`);

    } catch (error) {
      console.error('Error updating solicitud:', error);
      alert('Error al actualizar la solicitud');
    } finally {
      setProcesandoId(null);
    }
  };

  const getEstadoBadge = (estado) => {
    switch (estado) {
      case 'completado':
        return 'bg-success';
      case 'en_proceso':
        return 'bg-warning text-dark';
      case 'rechazado':
        return 'bg-danger';
      case 'pendiente':
        return 'bg-secondary';
      default:
        return 'bg-secondary';
    }
  };

  const getEstadoTexto = (estado) => {
    switch (estado) {
      case 'completado':
        return 'Completado';
      case 'en_proceso':
        return 'En Proceso';
      case 'rechazado':
        return 'Rechazado';
      case 'pendiente':
        return 'Pendiente';
      default:
        return 'Pendiente';
    }
  };

  const getTipoTexto = (tipo) => {
    switch (tipo) {
      case 'certificado_residencia':
        return 'Certificado de Residencia';
      case 'certificado_antiguedad':
        return 'Certificado de Antigüedad';
      case 'otro':
        return 'Otro';
      default:
        return tipo;
    }
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const solicitudesFiltradas = solicitudes.filter(solicitud => {
    if (filtroEstado === 'todos') return true;
    return solicitud.estado === filtroEstado;
  });

  const getResumenEstadisticas = () => {
    const total = solicitudes.length;
    const pendientes = solicitudes.filter(s => s.estado === 'pendiente').length;
    const enProceso = solicitudes.filter(s => s.estado === 'en_proceso').length;
    const completadas = solicitudes.filter(s => s.estado === 'completado').length;
    const rechazadas = solicitudes.filter(s => s.estado === 'rechazado').length;

    return { total, pendientes, enProceso, completadas, rechazadas };
  };

  const stats = getResumenEstadisticas();

  if (loading) {
    return (
      <div className="page-container">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="text-center">
            <div className="spinner-border mb-3" role="status"></div>
            <p>Cargando solicitudes...</p>
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
            <h1>Gestión de Solicitudes</h1>
            <p className="text-muted">Administrar solicitudes de certificados de vecinos</p>
          </div>
          <button 
            className="btn btn-outline-primary"
            onClick={fetchSolicitudes}
            disabled={loading}
          >
            🔄 Actualizar
          </button>
        </div>
      </div>

      <div className="solicitudes-content">
        {/* Mostrar error si existe */}
        {error && (
          <div className="alert alert-danger mb-4">
            <strong>Error:</strong> {error}
            <button 
              className="btn btn-sm btn-outline-danger ms-2"
              onClick={fetchSolicitudes}
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Resumen de estadísticas */}
        <div className="row mb-4">
          <div className="col-md-2">
            <div className="stat-card text-center">
              <div className="stat-number">{stats.total}</div>
              <div className="stat-label">Total</div>
            </div>
          </div>
          <div className="col-md-2">
            <div className="stat-card text-center">
              <div className="stat-number text-warning">{stats.pendientes}</div>
              <div className="stat-label">Pendientes</div>
            </div>
          </div>
          <div className="col-md-2">
            <div className="stat-card text-center">
              <div className="stat-number text-info">{stats.enProceso}</div>
              <div className="stat-label">En Proceso</div>
            </div>
          </div>
          <div className="col-md-2">
            <div className="stat-card text-center">
              <div className="stat-number text-success">{stats.completadas}</div>
              <div className="stat-label">Completadas</div>
            </div>
          </div>
          <div className="col-md-2">
            <div className="stat-card text-center">
              <div className="stat-number text-danger">{stats.rechazadas}</div>
              <div className="stat-label">Rechazadas</div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="card mb-4">
          <div className="card-body">
            <div className="row align-items-center">
              <div className="col-md-6">
                <label htmlFor="filtroEstado" className="form-label">Filtrar por estado:</label>
                <select
                  id="filtroEstado"
                  className="form-select"
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                >
                  <option value="todos">Todos los estados</option>
                  <option value="pendiente">Pendientes</option>
                  <option value="en_proceso">En Proceso</option>
                  <option value="completado">Completados</option>
                  <option value="rechazado">Rechazados</option>
                </select>
              </div>
              <div className="col-md-6 text-end">
                <span className="text-muted">
                  Mostrando {solicitudesFiltradas.length} de {solicitudes.length} solicitudes
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de solicitudes */}
        <div className="card">
          <div className="card-header">
            <h5 className="mb-0">Solicitudes de Vecinos</h5>
          </div>
          <div className="card-body">
            {solicitudesFiltradas.length === 0 ? (
              <div className="empty-state text-center py-5">
                <div className="empty-icon mb-3" style={{ fontSize: '3rem' }}>📋</div>
                <h5>No hay solicitudes</h5>
                <p className="text-muted">
                  {filtroEstado === 'todos' 
                    ? 'No se han encontrado solicitudes'
                    : `No hay solicitudes con estado "${getEstadoTexto(filtroEstado)}"`
                  }
                </p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Vecino</th>
                      <th>Tipo</th>
                      <th>Motivo</th>
                      <th>Fecha Solicitud</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {solicitudesFiltradas.map((solicitud) => (
                      <tr key={solicitud.id}>
                        <td>
                          <code>#{solicitud.id.substring(0, 8)}</code>
                        </td>
                        <td>
                          <div>
                            <div className="fw-medium">
                              Usuario: {solicitud.usuario_id.substring(0, 8)}...
                            </div>
                            <small className="text-muted">
                              (Info temporal - sin JOIN)
                            </small>
                          </div>
                        </td>
                        <td>
                          <strong>{getTipoTexto(solicitud.tipo)}</strong>
                        </td>
                        <td>
                          <div>
                            <div className="fw-medium">{solicitud.motivo}</div>
                            {solicitud.observaciones && (
                              <small className="text-muted">
                                {solicitud.observaciones.length > 30 
                                  ? `${solicitud.observaciones.substring(0, 30)}...`
                                  : solicitud.observaciones
                                }
                              </small>
                            )}
                          </div>
                        </td>
                        <td>
                          <small>{formatearFecha(solicitud.fecha_solicitud)}</small>
                        </td>
                        <td>
                          <span className={`badge ${getEstadoBadge(solicitud.estado)}`}>
                            {getEstadoTexto(solicitud.estado)}
                          </span>
                        </td>
                        <td>
                          <div className="btn-group btn-group-sm">
                            {solicitud.estado === 'pendiente' && (
                              <>
                                <button 
                                  className="btn btn-outline-info"
                                  onClick={() => cambiarEstadoSolicitud(solicitud.id, 'en_proceso')}
                                  disabled={procesandoId === solicitud.id}
                                >
                                  {procesandoId === solicitud.id ? '⏳' : '📝'} Procesar
                                </button>
                                <button 
                                  className="btn btn-outline-success"
                                  onClick={() => cambiarEstadoSolicitud(solicitud.id, 'completado')}
                                  disabled={procesandoId === solicitud.id}
                                >
                                  {procesandoId === solicitud.id ? '⏳' : '✅'} Aprobar
                                </button>
                                <button 
                                  className="btn btn-outline-danger"
                                  onClick={() => {
                                    if (confirm('¿Estás segura de rechazar esta solicitud?')) {
                                      cambiarEstadoSolicitud(solicitud.id, 'rechazado');
                                    }
                                  }}
                                  disabled={procesandoId === solicitud.id}
                                >
                                  {procesandoId === solicitud.id ? '⏳' : '❌'} Rechazar
                                </button>
                              </>
                            )}
                            {solicitud.estado === 'en_proceso' && (
                              <>
                                <button 
                                  className="btn btn-outline-success"
                                  onClick={() => cambiarEstadoSolicitud(solicitud.id, 'completado')}
                                  disabled={procesandoId === solicitud.id}
                                >
                                  {procesandoId === solicitud.id ? '⏳' : '✅'} Completar
                                </button>
                                <button 
                                  className="btn btn-outline-danger"
                                  onClick={() => {
                                    if (confirm('¿Estás segura de rechazar esta solicitud?')) {
                                      cambiarEstadoSolicitud(solicitud.id, 'rechazado');
                                    }
                                  }}
                                  disabled={procesandoId === solicitud.id}
                                >
                                  {procesandoId === solicitud.id ? '⏳' : '❌'} Rechazar
                                </button>
                              </>
                            )}
                            {(solicitud.estado === 'completado' || solicitud.estado === 'rechazado') && (
                              <button 
                                className="btn btn-outline-primary"
                                onClick={() => {
                                  // TODO: Implementar modal de detalles
                                  alert(`Ver detalles de solicitud ${solicitud.id}`);
                                }}
                              >
                                👁️ Ver Detalles
                              </button>
                            )}
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

        {/* Información adicional */}
        <div className="row mt-4">
          <div className="col-md-6">
            <div className="info-card">
              <h6>📋 Estados de Solicitudes</h6>
              <ul className="list-unstyled">
                <li><span className="badge bg-secondary me-2">Pendiente</span>Solicitud recién creada</li>
                <li><span className="badge bg-warning text-dark me-2">En Proceso</span>Siendo revisada</li>
                <li><span className="badge bg-success me-2">Completado</span>Certificado listo</li>
                <li><span className="badge bg-danger me-2">Rechazado</span>Solicitud rechazada</li>
              </ul>
            </div>
          </div>
          <div className="col-md-6">
            <div className="info-card">
              <h6>⚡ Acciones Rápidas</h6>
              <ul className="list-unstyled">
                <li>• <strong>Procesar:</strong> Cambiar a "En Proceso"</li>
                <li>• <strong>Aprobar:</strong> Marcar como "Completado"</li>
                <li>• <strong>Rechazar:</strong> Marcar como "Rechazado"</li>
                <li>• <strong>Ver Detalles:</strong> Información completa</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}