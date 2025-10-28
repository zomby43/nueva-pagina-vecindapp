'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { generarComprobanteReserva } from '@/lib/generarComprobanteReserva';

export default function MisReservasPage() {
  const { user } = useAuth();
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todas');

  useEffect(() => {
    if (user) {
      fetchMisReservas();
    }
  }, [user]);

  const fetchMisReservas = async () => {
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
          aprobador:aprobador_id (
            nombres,
            apellidos
          )
        `)
        .eq('solicitante_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReservas(data || []);
    } catch (error) {
      console.error('Error fetching reservas:', error);
      setError('Error al cargar tus reservas');
    } finally {
      setLoading(false);
    }
  };

  const cancelarReserva = async (reservaId) => {
    if (!confirm('¿Estás seguro de cancelar esta reserva?')) {
      return;
    }

    try {
      const supabase = createClient();

      const { error } = await supabase
        .from('reservas')
        .update({ estado: 'cancelada' })
        .eq('id', reservaId)
        .eq('solicitante_id', user.id)
        .eq('estado', 'pendiente');

      if (error) throw error;

      alert('Reserva cancelada exitosamente');
      fetchMisReservas();
    } catch (error) {
      console.error('Error cancelando reserva:', error);
      alert('Error al cancelar la reserva: ' + error.message);
    }
  };

  const descargarComprobante = async (reservaId) => {
    try {
      const supabase = createClient();

      // Obtener datos completos de la reserva
      const { data: reservaData, error: errorReserva } = await supabase
        .from('reservas')
        .select(`
          *,
          espacio:espacio_id (*),
          solicitante:solicitante_id (*)
        `)
        .eq('id', reservaId)
        .single();

      if (errorReserva) throw errorReserva;

      // Obtener configuración de la organización
      const { data: config, error: errorConfig } = await supabase
        .from('configuracion')
        .select('*')
        .single();

      if (errorConfig) {
        console.warn('No se encontró configuración, usando valores por defecto');
      }

      // Generar PDF
      await generarComprobanteReserva(
        reservaData,
        reservaData.espacio,
        reservaData.solicitante,
        config || {}
      );
    } catch (error) {
      console.error('Error generando comprobante:', error);
      alert('Error al generar el comprobante: ' + error.message);
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
    if (filtroEstado === 'todas') return true;
    return reserva.estado === filtroEstado;
  });

  // Estadísticas
  const totalReservas = reservas.length;
  const pendientes = reservas.filter(r => r.estado === 'pendiente').length;
  const aprobadas = reservas.filter(r => r.estado === 'aprobada').length;
  const rechazadas = reservas.filter(r => r.estado === 'rechazada').length;
  const canceladas = reservas.filter(r => r.estado === 'cancelada').length;

  if (loading) {
    return (
      <div style={{ width: '100%', maxWidth: '100%', padding: '2rem', background: '#f4f8f9', borderRadius: '16px' }}>
        <div className="text-center py-5">
          <div className="spinner-border mb-3" role="status"></div>
          <p>Cargando tus reservas...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', maxWidth: '100%', padding: '2rem', background: '#f4f8f9', borderRadius: '16px' }}>
      <div className="mb-4">
        <h1 className="display-6 fw-bold mb-3">📋 Mis Reservas</h1>
        <p className="lead text-muted">Revisa el estado de todas tus solicitudes de reserva</p>
      </div>

      {error && (
        <div className="alert alert-danger mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Estadísticas */}
      <div className="row g-3 mb-4">
        <div className="col-md-2">
          <div className="card border-0 shadow-sm text-center">
            <div className="card-body py-3">
              <div className="fs-2 fw-bold text-primary">{totalReservas}</div>
              <small className="text-muted">Total</small>
            </div>
          </div>
        </div>
        <div className="col-md-2">
          <div className="card border-0 shadow-sm text-center">
            <div className="card-body py-3">
              <div className="fs-2 fw-bold text-warning">{pendientes}</div>
              <small className="text-muted">Pendientes</small>
            </div>
          </div>
        </div>
        <div className="col-md-2">
          <div className="card border-0 shadow-sm text-center">
            <div className="card-body py-3">
              <div className="fs-2 fw-bold text-success">{aprobadas}</div>
              <small className="text-muted">Aprobadas</small>
            </div>
          </div>
        </div>
        <div className="col-md-2">
          <div className="card border-0 shadow-sm text-center">
            <div className="card-body py-3">
              <div className="fs-2 fw-bold text-danger">{rechazadas}</div>
              <small className="text-muted">Rechazadas</small>
            </div>
          </div>
        </div>
        <div className="col-md-2">
          <div className="card border-0 shadow-sm text-center">
            <div className="card-body py-3">
              <div className="fs-2 fw-bold text-secondary">{canceladas}</div>
              <small className="text-muted">Canceladas</small>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros y Acciones */}
      <div className="card shadow-sm border-0 mb-4">
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
                <option value="todas">Todas las reservas</option>
                <option value="pendiente">Pendientes</option>
                <option value="aprobada">Aprobadas</option>
                <option value="rechazada">Rechazadas</option>
                <option value="cancelada">Canceladas</option>
                <option value="completada">Completadas</option>
              </select>
            </div>
            <div className="col-md-6 text-md-end">
              <Link href="/reservas" className="btn btn-primary btn-lg">
                ➕ Nueva Solicitud
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Reservas */}
      {reservasFiltradas.length === 0 ? (
        <div className="card shadow-sm border-0">
          <div className="card-body text-center py-5">
            <div className="empty-icon mb-3" style={{ fontSize: '3rem' }}>📋</div>
            <h5>No tienes reservas</h5>
            <p className="text-muted mb-4">
              {filtroEstado === 'todas'
                ? 'Aún no has solicitado ninguna reserva. ¡Solicita el uso de espacios comunitarios!'
                : `No tienes reservas en estado "${getEstadoTexto(filtroEstado)}"`
              }
            </p>
            <Link href="/reservas" className="btn btn-primary">
              ➕ Solicitar Primera Reserva
            </Link>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          {reservasFiltradas.map((reserva) => (
            <div key={reserva.id} className="col-12">
              <div className="card shadow-sm border-0">
                <div className="card-body p-4">
                  <div className="row">
                    {/* Columna Principal */}
                    <div className="col-lg-8">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div>
                          <h4 className="card-title fw-bold mb-2">
                            🏟️ {reserva.espacio?.nombre || 'Espacio no disponible'}
                          </h4>
                          <span className={`badge ${getEstadoBadge(reserva.estado)} px-3 py-2`}>
                            {getEstadoTexto(reserva.estado)}
                          </span>
                        </div>
                      </div>

                      <div className="mb-3">
                        <h6 className="fw-semibold mb-2">📅 Fecha y Horario:</h6>
                        <p className="mb-1">
                          <strong>{formatearFecha(reserva.fecha_reserva)}</strong>
                        </p>
                        <p className="mb-0 text-muted">
                          {getBloqueTexto(reserva.bloque_horario)}
                        </p>
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

                      {reserva.estado === 'rechazada' && reserva.motivo_rechazo && (
                        <div className="alert alert-danger mb-3">
                          <h6 className="fw-semibold mb-2">❌ Motivo de Rechazo:</h6>
                          <p className="mb-0">{reserva.motivo_rechazo}</p>
                        </div>
                      )}

                      {reserva.estado === 'aprobada' && reserva.fecha_aprobacion && (
                        <div className="alert alert-success mb-3">
                          <small>
                            ✅ Aprobada el {formatearFechaHora(reserva.fecha_aprobacion)}
                            {reserva.aprobador && ` por ${reserva.aprobador.nombres} ${reserva.aprobador.apellidos}`}
                          </small>
                        </div>
                      )}

                      {reserva.observaciones && (
                        <div className="alert alert-info mb-3">
                          <h6 className="fw-semibold mb-2">📌 Observaciones:</h6>
                          <p className="mb-0">{reserva.observaciones}</p>
                        </div>
                      )}
                    </div>

                    {/* Columna Lateral */}
                    <div className="col-lg-4">
                      <div className="card bg-light border-0 mb-3">
                        <div className="card-body p-3">
                          <h6 className="fw-semibold mb-3">ℹ️ Información</h6>

                          {reserva.espacio?.ubicacion && (
                            <div className="mb-2">
                              <small className="text-muted d-block">Ubicación</small>
                              <small>{reserva.espacio.ubicacion}</small>
                            </div>
                          )}

                          <div className="mb-2">
                            <small className="text-muted d-block">Fecha de solicitud</small>
                            <small>{formatearFechaHora(reserva.created_at)}</small>
                          </div>

                          {reserva.updated_at !== reserva.created_at && (
                            <div>
                              <small className="text-muted d-block">Última actualización</small>
                              <small>{formatearFechaHora(reserva.updated_at)}</small>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Acciones */}
                      <div className="d-flex flex-column gap-2">
                        {reserva.estado === 'aprobada' && (
                          <button
                            className="btn btn-primary w-100"
                            onClick={() => descargarComprobante(reserva.id)}
                          >
                            📄 Descargar Comprobante
                          </button>
                        )}

                        {reserva.estado === 'pendiente' && (
                          <button
                            className="btn btn-danger w-100"
                            onClick={() => cancelarReserva(reserva.id)}
                          >
                            🚫 Cancelar Solicitud
                          </button>
                        )}
                      </div>
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
