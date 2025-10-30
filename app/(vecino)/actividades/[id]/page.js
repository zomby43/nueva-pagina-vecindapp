'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { enviarCorreoInscripcionActividad } from '@/lib/emails/sendEmail';

export default function ActividadDetallePage() {
  const router = useRouter();
  const params = useParams();
  const { user, userProfile } = useAuth();
  const [actividad, setActividad] = useState(null);
  const [yaInscrito, setYaInscrito] = useState(false);
  const [miInscripcion, setMiInscripcion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    comentario: ''
  });

  useEffect(() => {
    if (params.id) {
      fetchActividad();
      checkInscripcion();
    }
  }, [params.id]);

  const fetchActividad = async () => {
    try {
      setLoading(true);
      const supabase = createClient();

      const { data, error } = await supabase
        .from('actividades')
        .select(`
          *,
          organizador:organizador_id (
            nombres,
            apellidos,
            email
          )
        `)
        .eq('id', params.id)
        .single();

      if (error) throw error;
      setActividad(data);
    } catch (error) {
      console.error('Error fetching actividad:', error);
      setError('Error al cargar la actividad');
    } finally {
      setLoading(false);
    }
  };

  const checkInscripcion = async () => {
    if (!user) return;

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('inscripciones_actividades')
        .select('*')
        .eq('actividad_id', params.id)
        .eq('participante_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setYaInscrito(true);
        setMiInscripcion(data);
      }
    } catch (error) {
      console.error('Error checking inscripcion:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      alert('Debes iniciar sesión para inscribirte');
      return;
    }

    if (yaInscrito) {
      alert('Ya estás inscrito en esta actividad');
      return;
    }

    if (actividad.cupo_disponible <= 0) {
      alert('No hay cupos disponibles para esta actividad');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const supabase = createClient();

      // Crear inscripción
      const { data: inscripcion, error: inscripcionError } = await supabase
        .from('inscripciones_actividades')
        .insert([
          {
            actividad_id: params.id,
            participante_id: user.id,
            comentario: formData.comentario || null,
            estado: 'pendiente'
          }
        ])
        .select()
        .single();

      if (inscripcionError) throw inscripcionError;

      // Enviar email de confirmación
      try {
        await enviarCorreoInscripcionActividad(
          userProfile.email,
          `${userProfile.nombres} ${userProfile.apellidos}`,
          actividad.titulo,
          actividad.fecha_inicio,
          actividad.categoria
        );
      } catch (emailError) {
        console.error('Error al enviar email:', emailError);
        // No bloquear el proceso si falla el email
      }

      alert('¡Inscripción realizada con éxito! Te notificaremos cuando sea confirmada.');

      // Recargar datos
      await fetchActividad();
      await checkInscripcion();

      // Limpiar formulario
      setFormData({ comentario: '' });
    } catch (error) {
      console.error('Error al inscribirse:', error);
      setError(error.message || 'Error al realizar la inscripción. Por favor intenta nuevamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-CL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCategoriaColor = (categoria) => {
    const colores = {
      deportiva: '#dc3545',
      cultural: '#6f42c1',
      educativa: '#0dcaf0',
      social: '#20c997',
      ambiental: '#198754',
      salud: '#fd7e14',
      recreativa: '#ffc107',
      otro: '#6c757d'
    };
    return colores[categoria] || '#6c757d';
  };

  const getCategoriaTexto = (categoria) => {
    const textos = {
      deportiva: 'Deportiva',
      cultural: 'Cultural',
      educativa: 'Educativa',
      social: 'Social',
      ambiental: 'Ambiental',
      salud: 'Salud',
      recreativa: 'Recreativa',
      otro: 'Otro'
    };
    return textos[categoria] || categoria;
  };

  const getCategoriaIcon = (categoria) => {
    const iconos = {
      deportiva: '⚽',
      cultural: '🎨',
      educativa: '📚',
      social: '🤝',
      ambiental: '🌱',
      salud: '❤️',
      recreativa: '🎉',
      otro: '📌'
    };
    return iconos[categoria] || '📌';
  };

  const getTipoIcon = (tipo) => {
    const iconos = {
      presencial: '📍',
      virtual: '💻',
      hibrida: '🔄'
    };
    return iconos[tipo] || '📍';
  };

  const getTipoTexto = (tipo) => {
    const textos = {
      presencial: 'Presencial',
      virtual: 'Virtual',
      hibrida: 'Híbrida'
    };
    return textos[tipo] || tipo;
  };

  const getEstadoInscripcionBadge = (estado) => {
    const badges = {
      pendiente: { bg: '#fbbf24', text: '#78350f', label: '⏳ Pendiente' },
      aprobada: { bg: '#34d399', text: '#064e3b', label: '✅ Aprobada' },
      rechazada: { bg: '#fb7185', text: '#881337', label: '❌ Rechazada' },
      cancelada: { bg: '#6b7280', text: 'white', label: '🚫 Cancelada' }
    };
    return badges[estado] || { bg: '#6b7280', text: 'white', label: estado };
  };

  if (loading) {
    return (
      <div style={{ width: '100%', maxWidth: '100%', padding: '2rem', background: '#f4f8f9', borderRadius: '16px' }}>
        <div className="text-center py-5">
          <div className="spinner-border mb-3" role="status"></div>
          <p>Cargando actividad...</p>
        </div>
      </div>
    );
  }

  if (!actividad) {
    return (
      <div style={{ width: '100%', maxWidth: '100%', padding: '2rem', background: '#f4f8f9', borderRadius: '16px' }}>
        <div className="alert alert-danger">
          No se encontró la actividad
        </div>
        <Link href="/actividades" className="btn btn-primary">
          ← Volver a Actividades
        </Link>
      </div>
    );
  }

  const categoriaColor = getCategoriaColor(actividad.categoria);
  const cuposDisponibles = actividad.cupo_disponible || 0;
  const cupoMaximo = actividad.cupo_maximo || 0;
  const porcentajeOcupacion = cupoMaximo > 0 ? ((cupoMaximo - cuposDisponibles) / cupoMaximo) * 100 : 0;

  return (
    <div style={{ width: '100%', maxWidth: '100%', padding: '2rem', background: '#f4f8f9', borderRadius: '16px' }}>
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link href="/actividades">Actividades</Link>
          </li>
          <li className="breadcrumb-item active">{actividad.titulo}</li>
        </ol>
      </nav>

      {error && (
        <div className="alert alert-danger mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Header con categoría */}
      <div className="card border-0 shadow mb-4" style={{ borderLeft: `6px solid ${categoriaColor}` }}>
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-start mb-3">
            <span
              className="badge"
              style={{
                backgroundColor: categoriaColor,
                color: 'white',
                fontSize: '1rem',
                padding: '0.6rem 1.2rem'
              }}
            >
              {getCategoriaIcon(actividad.categoria)} {getCategoriaTexto(actividad.categoria)}
            </span>

            {yaInscrito && miInscripcion && (
              <span
                className="badge"
                style={{
                  backgroundColor: getEstadoInscripcionBadge(miInscripcion.estado).bg,
                  color: getEstadoInscripcionBadge(miInscripcion.estado).text,
                  fontSize: '1rem',
                  padding: '0.6rem 1.2rem'
                }}
              >
                {getEstadoInscripcionBadge(miInscripcion.estado).label}
              </span>
            )}
          </div>

          <h1 className="display-5 fw-bold mb-3">{actividad.titulo}</h1>

          <p className="lead text-muted mb-4">{actividad.descripcion}</p>

          {/* Información principal */}
          <div className="row g-4">
            <div className="col-md-6">
              <div className="d-flex align-items-center mb-3">
                <span className="fs-4 me-3">📅</span>
                <div>
                  <small className="text-muted d-block">Fecha de inicio</small>
                  <strong>{formatearFecha(actividad.fecha_inicio)}</strong>
                </div>
              </div>
              <div className="d-flex align-items-center mb-3">
                <span className="fs-4 me-3">📅</span>
                <div>
                  <small className="text-muted d-block">Fecha de término</small>
                  <strong>{formatearFecha(actividad.fecha_fin)}</strong>
                </div>
              </div>
              <div className="d-flex align-items-center mb-3">
                <span className="fs-4 me-3">{getTipoIcon(actividad.tipo)}</span>
                <div>
                  <small className="text-muted d-block">Modalidad</small>
                  <strong>{getTipoTexto(actividad.tipo)}</strong>
                </div>
              </div>
            </div>

            <div className="col-md-6">
              {actividad.ubicacion && (
                <div className="d-flex align-items-center mb-3">
                  <span className="fs-4 me-3">📍</span>
                  <div>
                    <small className="text-muted d-block">Ubicación</small>
                    <strong>{actividad.ubicacion}</strong>
                  </div>
                </div>
              )}

              {/* Mostrar enlace de videollamada solo si usuario está aprobado */}
              {actividad.enlace_videollamada && miInscripcion?.estado === 'aprobada' && (
                <div className="d-flex align-items-center mb-3">
                  <span className="fs-4 me-3">💻</span>
                  <div>
                    <small className="text-muted d-block">Enlace de Videollamada</small>
                    <a
                      href={actividad.enlace_videollamada}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="fw-bold text-decoration-none"
                      style={{ color: '#439fa4', wordBreak: 'break-all' }}
                    >
                      Acceder a la reunión virtual
                    </a>
                  </div>
                </div>
              )}

              <div className="d-flex align-items-center mb-3">
                <span className="fs-4 me-3">👥</span>
                <div>
                  <small className="text-muted d-block">Cupos</small>
                  <strong>{cuposDisponibles} de {cupoMaximo} disponibles</strong>
                </div>
              </div>

              {actividad.es_gratuita ? (
                <div className="d-flex align-items-center mb-3">
                  <span className="fs-4 me-3">✅</span>
                  <div>
                    <small className="text-muted d-block">Costo</small>
                    <strong className="text-success">Actividad gratuita</strong>
                  </div>
                </div>
              ) : (
                <div className="d-flex align-items-center mb-3">
                  <span className="fs-4 me-3">💰</span>
                  <div>
                    <small className="text-muted d-block">Costo</small>
                    <strong>${actividad.costo.toLocaleString('es-CL')}</strong>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Barra de cupos */}
          <div className="mt-4">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <small className="text-muted">Ocupación de cupos</small>
              <small className="fw-semibold">
                {porcentajeOcupacion.toFixed(0)}% ocupado
              </small>
            </div>
            <div className="progress" style={{ height: '12px' }}>
              <div
                className={`progress-bar ${porcentajeOcupacion >= 90 ? 'bg-danger' : porcentajeOcupacion >= 70 ? 'bg-warning' : 'bg-success'}`}
                role="progressbar"
                style={{ width: `${porcentajeOcupacion}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Enlace de videollamada destacado para usuarios aprobados */}
      {actividad.enlace_videollamada && miInscripcion?.estado === 'aprobada' && (
        <div className="card border-0 shadow mb-4" style={{ backgroundColor: '#fff3cd' }}>
          <div className="card-body p-4">
            <div className="d-flex align-items-center mb-3">
              <span className="fs-3 me-3">💻</span>
              <h3 className="h5 fw-bold mb-0" style={{ color: '#856404' }}>Enlace de Videollamada</h3>
            </div>
            <p className="mb-3" style={{ color: '#856404' }}>
              Tu inscripción ha sido aprobada. Accede a la actividad virtual usando el siguiente enlace:
            </p>
            <a
              href={actividad.enlace_videollamada}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-lg fw-bold"
              style={{
                backgroundColor: '#439fa4',
                color: '#ffffff',
                border: 'none',
                wordBreak: 'break-all'
              }}
            >
              🚀 Acceder a la Reunión Virtual
            </a>
            <p className="mt-3 mb-0 small" style={{ color: '#856404' }}>
              <strong>💡 Recordatorio:</strong> Guarda este enlace y únete 10 minutos antes del inicio.
            </p>
          </div>
        </div>
      )}

      {/* Requisitos */}
      {actividad.requisitos && (
        <div className="card border-0 shadow mb-4">
          <div className="card-body p-4">
            <h3 className="h5 fw-bold mb-3">📋 Requisitos</h3>
            <p className="mb-0 text-muted" style={{ whiteSpace: 'pre-line' }}>
              {actividad.requisitos}
            </p>
          </div>
        </div>
      )}

      {/* Edades */}
      {(actividad.edad_minima || actividad.edad_maxima) && (
        <div className="card border-0 shadow mb-4">
          <div className="card-body p-4">
            <h3 className="h5 fw-bold mb-3">👤 Restricción de edad</h3>
            {actividad.edad_minima && actividad.edad_maxima && (
              <p className="mb-0">Edad: {actividad.edad_minima} a {actividad.edad_maxima} años</p>
            )}
            {actividad.edad_minima && !actividad.edad_maxima && (
              <p className="mb-0">Edad mínima: {actividad.edad_minima} años</p>
            )}
            {!actividad.edad_minima && actividad.edad_maxima && (
              <p className="mb-0">Edad máxima: {actividad.edad_maxima} años</p>
            )}
          </div>
        </div>
      )}

      {/* Formulario de inscripción o estado */}
      <div className="card border-0 shadow">
        <div className="card-body p-4">
          <h3 className="h4 fw-bold mb-4">✍️ Inscripción</h3>

          {yaInscrito ? (
            <div>
              <div className="alert alert-info">
                Ya estás inscrito en esta actividad con estado:{' '}
                <strong>{getEstadoInscripcionBadge(miInscripcion.estado).label}</strong>
              </div>

              {miInscripcion.estado === 'pendiente' && (
                <p className="text-muted">
                  Tu inscripción está pendiente de aprobación por parte de la secretaría.
                  Te notificaremos por email cuando sea confirmada.
                </p>
              )}

              {miInscripcion.estado === 'aprobada' && (
                <div className="alert alert-success">
                  ✅ Tu inscripción ha sido aprobada. ¡Nos vemos en la actividad!
                </div>
              )}

              {miInscripcion.estado === 'rechazada' && miInscripcion.motivo_rechazo && (
                <div className="alert alert-warning">
                  <strong>Motivo del rechazo:</strong> {miInscripcion.motivo_rechazo}
                </div>
              )}

              <Link href="/actividades/mis-inscripciones" className="btn btn-primary">
                📋 Ver Mis Inscripciones
              </Link>
            </div>
          ) : cuposDisponibles <= 0 ? (
            <div className="alert alert-danger">
              Lo sentimos, no hay cupos disponibles para esta actividad.
            </div>
          ) : actividad.estado === 'finalizada' || actividad.estado === 'cancelada' ? (
            <div className="alert alert-warning">
              Esta actividad ya no está disponible para inscripciones.
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="comentario" className="form-label">
                  Comentario (opcional)
                </label>
                <textarea
                  id="comentario"
                  name="comentario"
                  className="form-control"
                  rows="4"
                  placeholder="¿Tienes alguna pregunta o comentario sobre tu inscripción?"
                  value={formData.comentario}
                  onChange={handleInputChange}
                  disabled={submitting}
                ></textarea>
                <small className="text-muted">
                  Puedes dejar un mensaje para el organizador si tienes dudas o necesitas información adicional.
                </small>
              </div>

              <div className="d-flex gap-3">
                <button
                  type="submit"
                  className="btn btn-success btn-lg"
                  disabled={submitting}
                  style={{ backgroundColor: categoriaColor, border: 'none' }}
                >
                  {submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Inscribiendo...
                    </>
                  ) : (
                    '✅ Confirmar Inscripción'
                  )}
                </button>
                <Link href="/actividades" className="btn btn-outline-secondary btn-lg">
                  Volver
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
