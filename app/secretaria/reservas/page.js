'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export default function GestionReservasPage() {
  const { user } = useAuth();
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todas');
  const [busqueda, setBusqueda] = useState('');
  const [mostrarFormRechazo, setMostrarFormRechazo] = useState(null);
  const [motivoRechazo, setMotivoRechazo] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchReservas();
  }, []);

  const fetchReservas = async () => {
    try {
      setLoading(true);
      setError('');
      const supabase = createClient();

      const { data, error } = await supabase
        .from('reservas')
        .select(`
          *,
          espacio:espacio_id (
            nombre,
            ubicacion
          ),
          solicitante:solicitante_id (
            nombres,
            apellidos,
            email,
            telefono
          ),
          aprobador:aprobador_id (
            nombres,
            apellidos
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReservas(data || []);
    } catch (error) {
      console.error('Error fetching reservas:', error);
      setError('Error al cargar las reservas');
    } finally {
      setLoading(false);
    }
  };

  const aprobarReserva = async (reservaId) => {
    if (!confirm('¿Estás seguro de aprobar esta reserva?')) {
      return;
    }

    try {
      setProcessing(true);
      const supabase = createClient();

      const { error } = await supabase
        .from('reservas')
        .update({
          estado: 'aprobada',
          aprobador_id: user.id,
          fecha_aprobacion: new Date().toISOString()
        })
        .eq('id', reservaId);

      if (error) throw error;

      alert('Reserva aprobada exitosamente');
      fetchReservas();
    } catch (error) {
      console.error('Error aprobando reserva:', error);
      alert('Error al aprobar la reserva: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const rechazarReserva = async (reservaId) => {
    if (!motivoRechazo.trim()) {
      alert('Por favor ingresa un motivo de rechazo');
      return;
    }

    if (!confirm('¿Estás seguro de rechazar esta reserva?')) {
      return;
    }

    try {
      setProcessing(true);
      const supabase = createClient();

      const { error } = await supabase
        .from('reservas')
        .update({
          estado: 'rechazada',
          motivo_rechazo: motivoRechazo.trim()
        })
        .eq('id', reservaId);

      if (error) throw error;

      alert('Reserva rechazada');
      setMostrarFormRechazo(null);
      setMotivoRechazo('');
      fetchReservas();
    } catch (error) {
      console.error('Error rechazando reserva:', error);
      alert('Error al rechazar la reserva: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const completarReserva = async (reservaId) => {
    if (!confirm('¿Marcar esta reserva como completada?')) {
      return;
    }

    try {
      setProcessing(true);
      const supabase = createClient();

      const { error } = await supabase
        .from('reservas')
        .update({ estado: 'completada' })
        .eq('id', reservaId);

      if (error) throw error;

      alert('Reserva marcada como completada');
      fetchReservas();
    } catch (error) {
      console.error('Error completando reserva:', error);
      alert('Error al completar la reserva: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-CL', {
      weekday: 'long',
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

  const getBloqueTexto = (bloque) => {
    const textos = {
      manana: '🌅 Mañana (9:00-13:00)',
      tarde: '☀️ Tarde (14:00-18:00)',
      noche: '🌙 Noche (19:00-23:00)',
      dia_completo: '📅 Día Completo (9:00-23:00)'
    };
    return textos[bloque] || bloque;
  };

  const getEstadoBadge = (estado) => {
    const badges = {
      pendiente: 'bg-warning text-dark',
      aprobada: 'bg-success',
      rechazada: 'bg-danger',
      cancelada: 'bg-secondary',
      completada: 'bg-info'
    };
    return badges[estado] || 'bg-secondary';
  };

  const getEstadoTexto = (estado) => {
    const textos = {
      pendiente: '⏳ Pendiente',
      aprobada: '✅ Aprobada',
      rechazada: '❌ Rechazada',
      cancelada: '🚫 Cancelada',
      completada: '🎉 Completada'
    };
    return textos[estado] || estado;
  };

  const reservasFiltradas = reservas.filter(reserva => {
    if (filtroEstado !== 'todas' && reserva.estado !== filtroEstado) return false;
    if (busqueda.trim() !== '') {
      const searchLower = busqueda.toLowerCase();
      return (
        reserva.espacio?.nombre.toLowerCase().includes(searchLower) ||
        reserva.motivo.toLowerCase().includes(searchLower) ||
        (reserva.solicitante && `${reserva.solicitante.nombres} ${reserva.solicitante.apellidos}`.toLowerCase().includes(searchLower))
      );
    }
    return true;
  });

  // Estadísticas
  const totalReservas = reservas.length;
  const pendientes = reservas.filter(r => r.estado === 'pendiente').length;
  const aprobadas = reservas.filter(r => r.estado === 'aprobada').length;
  const rechazadas = reservas.filter(r => r.estado === 'rechazada').length;
  const canceladas = reservas.filter(r => r.estado === 'cancelada').length;
  const completadas = reservas.filter(r => r.estado === 'completada').length;

  if (loading) {
    return (
      <div className="page-container">
        <div className="text-center py-5">
          <div className="spinner-border mb-3" role="status"></div>
          <p>Cargando reservas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>🏟️ Gestión de Reservas</h1>
          <p className="text-muted">Administra las solicitudes de reserva de espacios comunes</p>
        </div>
        <div className="d-flex gap-2">
          <Link href="/secretaria/reservas/pendientes" className="btn btn-warning">
            ⏳ Pendientes ({pendientes})
          </Link>
          <Link href="/secretaria/espacios" className="btn btn-secondary">
            ⚙️ Administrar Espacios
          </Link>
        </div>
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
              <div className="fs-3 fw-bold text-primary">{totalReservas}</div>
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
              <div className="fs-3 fw-bold text-success">{aprobadas}</div>
              <small className="text-muted">Aprobadas</small>
            </div>
          </div>
        </div>
        <div className="col-md-2">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center py-3">
              <div className="fs-3 fw-bold text-info">{completadas}</div>
              <small className="text-muted">Completadas</small>
            </div>
          </div>
        </div>
        <div className="col-md-2">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center py-3">
              <div className="fs-3 fw-bold text-danger">{rechazadas}</div>
              <small className="text-muted">Rechazadas</small>
            </div>
          </div>
        </div>
        <div className="col-md-2">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center py-3">
              <div className="fs-3 fw-bold text-secondary">{canceladas}</div>
              <small className="text-muted">Canceladas</small>
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
                Buscar reserva:
              </label>
              <input
                type="text"
                id="busqueda"
                className="form-control"
                placeholder="Buscar por espacio, solicitante o motivo..."
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
                <option value="todas">Todos los estados</option>
                <option value="pendiente">Pendientes</option>
                <option value="aprobada">Aprobadas</option>
                <option value="completada">Completadas</option>
                <option value="rechazada">Rechazadas</option>
                <option value="cancelada">Canceladas</option>
              </select>
            </div>
            <div className="col-md-3 d-flex align-items-end">
              <div className="badge bg-light text-dark fs-6 p-3 w-100 text-center">
                {reservasFiltradas.length} reserva{reservasFiltradas.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Reservas */}
      {reservasFiltradas.length === 0 ? (
        <div className="card shadow-sm border-0">
          <div className="card-body text-center py-5">
            <div className="empty-icon mb-3" style={{ fontSize: '3rem' }}>🏟️</div>
            <h5>No se encontraron reservas</h5>
            <p className="text-muted">
              {busqueda ? 'Intenta con otros términos de búsqueda' : 'No hay reservas registradas'}
            </p>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          {reservasFiltradas.map((reserva) => (
            <div key={reserva.id} className="col-12">
              <div className="card shadow-sm border-0">
                <div className="card-body p-4">
                  <div className="row">
                    {/* Información Principal */}
                    <div className="col-lg-7">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div>
                          <h4 className="fw-bold mb-2">
                            🏟️ {reserva.espacio?.nombre || 'Espacio no disponible'}
                          </h4>
                          <span className={`badge ${getEstadoBadge(reserva.estado)} px-3 py-2`}>
                            {getEstadoTexto(reserva.estado)}
                          </span>
                        </div>
                      </div>

                      <div className="mb-3">
                        <h6 className="fw-semibold mb-2">📅 Fecha y Horario:</h6>
                        <p className="mb-1"><strong>{formatearFecha(reserva.fecha_reserva)}</strong></p>
                        <p className="mb-0 text-muted">{getBloqueTexto(reserva.bloque_horario)}</p>
                      </div>

                      <div className="mb-3">
                        <h6 className="fw-semibold mb-2">📝 Motivo:</h6>
                        <p style={{ whiteSpace: 'pre-line', lineHeight: '1.7' }}>{reserva.motivo}</p>
                      </div>

                      {reserva.num_asistentes && (
                        <div className="mb-3">
                          <h6 className="fw-semibold mb-2">👥 Asistentes:</h6>
                          <p>{reserva.num_asistentes} personas</p>
                        </div>
                      )}

                      {reserva.estado === 'rechazada' && reserva.motivo_rechazo && (
                        <div className="alert alert-danger">
                          <h6 className="fw-semibold mb-2">❌ Motivo de Rechazo:</h6>
                          <p className="mb-0">{reserva.motivo_rechazo}</p>
                        </div>
                      )}
                    </div>

                    {/* Información del Solicitante y Acciones */}
                    <div className="col-lg-5">
                      <div className="card bg-light border-0 mb-3">
                        <div className="card-body p-3">
                          <h6 className="fw-semibold mb-3">👤 Solicitante</h6>
                          {reserva.solicitante ? (
                            <>
                              <p className="mb-1">
                                <strong>{reserva.solicitante.nombres} {reserva.solicitante.apellidos}</strong>
                              </p>
                              <p className="mb-1 text-muted small">📧 {reserva.solicitante.email}</p>
                              {reserva.solicitante.telefono && (
                                <p className="mb-2 text-muted small">📞 {reserva.solicitante.telefono}</p>
                              )}
                              <p className="mb-0 text-muted small">
                                📅 Solicitado el {formatearFechaHora(reserva.created_at)}
                              </p>
                            </>
                          ) : (
                            <p className="text-muted mb-0">Información no disponible</p>
                          )}
                        </div>
                      </div>

                      {/* Acciones de Gestión */}
                      {reserva.estado === 'pendiente' && (
                        <div className="card border-warning bg-light mb-3">
                          <div className="card-body p-3">
                            <h6 className="fw-semibold mb-3">⚙️ Acciones</h6>
                            <div className="d-flex flex-column gap-2">
                              <button
                                className="btn btn-success w-100"
                                onClick={() => aprobarReserva(reserva.id)}
                                disabled={processing}
                              >
                                {processing ? 'Procesando...' : '✅ Aprobar Reserva'}
                              </button>
                              <button
                                className="btn btn-danger w-100"
                                onClick={() => setMostrarFormRechazo(reserva.id)}
                                disabled={processing}
                              >
                                ❌ Rechazar Reserva
                              </button>
                            </div>

                            {mostrarFormRechazo === reserva.id && (
                              <div className="mt-3">
                                <label className="form-label fw-semibold">Motivo de Rechazo:</label>
                                <textarea
                                  className="form-control mb-2"
                                  rows={3}
                                  placeholder="Explica por qué se rechaza esta reserva..."
                                  value={motivoRechazo}
                                  onChange={(e) => setMotivoRechazo(e.target.value)}
                                />
                                <div className="d-flex gap-2">
                                  <button
                                    className="btn btn-danger btn-sm"
                                    onClick={() => rechazarReserva(reserva.id)}
                                    disabled={processing || !motivoRechazo.trim()}
                                  >
                                    Confirmar Rechazo
                                  </button>
                                  <button
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => {
                                      setMostrarFormRechazo(null);
                                      setMotivoRechazo('');
                                    }}
                                    disabled={processing}
                                  >
                                    Cancelar
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {reserva.estado === 'aprobada' && (
                        <div className="card border-success bg-light">
                          <div className="card-body p-3">
                            <h6 className="fw-semibold mb-3">✅ Reserva Aprobada</h6>
                            <p className="small mb-2">
                              Aprobada el {formatearFechaHora(reserva.fecha_aprobacion)}
                              {reserva.aprobador && ` por ${reserva.aprobador.nombres} ${reserva.aprobador.apellidos}`}
                            </p>
                            <button
                              className="btn btn-info w-100"
                              onClick={() => completarReserva(reserva.id)}
                              disabled={processing}
                            >
                              {processing ? 'Procesando...' : '🎉 Marcar como Completada'}
                            </button>
                          </div>
                        </div>
                      )}

                      {reserva.estado === 'completada' && (
                        <div className="alert alert-info mb-0">
                          <strong>🎉 Reserva Completada</strong>
                          <p className="mb-0 mt-2 small">Esta reserva se ha realizado exitosamente.</p>
                        </div>
                      )}
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
