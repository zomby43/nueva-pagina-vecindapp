'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { enviarCorreoSolicitudReserva } from '@/lib/emails/sendEmail';
import { useIsSmallMobile } from '@/hooks/useMediaQuery';

const BLOQUES_HORARIOS = {
  manana: { inicio: '09:00', fin: '13:00', label: 'Mañana (09:00 - 13:00)' },
  tarde: { inicio: '14:00', fin: '18:00', label: 'Tarde (14:00 - 18:00)' },
  noche: { inicio: '19:00', fin: '23:00', label: 'Noche (19:00 - 23:00)' },
  dia_completo: { inicio: '09:00', fin: '23:00', label: 'Día completo (09:00 - 23:00)' }
};

export default function ReservasPage() {
  const { user } = useAuth();
  const [espacios, setEspacios] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mesActual, setMesActual] = useState(new Date());
  const [espacioSeleccionado, setEspacioSeleccionado] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const esCalendarioCompacto = useIsSmallMobile();
  const [detalleReserva, setDetalleReserva] = useState(null);

  // Form data
  const [formData, setFormData] = useState({
    espacio_id: '',
    fecha_reserva: '',
    bloque_horario: 'manana',
    motivo: '',
    num_asistentes: ''
  });

  useEffect(() => {
    fetchEspacios();
    fetchReservasDelMes();
  }, [mesActual]);

  // Actualizar cuando la ventana recupera el foco (el usuario vuelve a la pestaña)
  useEffect(() => {
    const handleFocus = () => {
      fetchReservasDelMes();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [mesActual]);

  const fetchEspacios = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('espacios')
        .select('*')
        .eq('estado', 'activo')
        .order('nombre');

      if (error) throw error;
      setEspacios(data || []);

      if (data && data.length > 0 && !espacioSeleccionado) {
        setEspacioSeleccionado(data[0].id);
        setFormData(prev => ({ ...prev, espacio_id: data[0].id }));
      }
    } catch (error) {
      console.error('Error fetching espacios:', error);
      setError('Error al cargar los espacios disponibles');
    }
  };

  const fetchReservasDelMes = async () => {
    try {
      setLoading(true);
      const supabase = createClient();

      const primerDia = new Date(mesActual.getFullYear(), mesActual.getMonth(), 1);
      const ultimoDia = new Date(mesActual.getFullYear(), mesActual.getMonth() + 1, 0);

      const { data, error } = await supabase
        .from('reservas')
        .select(`
          *,
          espacio:espacio_id (
            nombre
          ),
          solicitante:solicitante_id (
            nombres,
            apellidos
          )
        `)
        .eq('estado', 'aprobada')
        .gte('fecha_reserva', primerDia.toISOString().split('T')[0])
        .lte('fecha_reserva', ultimoDia.toISOString().split('T')[0]);

      if (error) throw error;
      setReservas(data || []);
    } catch (error) {
      console.error('Error fetching reservas:', error);
    } finally {
      setLoading(false);
    }
  };

  const cambiarMes = (direccion) => {
    const nuevoMes = new Date(mesActual);
    nuevoMes.setMonth(mesActual.getMonth() + direccion);
    setMesActual(nuevoMes);
  };

  const verificarDisponibilidad = (fecha, bloque, espacioId) => {
    const fechaStr = fecha.toISOString().split('T')[0];
    const reservaExistente = reservas.find(r =>
      r.espacio_id === espacioId &&
      r.fecha_reserva === fechaStr &&
      (r.bloque_horario === bloque || r.bloque_horario === 'dia_completo' || bloque === 'dia_completo')
    );
    return !reservaExistente;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEspacioChange = (espacioId) => {
    setEspacioSeleccionado(espacioId);
    setFormData(prev => ({ ...prev, espacio_id: espacioId }));
  };

  const validarFormulario = () => {
    if (!formData.espacio_id) {
      alert('Por favor selecciona un espacio');
      return false;
    }
    if (!formData.fecha_reserva) {
      alert('Por favor selecciona una fecha');
      return false;
    }

    const fechaSeleccionada = new Date(formData.fecha_reserva + 'T00:00:00');
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (fechaSeleccionada < hoy) {
      alert('No puedes reservar fechas pasadas');
      return false;
    }

    if (!formData.motivo.trim()) {
      alert('Por favor indica el motivo de la reserva');
      return false;
    }

    if (formData.motivo.trim().length < 10) {
      alert('El motivo debe tener al menos 10 caracteres');
      return false;
    }

    if (formData.num_asistentes && parseInt(formData.num_asistentes) <= 0) {
      alert('El número de asistentes debe ser mayor a 0');
      return false;
    }

    // Verificar disponibilidad
    const fechaReserva = new Date(formData.fecha_reserva + 'T00:00:00');
    if (!verificarDisponibilidad(fechaReserva, formData.bloque_horario, formData.espacio_id)) {
      alert('Este espacio ya está reservado para la fecha y horario seleccionado');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validarFormulario()) return;

    try {
      const supabase = createClient();

      const dataToSave = {
        espacio_id: formData.espacio_id,
        solicitante_id: user.id,
        fecha_reserva: formData.fecha_reserva,
        bloque_horario: formData.bloque_horario,
        motivo: formData.motivo.trim(),
        num_asistentes: formData.num_asistentes ? parseInt(formData.num_asistentes) : null,
        estado: 'pendiente'
      };

      const bloqueSeleccionado = BLOQUES_HORARIOS[formData.bloque_horario];
      dataToSave.hora_inicio = bloqueSeleccionado?.inicio || null;
      dataToSave.hora_fin = bloqueSeleccionado?.fin || null;

      const { error } = await supabase
        .from('reservas')
        .insert([dataToSave]);

      if (error) throw error;

      // Enviar email de confirmación
      try {
        const espacioNombre = espacios.find(e => e.id === formData.espacio_id)?.nombre || 'Espacio';
        await enviarCorreoSolicitudReserva(
          user.email,
          user.user_metadata?.nombre_completo || user.email,
          espacioNombre,
          formData.fecha_reserva,
          formData.bloque_horario
        );
      } catch (emailError) {
        console.error('Error enviando email:', emailError);
        // No bloquear el flujo si falla el email
      }

      alert('¡Solicitud de reserva enviada exitosamente! La directiva la revisará pronto.');

      // Resetear formulario
      setFormData({
        espacio_id: espacioSeleccionado,
        fecha_reserva: '',
        bloque_horario: 'manana',
        motivo: '',
        num_asistentes: ''
      });
      setMostrarFormulario(false);
      fetchReservasDelMes();
    } catch (error) {
      console.error('Error creating reserva:', error);
      alert('Error al crear la solicitud: ' + error.message);
    }
  };

  const handleVerDetalleReserva = ({ fechaISO, reservasDetalle }) => {
    setDetalleReserva({
      fecha: fechaISO,
      reservas: reservasDetalle
    });
  };

  const cerrarDetalleReserva = () => setDetalleReserva(null);

  const espacioActual = espacios.find(e => e.id === espacioSeleccionado);

  return (
    <div style={{ width: '100%', maxWidth: '100%', padding: '2rem', background: '#f4f8f9', borderRadius: '16px' }}>
      <div className="mb-4 vecino-page-header">
        <h1 className="fw-bold mb-3"><i className="bi bi-house-door me-2"></i>Reservar Espacios</h1>
        <p className="text-muted vecino-text-base">
          Solicita la reserva de espacios comunes de la junta de vecinos
        </p>
      </div>

      {error && (
        <div className="alert alert-danger mb-4 vecino-alert">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Selector de Espacios */}
      <div className="card shadow-sm border-0 mb-4 vecino-card">
        <div className="card-body p-4">
          <h5 className="card-title mb-3 vecino-text-base">Selecciona un Espacio</h5>
          <div className="row g-3">
            {espacios.map((espacio) => (
              <div key={espacio.id} className="col-md-4">
                <div
                  className={`card h-100 vecino-card ${espacioSeleccionado === espacio.id ? 'border-primary' : ''}`}
                  style={{
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    backgroundColor: espacioSeleccionado === espacio.id ? '#e7f3f5' : 'white'
                  }}
                  onClick={() => handleEspacioChange(espacio.id)}
                >
                  <div className="card-body">
                    <h6 className="card-title fw-bold vecino-text-base">{espacio.nombre}</h6>
                    <p className="card-text text-muted mb-2 vecino-text-sm">{espacio.descripcion}</p>
                    {espacio.capacidad && (
                      <span className="text-muted vecino-text-sm">
                        <i className="bi bi-people-fill me-1"></i>Capacidad: {espacio.capacidad} personas
                      </span>
                    )}
                    {espacio.ubicacion && (
                      <div><span className="text-muted vecino-text-sm"><i className="bi bi-geo-alt-fill me-1"></i>{espacio.ubicacion}</span></div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Acciones Principales */}
      <div className="d-flex flex-column flex-md-row gap-3 mb-4 vecino-btn-group">
        <button
          className="btn btn-primary vecino-btn"
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
        >
          {mostrarFormulario ? <><i className="bi bi-calendar3 me-2"></i>Ver Calendario</> : <><i className="bi bi-plus-circle me-2"></i>Nueva Solicitud</>}
        </button>
        <Link href="/reservas/mis-reservas" className="btn btn-outline-secondary vecino-btn">
          <i className="bi bi-clipboard-check me-2"></i>Mis Reservas
        </Link>
      </div>

      {mostrarFormulario ? (
        /* Formulario de Solicitud */
        <div className="card shadow-sm border-0 vecino-card">
          <div className="card-body p-4">
            <h5 className="card-title mb-4 vecino-text-base"><i className="bi bi-pencil-square me-2"></i>Solicitar Reserva</h5>

            {espacioActual && (
              <div className="alert alert-info mb-4 vecino-alert">
                <strong><i className="bi bi-pin-fill me-1"></i>{espacioActual.nombre}</strong>
                {espacioActual.observaciones && (
                  <p className="mb-0 mt-2 vecino-text-sm">{espacioActual.observaciones}</p>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="row g-4">
                <div className="col-12">
                  <div className="vecino-form-group">
                    <label htmlFor="fecha_reserva" className="form-label vecino-form-label">
                      Fecha de Reserva <span className="text-danger">*</span>
                    </label>
                    <input
                      type="date"
                      className="form-control vecino-form-control"
                      id="fecha_reserva"
                      name="fecha_reserva"
                      value={formData.fecha_reserva}
                      onChange={handleInputChange}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                </div>

                <div className="col-12">
                  <div className="vecino-form-group">
                    <label htmlFor="bloque_horario" className="form-label vecino-form-label">
                      Bloque Horario <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select vecino-form-select"
                      id="bloque_horario"
                      name="bloque_horario"
                      value={formData.bloque_horario}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="manana">Mañana (9:00 - 13:00)</option>
                      <option value="tarde">Tarde (14:00 - 18:00)</option>
                      <option value="noche">Noche (19:00 - 23:00)</option>
                      <option value="dia_completo">Día Completo (9:00 - 23:00)</option>
                    </select>
                  </div>
                </div>

                <div className="col-12">
                  <div className="vecino-form-group">
                    <label htmlFor="num_asistentes" className="form-label vecino-form-label">
                      Número de Asistentes (opcional)
                    </label>
                    <input
                      type="number"
                      className="form-control vecino-form-control"
                      id="num_asistentes"
                      name="num_asistentes"
                      value={formData.num_asistentes}
                      onChange={handleInputChange}
                      min="1"
                      placeholder="Ej: 25"
                    />
                    {espacioActual?.capacidad && (
                      <span className="text-muted vecino-text-sm">
                        Capacidad máxima: {espacioActual.capacidad} personas
                      </span>
                    )}
                  </div>
                </div>

                <div className="col-12">
                  <div className="vecino-form-group">
                    <label htmlFor="motivo" className="form-label vecino-form-label">
                      Motivo de la Reserva <span className="text-danger">*</span>
                    </label>
                    <textarea
                      className="form-control vecino-form-control"
                      id="motivo"
                      name="motivo"
                      rows={4}
                      value={formData.motivo}
                      onChange={handleInputChange}
                      placeholder="Describe detalladamente el motivo de tu solicitud (mínimo 10 caracteres)"
                      required
                    />
                    <small className="text-muted">
                      {formData.motivo.length}/500 caracteres
                    </small>
                  </div>
                </div>
              </div>

              <div className="alert alert-warning mt-4">
                <strong>⚠️ Importante:</strong> Esta solicitud quedará pendiente de aprobación por la directiva.
                Recibirás una notificación cuando sea revisada.
              </div>

              <div className="d-flex gap-2 mt-4">
                <button type="submit" className="btn btn-primary btn-lg">
                  📤 Enviar Solicitud
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-lg"
                  onClick={() => setMostrarFormulario(false)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        /* Calendario de Disponibilidad */
        <div className="card shadow-sm border-0">
          <div className="card-body p-4">
            <div className="calendario-toolbar d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
              <h5 className="card-title mb-0">
                📅 Calendario de {espacioActual?.nombre || 'Disponibilidad'}
              </h5>
              <div className="calendario-toolbar-actions d-flex gap-2 flex-wrap">
                <button
                  className="btn btn-outline-secondary btn-sm"
                  onClick={fetchReservasDelMes}
                  disabled={loading}
                  title="Actualizar disponibilidad"
                >
                  {loading ? (
                    <span className="spinner-border spinner-border-sm" role="status"></span>
                  ) : (
                    '🔄 Actualizar'
                  )}
                </button>
                <button
                  className="btn btn-outline-primary"
                  onClick={() => cambiarMes(-1)}
                >
                  ← Anterior
                </button>
                <button
                  className="btn btn-outline-primary"
                  onClick={() => cambiarMes(1)}
                >
                  Siguiente →
                </button>
              </div>
            </div>

            <h4 className="text-center mb-4">
              {mesActual.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' }).toUpperCase()}
            </h4>

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border" role="status"></div>
                <p>Cargando calendario...</p>
              </div>
            ) : (
              <CalendarioMensual
                mes={mesActual}
                reservas={reservas}
                espacioId={espacioSeleccionado}
                compacto={esCalendarioCompacto}
                onVerDetalle={handleVerDetalleReserva}
              />
            )}

            <div className="mt-4 p-3 bg-light rounded">
              <h6 className="fw-semibold mb-3">📌 Leyenda:</h6>
              <div className="d-flex flex-wrap gap-3">
                <div className="d-flex align-items-center">
                  <div style={{ width: 24, height: 24, backgroundColor: '#dc3545', borderRadius: '4px', marginRight: 8 }}></div>
                  <small><strong>🔒 Reservado</strong> - No disponible</small>
                </div>
                <div className="d-flex align-items-center">
                  <div style={{ width: 24, height: 24, backgroundColor: '#fff', border: '1px solid #dee2e6', borderRadius: '4px', marginRight: 8 }}></div>
                  <small><strong>✓ Disponible</strong> - Puedes reservar</small>
                </div>
                <div className="d-flex align-items-center">
                  <div style={{ width: 24, height: 24, backgroundColor: '#e2e3e5', border: '1px solid #dee2e6', borderRadius: '4px', marginRight: 8 }}></div>
                  <small><strong>Fecha pasada</strong> - No se puede reservar</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {detalleReserva && (
        <div
          className="calendario-modal-backdrop"
          role="presentation"
          onClick={cerrarDetalleReserva}
        >
          <div
            className="calendario-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Detalles de reservas del día"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <p className="text-muted mb-1">Reservas para</p>
                <h5 className="mb-0">
                  {new Date(detalleReserva.fecha).toLocaleDateString('es-CL', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </h5>
              </div>
              <button
                type="button"
                className="btn-close"
                aria-label="Cerrar"
                onClick={cerrarDetalleReserva}
              ></button>
            </div>

            <div className="calendario-modal-body">
              {(detalleReserva.reservas || []).map((reserva) => {
                const bloque = BLOQUES_HORARIOS[reserva.bloque_horario];
                const key = reserva.id || `${reserva.fecha_reserva}-${reserva.bloque_horario}-${reserva.hora_inicio}`;
                return (
                  <div key={key} className="calendario-modal-reserva">
                    <div className="calendario-modal-icon" aria-hidden="true">
                      🔒
                    </div>
                    <div className="calendario-modal-info">
                      <strong>{bloque?.label || 'Horario reservado'}</strong>
                      <small className="text-muted d-block">
                        Horario: {reserva.hora_inicio?.slice(0, 5) || '--:--'} - {reserva.hora_fin?.slice(0, 5) || '--:--'}
                      </small>
                      {reserva.solicitante && (
                        <small className="text-muted d-block">
                          Solicitante: {reserva.solicitante.nombres} {reserva.solicitante.apellidos}
                        </small>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="text-end">
              <button type="button" className="btn btn-outline-secondary btn-sm" onClick={cerrarDetalleReserva}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Componente de Calendario Mensual
function CalendarioMensual({ mes, reservas, espacioId, compacto = false, onVerDetalle }) {
  const primerDia = new Date(mes.getFullYear(), mes.getMonth(), 1);
  const ultimoDia = new Date(mes.getFullYear(), mes.getMonth() + 1, 0);
  const diasEnMes = ultimoDia.getDate();
  const primerDiaSemana = primerDia.getDay();
  const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const dias = [];
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  // Días vacíos al inicio
  for (let i = 0; i < primerDiaSemana; i++) {
    dias.push(
      <div
        key={`empty-${i}`}
        className="calendario-dia calendario-dia-vacio"
        aria-hidden="true"
      ></div>
    );
  }

  // Días del mes
  for (let dia = 1; dia <= diasEnMes; dia++) {
    const fecha = new Date(mes.getFullYear(), mes.getMonth(), dia);
    const fechaStr = fecha.toISOString().split('T')[0];
    const esPasado = fecha < hoy;

    const reservasDelDia = reservas.filter(r =>
      r.fecha_reserva === fechaStr && r.espacio_id === espacioId
    );

    const estadoDia = esPasado ? 'pasado' : reservasDelDia.length > 0 ? 'reservado' : 'disponible';
    const diaClassName = [
      'calendario-dia',
      esPasado ? 'calendario-dia-pasado' : '',
      estadoDia === 'reservado' ? 'calendario-dia-ocupado' : '',
      estadoDia === 'disponible' ? 'calendario-dia-libre' : '',
      compacto ? 'calendario-dia-compacto' : ''
    ]
      .filter(Boolean)
      .join(' ');

    let contenidoEstado;
    if (esPasado) {
      contenidoEstado = compacto ? (
        <div className="calendario-status-pill status-pasado" aria-label="Fecha pasada">
          —
        </div>
      ) : null;
    } else if (reservasDelDia.length > 0) {
      contenidoEstado = compacto ? (
        <div className="calendario-status-pill status-reservado" aria-label="Reservado">
          🔒
        </div>
      ) : (
        reservasDelDia.map((reserva, idx) => (
          <div
            key={idx}
            className="calendario-tag calendario-tag-reservado"
            title="Reservado - No disponible"
          >
            {reserva.bloque_horario === 'manana' && '🔒 Mañana'}
            {reserva.bloque_horario === 'tarde' && '🔒 Tarde'}
            {reserva.bloque_horario === 'noche' && '🔒 Noche'}
            {reserva.bloque_horario === 'dia_completo' && '🔒 Día Completo'}
          </div>
        ))
      );
    } else {
      contenidoEstado = compacto ? (
        <div className="calendario-status-pill status-disponible" aria-label="Disponible">
          ✓
        </div>
      ) : (
        <div className="calendario-disponible">
          ✓ Disponible
        </div>
      );
    }

    const puedeVerDetalle = estadoDia === 'reservado' && typeof onVerDetalle === 'function';
    const fechaISO = fecha.toISOString();
    const fechaLegible = fecha.toLocaleDateString('es-CL', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });

    const handleDiaClick = () => {
      if (puedeVerDetalle) {
        onVerDetalle({ fechaISO, reservasDetalle: reservasDelDia });
      }
    };

    dias.push(
      <div
        key={dia}
        className={`${diaClassName} ${puedeVerDetalle ? 'calendario-dia-clickable' : ''}`}
        onClick={puedeVerDetalle ? handleDiaClick : undefined}
        onKeyDown={
          puedeVerDetalle
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleDiaClick();
                }
              }
            : undefined
        }
        role={puedeVerDetalle ? 'button' : undefined}
        tabIndex={puedeVerDetalle ? 0 : undefined}
        aria-label={
          puedeVerDetalle
            ? `Reservado el ${fechaLegible}, selecciona para ver detalles`
            : undefined
        }
      >
        <div className="calendario-dia-num">{dia}</div>
        {contenidoEstado}
      </div>
    );
  }

  return (
    <div className="calendario-wrapper">
      <div className={`calendario-grid ${compacto ? 'calendario-grid-compacto' : ''}`} role="grid">
        {diasSemana.map(dia => (
          <div key={dia} className="calendario-header" role="columnheader">
            {dia}
          </div>
        ))}
        {dias}
      </div>
    </div>
  );
}
