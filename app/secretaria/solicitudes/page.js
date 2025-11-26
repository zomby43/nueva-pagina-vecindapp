'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import { descargarCertificado } from '@/lib/pdf/generarCertificado';
import { enviarCorreoAprobacionSolicitud, enviarCorreoRechazoSolicitud } from '@/lib/emails/sendEmail';
import { useRouter, useSearchParams } from 'next/navigation';

export default function SecretariaSolicitudesPage() {
  const { user, userProfile } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [procesandoId, setProcesandoId] = useState(null);
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [focusedId, setFocusedId] = useState(null); // <-- para resaltar fila

  useEffect(() => {
    if (user && userProfile?.rol === 'secretaria') {
      fetchSolicitudes();
    }
  }, [user, userProfile]);

  // Aplica ?ver= (modal) y ?focus= (scroll + highlight) cuando ya hay datos
  useEffect(() => {
    if (loading) return;

    const verId = searchParams?.get('ver');
    const focusId = searchParams?.get('focus');

    if (verId) {
      const s = solicitudes.find((x) => x.id === verId);
      if (s) {
        setSolicitudSeleccionada(s);
        setMostrarModal(true);
      }
      return; // si hay ?ver, no aplicamos focus
    }

    if (focusId) {
      const s = solicitudes.find((x) => x.id === focusId);
      if (s) {
        // Asegura que sea visible aunque haya filtro activo
        setFiltroEstado('todos');
        setFocusedId(focusId);
        // Scroll suave al centro
        requestAnimationFrame(() => {
          const el = document.getElementById(`solicitud-${focusId}`);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
        // Quitamos highlight después de unos segundos
        const t = setTimeout(() => setFocusedId(null), 4000);
        return () => clearTimeout(t);
      }
    }
  }, [loading, solicitudes, searchParams]); // se recalcula si cambian datos o url

  const clearQuery = () => {
    // Limpia ?ver o ?focus del URL sin recargar
    router.replace(window.location.pathname, { scroll: false });
  };

  const fetchSolicitudes = async () => {
    try {
      setLoading(true);
      setError('');
      const supabase = createClient();

      console.log('🔍 Intentando cargar solicitudes...');
      console.log('👤 Usuario actual:', user?.id);
      console.log('👔 Perfil de usuario:', userProfile);

      // Timeout de 10 segundos para evitar carga infinita
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        setError('Timeout: La carga está tomando demasiado tiempo. Posible problema de RLS.');
        setLoading(false);
      }, 10000);

      // Consulta con JOIN para obtener datos del vecino
      const { data, error } = await supabase
        .from('solicitudes')
        .select(`
          *,
          usuario:usuarios!usuario_id (
            id,
            nombres,
            apellidos,
            rut,
            email,
            telefono,
            direccion
          )
        `)
        .order('fecha_solicitud', { ascending: false })
        .abortSignal(controller.signal);

      clearTimeout(timeoutId);

      if (error) {
        console.error('❌ Error de Supabase:', error);
        throw error;
      }

      console.log('✅ Solicitudes cargadas:', data?.length || 0);
      setSolicitudes(data || []);
    } catch (error) {
      if (error.name === 'AbortError') {
        console.error('❌ Timeout al cargar solicitudes');
        return;
      }
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

      // Obtener datos completos de la solicitud antes de actualizar
      const solicitudActual = solicitudes.find(s => s.id === solicitudId);

      if (!solicitudActual) {
        alert('No se encontró la solicitud');
        return;
      }

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

      if (error) throw error;

      // Enviar correo según el estado (no bloquea el flujo)
      try {
        const nombreCompleto = `${solicitudActual.usuario?.nombres || ''} ${solicitudActual.usuario?.apellidos || ''}`.trim();
        const email = solicitudActual.usuario?.email;

        if (email && nombreCompleto) {
          if (nuevoEstado === 'completado') {
            await enviarCorreoAprobacionSolicitud(email, nombreCompleto, solicitudActual.tipo);
            console.log('✅ Correo de aprobación de solicitud enviado a:', email);
          } else if (nuevoEstado === 'rechazado') {
            await enviarCorreoRechazoSolicitud(email, nombreCompleto, solicitudActual.tipo, motivo || 'No especificado');
            console.log('✅ Correo de rechazo de solicitud enviado a:', email);
          }
        }
      } catch (emailError) {
        console.error('⚠️ Error al enviar correo (la solicitud fue actualizada):', emailError);
      }

      // Actualizar la lista local
      setSolicitudes(prev =>
        prev.map(sol =>
          sol.id === solicitudId
            ? {
                ...sol,
                estado: nuevoEstado,
                atendido_por: user.id,
                fecha_respuesta:
                  nuevoEstado === 'completado' || nuevoEstado === 'rechazado'
                    ? new Date().toISOString()
                    : null
              }
            : sol
        )
      );

      alert(
        `Solicitud ${
          nuevoEstado === 'completado' ? 'aprobada' : nuevoEstado === 'rechazado' ? 'rechazada' : 'actualizada'
        } exitosamente. ${
          nuevoEstado === 'completado' || nuevoEstado === 'rechazado' ? 'Se ha enviado un correo de notificación.' : ''
        }`
      );

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
      default:
        return 'bg-secondary';
    }
  };

  const getEstadoTexto = (estado) => {
    switch (estado) {
      case 'completado': return 'Completado';
      case 'en_proceso': return 'En Proceso';
      case 'rechazado':  return 'Rechazado';
      case 'pendiente':
      default:           return 'Pendiente';
    }
  };

  const getTipoTexto = (tipo) => {
    switch (tipo) {
      case 'certificado_residencia': return 'Certificado de Residencia';
      case 'certificado_antiguedad': return 'Certificado de Antigüedad';
      case 'otro':                   return 'Otro';
      default:                       return tipo;
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
            <h1><i className="bi bi-clipboard-check me-2"></i>Gestión de Solicitudes</h1>
            <p className="text-muted">Administrar solicitudes de certificados de vecinos</p>
          </div>
          <button
            className="btn btn-primary"
            onClick={fetchSolicitudes}
            disabled={loading}
          >
            <i className="bi bi-arrow-clockwise me-2"></i>Actualizar
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
                <div className="fs-3 fw-bold text-warning">{stats.pendientes}</div>
                <small className="text-muted">Pendientes</small>
              </div>
            </div>
          </div>
          <div className="col-md-2">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center py-3">
                <div className="fs-3 fw-bold text-info">{stats.enProceso}</div>
                <small className="text-muted">En Proceso</small>
              </div>
            </div>
          </div>
          <div className="col-md-2">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center py-3">
                <div className="fs-3 fw-bold text-success">{stats.completadas}</div>
                <small className="text-muted">Completadas</small>
              </div>
            </div>
          </div>
          <div className="col-md-2">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center py-3">
                <div className="fs-3 fw-bold text-danger">{stats.rechazadas}</div>
                <small className="text-muted">Rechazadas</small>
              </div>
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
                <div className="empty-icon mb-3" style={{ fontSize: '3rem' }}>
                  <i className="bi bi-clipboard-x text-muted"></i>
                </div>
                <h5>No hay solicitudes</h5>
                <p className="text-muted">
                  {filtroEstado === 'todos'
                    ? 'No se han encontrado solicitudes'
                    : `No hay solicitudes con estado "${getEstadoTexto(filtroEstado)}"`}
                </p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th className="fw-bold">ID</th>
                      <th className="fw-bold">Vecino</th>
                      <th className="fw-bold">Tipo</th>
                      <th className="fw-bold">Motivo</th>
                      <th className="fw-bold">Fecha Solicitud</th>
                      <th className="fw-bold">Estado</th>
                      <th className="fw-bold">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {solicitudesFiltradas.map((solicitud) => (
                      <tr
                        key={solicitud.id}
                        id={`solicitud-${solicitud.id}`} // <-- ancla para scroll
                        style={
                          focusedId === solicitud.id
                            ? {
                                outline: '2px solid #439fa4',
                                background: 'rgba(67,159,164,0.08)',
                                transition: 'all .3s'
                              }
                            : undefined
                        }
                      >
                        <td>
                          <code className="bg-light px-2 py-1 rounded text-dark fw-bold">
                            #{solicitud.id.substring(0, 8)}
                          </code>
                        </td>
                        <td>
                          <div>
                            <div className="fw-bold text-dark">
                              {solicitud.usuario ? `${solicitud.usuario.nombres} ${solicitud.usuario.apellidos}` : 'Sin nombre'}
                            </div>
                            <small className="text-secondary">
                              {solicitud.usuario?.rut || 'Sin RUT'}
                            </small>
                          </div>
                        </td>
                        <td>
                          <span className="fw-bold text-dark">{getTipoTexto(solicitud.tipo)}</span>
                        </td>
                        <td>
                          <div>
                            <div className="fw-medium text-dark">{solicitud.motivo}</div>
                            {solicitud.observaciones && (
                              <small className="text-secondary">
                                {solicitud.observaciones.length > 30
                                  ? `${solicitud.observaciones.substring(0, 30)}...`
                                  : solicitud.observaciones}
                              </small>
                            )}
                          </div>
                        </td>
                        <td>
                          <span className="text-dark" style={{ fontSize: '0.9rem' }}>
                            {formatearFecha(solicitud.fecha_solicitud)}
                          </span>
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
                                  className="btn btn-info text-white"
                                  onClick={() => cambiarEstadoSolicitud(solicitud.id, 'en_proceso')}
                                  disabled={procesandoId === solicitud.id}
                                  title="Marcar como en proceso"
                                >
                                  {procesandoId === solicitud.id ? (
                                    <span className="spinner-border spinner-border-sm me-1"></span>
                                  ) : (
                                    <i className="bi bi-pencil-square me-1"></i>
                                  )}
                                  Procesar
                                </button>
                                <button
                                  className="btn btn-success text-white"
                                  onClick={() => cambiarEstadoSolicitud(solicitud.id, 'completado')}
                                  disabled={procesandoId === solicitud.id}
                                  title="Aprobar solicitud"
                                >
                                  {procesandoId === solicitud.id ? (
                                    <span className="spinner-border spinner-border-sm me-1"></span>
                                  ) : (
                                    <i className="bi bi-check-circle me-1"></i>
                                  )}
                                  Aprobar
                                </button>
                                <button
                                  className="btn btn-danger text-white"
                                  onClick={() => {
                                    if (confirm('¿Estás segura de rechazar esta solicitud?')) {
                                      cambiarEstadoSolicitud(solicitud.id, 'rechazado');
                                    }
                                  }}
                                  disabled={procesandoId === solicitud.id}
                                  title="Rechazar solicitud"
                                >
                                  {procesandoId === solicitud.id ? (
                                    <span className="spinner-border spinner-border-sm me-1"></span>
                                  ) : (
                                    <i className="bi bi-x-circle me-1"></i>
                                  )}
                                  Rechazar
                                </button>
                              </>
                            )}
                            {solicitud.estado === 'en_proceso' && (
                              <>
                                <button
                                  className="btn btn-success text-white"
                                  onClick={() => cambiarEstadoSolicitud(solicitud.id, 'completado')}
                                  disabled={procesandoId === solicitud.id}
                                  title="Completar solicitud"
                                >
                                  {procesandoId === solicitud.id ? (
                                    <span className="spinner-border spinner-border-sm me-1"></span>
                                  ) : (
                                    <i className="bi bi-check-circle me-1"></i>
                                  )}
                                  Completar
                                </button>
                                <button
                                  className="btn btn-danger text-white"
                                  onClick={() => {
                                    if (confirm('¿Estás segura de rechazar esta solicitud?')) {
                                      cambiarEstadoSolicitud(solicitud.id, 'rechazado');
                                    }
                                  }}
                                  disabled={procesandoId === solicitud.id}
                                  title="Rechazar solicitud"
                                >
                                  {procesandoId === solicitud.id ? (
                                    <span className="spinner-border spinner-border-sm me-1"></span>
                                  ) : (
                                    <i className="bi bi-x-circle me-1"></i>
                                  )}
                                  Rechazar
                                </button>
                              </>
                            )}
                            {(solicitud.estado === 'completado' || solicitud.estado === 'rechazado') && (
                              <button
                                className="btn btn-primary text-white"
                                onClick={() => {
                                  setSolicitudSeleccionada(solicitud);
                                  setMostrarModal(true);
                                }}
                                title="Ver detalles completos"
                              >
                                <i className="bi bi-eye me-1"></i>Ver Detalles
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
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h6 className="card-title mb-3">
                  <i className="bi bi-info-circle me-2 text-primary"></i>Estados de Solicitudes
                </h6>
                <ul className="list-unstyled mb-0">
                  <li className="mb-2"><span className="badge bg-secondary me-2">Pendiente</span>Solicitud recién creada</li>
                  <li className="mb-2"><span className="badge bg-warning text-dark me-2">En Proceso</span>Siendo revisada</li>
                  <li className="mb-2"><span className="badge bg-success me-2">Completado</span>Certificado listo</li>
                  <li className="mb-0"><span className="badge bg-danger me-2">Rechazado</span>Solicitud rechazada</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h6 className="card-title mb-3">
                  <i className="bi bi-lightning-charge me-2 text-primary"></i>Acciones Rápidas
                </h6>
                <ul className="list-unstyled mb-0">
                  <li className="mb-2"><i className="bi bi-pencil-square text-info me-2"></i><strong>Procesar:</strong> Cambiar a "En Proceso"</li>
                  <li className="mb-2"><i className="bi bi-check-circle text-success me-2"></i><strong>Aprobar:</strong> Marcar como "Completado"</li>
                  <li className="mb-2"><i className="bi bi-x-circle text-danger me-2"></i><strong>Rechazar:</strong> Marcar como "Rechazado"</li>
                  <li className="mb-0"><i className="bi bi-eye text-primary me-2"></i><strong>Ver Detalles:</strong> Información completa</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Detalles */}
      {mostrarModal && solicitudSeleccionada && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => { setMostrarModal(false); clearQuery(); }}>
          <div className="modal-dialog modal-lg modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  Detalles de Solicitud #{solicitudSeleccionada.id.substring(0, 8)}
                </h5>
                <button type="button" className="btn-close" onClick={() => { setMostrarModal(false); clearQuery(); }}></button>
              </div>
              <div className="modal-body">
                {/* Estado */}
                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="mb-0">Estado de la Solicitud</h6>
                    <span className={`badge ${getEstadoBadge(solicitudSeleccionada.estado)} fs-6`}>
                      {getEstadoTexto(solicitudSeleccionada.estado)}
                    </span>
                  </div>
                  <hr />
                </div>

                {/* Información del Vecino */}
                <div className="mb-4">
                  <h6 className="mb-3">
                    <i className="bi bi-person-fill me-2 text-primary"></i>Información del Vecino
                  </h6>
                  <div className="row">
                    <div className="col-md-6">
                      <p className="mb-2">
                        <strong>Nombre:</strong><br />
                        <span className="text-muted">
                          {solicitudSeleccionada.usuario
                            ? `${solicitudSeleccionada.usuario.nombres} ${solicitudSeleccionada.usuario.apellidos}`
                            : 'No disponible'}
                        </span>
                      </p>
                      <p className="mb-2">
                        <strong>RUT:</strong><br />
                        <span className="text-muted">{solicitudSeleccionada.usuario?.rut || 'No disponible'}</span>
                      </p>
                      <p className="mb-2">
                        <strong>Email:</strong><br />
                        <span className="text-muted">{solicitudSeleccionada.usuario?.email || 'No disponible'}</span>
                      </p>
                    </div>
                    <div className="col-md-6">
                      <p className="mb-2">
                        <strong>Teléfono:</strong><br />
                        <span className="text-muted">{solicitudSeleccionada.usuario?.telefono || 'No disponible'}</span>
                      </p>
                      <p className="mb-2">
                        <strong>Dirección:</strong><br />
                        <span className="text-muted">{solicitudSeleccionada.usuario?.direccion || 'No disponible'}</span>
                      </p>
                    </div>
                  </div>
                  <hr />
                </div>

                {/* Detalles de la Solicitud */}
                <div className="mb-4">
                  <h6 className="mb-3">
                    <i className="bi bi-clipboard-check me-2 text-primary"></i>Detalles de la Solicitud
                  </h6>
                  <p className="mb-2">
                    <strong>Tipo de Certificado:</strong><br />
                    <span className="text-muted">{getTipoTexto(solicitudSeleccionada.tipo)}</span>
                  </p>
                  <p className="mb-2">
                    <strong>Motivo:</strong><br />
                    <span className="text-muted">{solicitudSeleccionada.motivo}</span>
                  </p>
                  {solicitudSeleccionada.observaciones && (
                    <p className="mb-2">
                      <strong>Observaciones:</strong><br />
                      <span className="text-muted">{solicitudSeleccionada.observaciones}</span>
                    </p>
                  )}
                  <hr />
                </div>

                {/* Fechas */}
                <div className="mb-4">
                  <h6 className="mb-3">
                    <i className="bi bi-calendar3 me-2 text-primary"></i>Fechas
                  </h6>
                  <div className="row">
                    <div className="col-md-6">
                      <p className="mb-2">
                        <strong>Fecha de Solicitud:</strong><br />
                        <span className="text-muted">{formatearFecha(solicitudSeleccionada.fecha_solicitud)}</span>
                      </p>
                    </div>
                    <div className="col-md-6">
                      {solicitudSeleccionada.fecha_respuesta && (
                        <p className="mb-2">
                          <strong>Fecha de Respuesta:</strong><br />
                          <span className="text-muted">{formatearFecha(solicitudSeleccionada.fecha_respuesta)}</span>
                        </p>
                      )}
                    </div>
                  </div>
                  <hr />
                </div>

                {/* Información adicional */}
                <div className="mb-3">
                  <h6 className="mb-3">
                    <i className="bi bi-info-circle me-2 text-primary"></i>Información Adicional
                  </h6>
                  <p className="mb-2">
                    <strong>ID de Solicitud:</strong><br />
                    <code>{solicitudSeleccionada.id}</code>
                  </p>
                  {solicitudSeleccionada.atendido_por && (
                    <p className="mb-2">
                      <strong>Atendido por:</strong><br />
                      <span className="text-muted">ID: {solicitudSeleccionada.atendido_por.substring(0, 8)}...</span>
                    </p>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                {solicitudSeleccionada.estado === 'completado' && (
                  <button
                    className="btn btn-success"
                    onClick={() => {
                      try {
                        descargarCertificado(solicitudSeleccionada, solicitudSeleccionada.usuario);
                      } catch (error) {
                        console.error('Error al generar certificado:', error);
                        alert('Error al generar el certificado PDF');
                      }
                    }}
                  >
                    <i className="bi bi-file-earmark-pdf me-2"></i>Descargar Certificado
                  </button>
                )}
                <button type="button" className="btn btn-secondary" onClick={() => { setMostrarModal(false); clearQuery(); }}>
                  <i className="bi bi-x-lg me-2"></i>Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
