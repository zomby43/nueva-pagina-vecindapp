'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { formatearFechaLocal, formatearFechaHoraLocal } from '@/lib/dateUtils';

export default function ReservasPendientesPage() {
  const { user } = useAuth();
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mostrarFormRechazo, setMostrarFormRechazo] = useState(null);
  const [motivoRechazo, setMotivoRechazo] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchReservasPendientes();
  }, []);

  const fetchReservasPendientes = async () => {
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
          )
        `)
        .eq('estado', 'pendiente')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setReservas(data || []);
    } catch (error) {
      console.error('Error fetching reservas:', error);
      setError('Error al cargar las reservas pendientes');
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
      fetchReservasPendientes();
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
      fetchReservasPendientes();
    } catch (error) {
      console.error('Error rechazando reserva:', error);
      alert('Error al rechazar la reserva: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  // Las funciones de formateo de fecha ahora se importan desde dateUtils
  // para evitar problemas de timezone

  const getBloqueTexto = (bloque) => {
    const textos = {
      manana: '🌅 Mañana (9:00-13:00)',
      tarde: '☀️ Tarde (14:00-18:00)',
      noche: '🌙 Noche (19:00-23:00)',
      dia_completo: '📅 Día Completo (9:00-23:00)'
    };
    return textos[bloque] || bloque;
  };

  const calcularDiasEspera = (fechaCreacion) => {
    const hoy = new Date();
    const creacion = new Date(fechaCreacion);
    const diferencia = Math.floor((hoy - creacion) / (1000 * 60 * 60 * 24));
    return diferencia;
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="text-center py-5">
          <div className="spinner-border mb-3" role="status"></div>
          <p>Cargando reservas pendientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1><i className="bi bi-clock-history me-2"></i>Reservas Pendientes de Aprobación</h1>
          <p className="text-muted">Revisa y gestiona las solicitudes de reserva pendientes</p>
        </div>
        <Link href="/secretaria/reservas" className="btn btn-secondary">
          ← Volver a Todas las Reservas
        </Link>
      </div>

      {error && (
        <div className="alert alert-danger mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Estadística */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body p-4 text-center">
          <div className="fs-1 fw-bold text-warning mb-2">{reservas.length}</div>
          <p className="mb-0 text-muted">
            {reservas.length === 1 ? 'Reserva pendiente de aprobación' : 'Reservas pendientes de aprobación'}
          </p>
        </div>
      </div>

      {reservas.length === 0 ? (
        <div className="card shadow-sm border-0">
          <div className="card-body text-center py-5">
            <div className="empty-icon mb-3" style={{ fontSize: '3rem' }}>✅</div>
            <h5>No hay reservas pendientes</h5>
            <p className="text-muted">Todas las solicitudes han sido revisadas</p>
            <Link href="/secretaria/reservas" className="btn btn-primary">
              Ver Todas las Reservas
            </Link>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          {reservas.map((reserva) => {
            const diasEspera = calcularDiasEspera(reserva.created_at);
            const esUrgente = diasEspera >= 3;

            return (
              <div key={reserva.id} className="col-12">
                <div
                  className={`card shadow-sm border-0 ${esUrgente ? 'border-warning' : ''}`}
                  style={esUrgente ? { borderLeft: '4px solid #ffc107' } : {}}
                >
                  <div className="card-body p-4">
                    <div className="row">
                      {/* Información Principal */}
                      <div className="col-lg-7">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <div>
                            <h4 className="fw-bold mb-2">
                              🏟️ {reserva.espacio?.nombre || 'Espacio no disponible'}
                            </h4>
                            <span className="badge bg-warning text-dark px-3 py-2">
                              ⏳ Pendiente de Aprobación
                            </span>
                            {esUrgente && (
                              <span className="badge bg-danger ms-2 px-3 py-2">
                                🚨 {diasEspera} días esperando
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="mb-3">
                          <h6 className="fw-semibold mb-2">📅 Fecha y Horario:</h6>
                          <p className="mb-1">
                            <strong>{formatearFechaLocal(reserva.fecha_reserva)}</strong>
                          </p>
                          <p className="mb-0 text-muted">{getBloqueTexto(reserva.bloque_horario)}</p>
                        </div>

                        <div className="mb-3">
                          <h6 className="fw-semibold mb-2">📝 Motivo:</h6>
                          <p style={{ whiteSpace: 'pre-line', lineHeight: '1.7' }}>
                            {reserva.motivo}
                          </p>
                        </div>

                        {reserva.num_asistentes && (
                          <div className="mb-3">
                            <h6 className="fw-semibold mb-2">👥 Asistentes:</h6>
                            <p>{reserva.num_asistentes} personas</p>
                          </div>
                        )}

                        {reserva.espacio?.ubicacion && (
                          <div className="mb-3">
                            <h6 className="fw-semibold mb-2">📍 Ubicación:</h6>
                            <p>{reserva.espacio.ubicacion}</p>
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
                                <p className="mb-1 text-muted small">
                                  📧 {reserva.solicitante.email}
                                </p>
                                {reserva.solicitante.telefono && (
                                  <p className="mb-2 text-muted small">
                                    📞 {reserva.solicitante.telefono}
                                  </p>
                                )}
                                <p className="mb-0 text-muted small">
                                  📅 Solicitado el {formatearFechaHoraLocal(reserva.created_at)}
                                </p>
                              </>
                            ) : (
                              <p className="text-muted mb-0">Información no disponible</p>
                            )}
                          </div>
                        </div>

                        {/* Acciones */}
                        <div className="card border-warning bg-light">
                          <div className="card-body p-3">
                            <h6 className="fw-semibold mb-3">⚙️ Acciones de Aprobación</h6>
                            <div className="d-flex flex-column gap-2 mb-3">
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
                              <div>
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
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
