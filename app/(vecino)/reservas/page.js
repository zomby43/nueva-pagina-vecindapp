'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { enviarCorreoSolicitudReserva } from '@/lib/emails/sendEmail';

export default function ReservasPage() {
  const { user } = useAuth();
  const [espacios, setEspacios] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mesActual, setMesActual] = useState(new Date());
  const [espacioSeleccionado, setEspacioSeleccionado] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

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

      // Definir horarios según bloque
      const bloques = {
        manana: { inicio: '09:00', fin: '13:00' },
        tarde: { inicio: '14:00', fin: '18:00' },
        noche: { inicio: '19:00', fin: '23:00' },
        dia_completo: { inicio: '09:00', fin: '23:00' }
      };

      dataToSave.hora_inicio = bloques[formData.bloque_horario].inicio;
      dataToSave.hora_fin = bloques[formData.bloque_horario].fin;

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

  const getBloqueTexto = (bloque) => {
    const textos = {
      manana: 'Mañana (9:00-13:00)',
      tarde: 'Tarde (14:00-18:00)',
      noche: 'Noche (19:00-23:00)',
      dia_completo: 'Día Completo (9:00-23:00)'
    };
    return textos[bloque] || bloque;
  };

  const espacioActual = espacios.find(e => e.id === espacioSeleccionado);

  return (
    <div style={{ width: '100%', maxWidth: '100%', padding: '2rem', background: '#f4f8f9', borderRadius: '16px' }}>
      <div className="mb-4">
        <h1 className="display-6 fw-bold mb-3">🏟️ Reservar Espacios</h1>
        <p className="lead text-muted">
          Solicita la reserva de espacios comunes de la junta de vecinos
        </p>
      </div>

      {error && (
        <div className="alert alert-danger mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Selector de Espacios */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body p-4">
          <h5 className="card-title mb-3">Selecciona un Espacio</h5>
          <div className="row g-3">
            {espacios.map((espacio) => (
              <div key={espacio.id} className="col-md-4">
                <div
                  className={`card h-100 ${espacioSeleccionado === espacio.id ? 'border-primary' : ''}`}
                  style={{
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    backgroundColor: espacioSeleccionado === espacio.id ? '#e7f3f5' : 'white'
                  }}
                  onClick={() => handleEspacioChange(espacio.id)}
                >
                  <div className="card-body">
                    <h6 className="card-title fw-bold">{espacio.nombre}</h6>
                    <p className="card-text small text-muted mb-2">{espacio.descripcion}</p>
                    {espacio.capacidad && (
                      <small className="text-muted">
                        👥 Capacidad: {espacio.capacidad} personas
                      </small>
                    )}
                    {espacio.ubicacion && (
                      <div><small className="text-muted">📍 {espacio.ubicacion}</small></div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Acciones Principales */}
      <div className="d-flex gap-2 mb-4">
        <button
          className="btn btn-primary btn-lg"
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
        >
          {mostrarFormulario ? '📅 Ver Calendario' : '➕ Nueva Solicitud'}
        </button>
        <Link href="/reservas/mis-reservas" className="btn btn-outline-secondary btn-lg">
          📋 Mis Reservas
        </Link>
      </div>

      {mostrarFormulario ? (
        /* Formulario de Solicitud */
        <div className="card shadow-sm border-0">
          <div className="card-body p-4">
            <h5 className="card-title mb-4">📝 Solicitar Reserva</h5>

            {espacioActual && (
              <div className="alert alert-info mb-4">
                <strong>📌 {espacioActual.nombre}</strong>
                {espacioActual.observaciones && (
                  <p className="mb-0 mt-2 small">{espacioActual.observaciones}</p>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label htmlFor="fecha_reserva" className="form-label fw-semibold">
                    Fecha de Reserva <span className="text-danger">*</span>
                  </label>
                  <input
                    type="date"
                    className="form-control form-control-lg"
                    id="fecha_reserva"
                    name="fecha_reserva"
                    value={formData.fecha_reserva}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label htmlFor="bloque_horario" className="form-label fw-semibold">
                    Bloque Horario <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select form-select-lg"
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

                <div className="col-md-6">
                  <label htmlFor="num_asistentes" className="form-label fw-semibold">
                    Número de Asistentes (opcional)
                  </label>
                  <input
                    type="number"
                    className="form-control form-control-lg"
                    id="num_asistentes"
                    name="num_asistentes"
                    value={formData.num_asistentes}
                    onChange={handleInputChange}
                    min="1"
                    placeholder="Ej: 25"
                  />
                  {espacioActual?.capacidad && (
                    <small className="text-muted">
                      Capacidad máxima: {espacioActual.capacidad} personas
                    </small>
                  )}
                </div>

                <div className="col-12">
                  <label htmlFor="motivo" className="form-label fw-semibold">
                    Motivo de la Reserva <span className="text-danger">*</span>
                  </label>
                  <textarea
                    className="form-control"
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
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="card-title mb-0">
                📅 Calendario de {espacioActual?.nombre || 'Disponibilidad'}
              </h5>
              <div className="d-flex gap-2">
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
              />
            )}

            <div className="mt-4">
              <h6 className="fw-semibold mb-3">Leyenda:</h6>
              <div className="d-flex flex-wrap gap-3">
                <div className="d-flex align-items-center">
                  <div style={{ width: 20, height: 20, backgroundColor: '#d4edda', border: '1px solid #c3e6cb', marginRight: 8 }}></div>
                  <small>Disponible</small>
                </div>
                <div className="d-flex align-items-center">
                  <div style={{ width: 20, height: 20, backgroundColor: '#f8d7da', border: '1px solid #f5c6cb', marginRight: 8 }}></div>
                  <small>Reservado</small>
                </div>
                <div className="d-flex align-items-center">
                  <div style={{ width: 20, height: 20, backgroundColor: '#e2e3e5', border: '1px solid #d6d8db', marginRight: 8 }}></div>
                  <small>Fecha pasada</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Componente de Calendario Mensual
function CalendarioMensual({ mes, reservas, espacioId }) {
  const primerDia = new Date(mes.getFullYear(), mes.getMonth(), 1);
  const ultimoDia = new Date(mes.getFullYear(), mes.getMonth() + 1, 0);
  const diasEnMes = ultimoDia.getDate();
  const primerDiaSemana = primerDia.getDay();

  const dias = [];
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  // Días vacíos al inicio
  for (let i = 0; i < primerDiaSemana; i++) {
    dias.push(<div key={`empty-${i}`} style={{ padding: '1rem' }}></div>);
  }

  // Días del mes
  for (let dia = 1; dia <= diasEnMes; dia++) {
    const fecha = new Date(mes.getFullYear(), mes.getMonth(), dia);
    const fechaStr = fecha.toISOString().split('T')[0];
    const esPasado = fecha < hoy;

    const reservasDelDia = reservas.filter(r =>
      r.fecha_reserva === fechaStr && r.espacio_id === espacioId
    );

    dias.push(
      <div
        key={dia}
        style={{
          padding: '1rem',
          border: '1px solid #dee2e6',
          minHeight: '120px',
          backgroundColor: esPasado ? '#e2e3e5' : '#fff'
        }}
      >
        <div className="fw-bold mb-2">{dia}</div>
        {!esPasado && reservasDelDia.map((reserva, idx) => (
          <div
            key={idx}
            className="small mb-1 p-1"
            style={{
              backgroundColor: '#f8d7da',
              borderRadius: '4px',
              fontSize: '0.75rem'
            }}
          >
            {reserva.bloque_horario === 'manana' && '🌅 Mañana'}
            {reserva.bloque_horario === 'tarde' && '☀️ Tarde'}
            {reserva.bloque_horario === 'noche' && '🌙 Noche'}
            {reserva.bloque_horario === 'dia_completo' && '📅 Día Completo'}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0 }}>
        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(dia => (
          <div key={dia} className="text-center fw-bold p-2 bg-light border">
            {dia}
          </div>
        ))}
        {dias}
      </div>
    </div>
  );
}
