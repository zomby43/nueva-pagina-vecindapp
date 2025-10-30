'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { enviarCorreoAprobacionInscripcionActividad, enviarCorreoRechazoInscripcionActividad } from '@/lib/emails/sendEmail';

export default function InscripcionesActividadPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const [actividad, setActividad] = useState(null);
  const [inscripciones, setInscripciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todas');

  useEffect(() => {
    if (params.id) {
      fetchActividad();
      fetchInscripciones();
    }
  }, [params.id]);

  const fetchActividad = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('actividades')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error) throw error;
      setActividad(data);
    } catch (error) {
      console.error('Error fetching actividad:', error);
      setError('Error al cargar la actividad');
    }
  };

  const fetchInscripciones = async () => {
    try {
      setLoading(true);
      const supabase = createClient();

      const { data, error } = await supabase
        .from('inscripciones_actividades')
        .select(`
          *,
          participante:participante_id (
            id,
            nombres,
            apellidos,
            email,
            telefono
          )
        `)
        .eq('actividad_id', params.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInscripciones(data || []);
    } catch (error) {
      console.error('Error fetching inscripciones:', error);
      setError('Error al cargar las inscripciones');
    } finally {
      setLoading(false);
    }
  };

  const handleAprobar = async (inscripcion) => {
    if (!confirm(`¿Aprobar la inscripción de ${inscripcion.participante.nombres} ${inscripcion.participante.apellidos}?`)) {
      return;
    }

    try {
      const supabase = createClient();

      const { error } = await supabase
        .from('inscripciones_actividades')
        .update({
          estado: 'aprobada',
          aprobador_id: user.id,
          fecha_aprobacion: new Date().toISOString()
        })
        .eq('id', inscripcion.id);

      if (error) throw error;

      // Enviar email de aprobación
      try {
        await enviarCorreoAprobacionInscripcionActividad(
          inscripcion.participante.email,
          `${inscripcion.participante.nombres} ${inscripcion.participante.apellidos}`,
          actividad.titulo,
          actividad.fecha_inicio,
          actividad.ubicacion,
          actividad.enlace_videollamada
        );
      } catch (emailError) {
        console.error('Error al enviar email:', emailError);
      }

      alert('Inscripción aprobada exitosamente');
      fetchInscripciones();
      fetchActividad();
    } catch (error) {
      console.error('Error al aprobar:', error);
      alert('Error al aprobar la inscripción');
    }
  };

  const handleRechazar = async (inscripcion) => {
    const motivo = prompt('Ingresa el motivo del rechazo (opcional):');
    if (motivo === null) return; // Canceló

    try {
      const supabase = createClient();

      const { error } = await supabase
        .from('inscripciones_actividades')
        .update({
          estado: 'rechazada',
          motivo_rechazo: motivo || null,
          aprobador_id: user.id
        })
        .eq('id', inscripcion.id);

      if (error) throw error;

      // Enviar email de rechazo
      try {
        await enviarCorreoRechazoInscripcionActividad(
          inscripcion.participante.email,
          `${inscripcion.participante.nombres} ${inscripcion.participante.apellidos}`,
          actividad.titulo,
          motivo
        );
      } catch (emailError) {
        console.error('Error al enviar email:', emailError);
      }

      alert('Inscripción rechazada');
      fetchInscripciones();
      fetchActividad();
    } catch (error) {
      console.error('Error al rechazar:', error);
      alert('Error al rechazar la inscripción');
    }
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEstadoBadge = (estado) => {
    const badges = {
      pendiente: { bg: '#fbbf24', text: '#78350f', label: '⏳ Pendiente' },
      aprobada: { bg: '#34d399', text: '#064e3b', label: '✅ Aprobada' },
      rechazada: { bg: '#fb7185', text: '#881337', label: '❌ Rechazada' },
      cancelada: { bg: '#6b7280', text: 'white', label: '🚫 Cancelada' }
    };
    return badges[estado] || { bg: '#6c757d', text: 'white', label: estado };
  };

  const inscripcionesFiltradas = inscripciones.filter(inscripcion => {
    if (filtroEstado !== 'todas' && inscripcion.estado !== filtroEstado) return false;
    return true;
  });

  const totalInscripciones = inscripcionesFiltradas.length;
  const pendientes = inscripcionesFiltradas.filter(i => i.estado === 'pendiente').length;
  const aprobadas = inscripcionesFiltradas.filter(i => i.estado === 'aprobada').length;
  const rechazadas = inscripcionesFiltradas.filter(i => i.estado === 'rechazada').length;

  if (loading) {
    return (
      <div style={{ width: '100%', maxWidth: '100%', padding: '2rem', background: '#f4f8f9', borderRadius: '16px' }}>
        <div className="text-center py-5">
          <div className="spinner-border mb-3" role="status"></div>
          <p>Cargando inscripciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', maxWidth: '100%', padding: '2rem', background: '#f4f8f9', borderRadius: '16px' }}>
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link href="/secretaria/actividades">Actividades</Link>
          </li>
          <li className="breadcrumb-item active">Inscripciones</li>
        </ol>
      </nav>

      {/* Header */}
      {actividad && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body p-4">
            <h1 className="h3 fw-bold mb-2">{actividad.titulo}</h1>
            <p className="text-muted mb-3">{actividad.descripcion}</p>
            <div className="d-flex gap-4">
              <div>
                <small className="text-muted">📅 Fecha:</small>
                <div className="fw-semibold">{formatearFecha(actividad.fecha_inicio)}</div>
              </div>
              <div>
                <small className="text-muted">👥 Cupos:</small>
                <div className="fw-semibold">{actividad.cupo_disponible} / {actividad.cupo_maximo} disponibles</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="alert alert-danger mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Estadísticas */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm text-center">
            <div className="card-body py-3">
              <div className="fs-2 fw-bold text-primary">{totalInscripciones}</div>
              <small className="text-muted">Total</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm text-center">
            <div className="card-body py-3">
              <div className="fs-2 fw-bold" style={{ color: '#fbbf24' }}>{pendientes}</div>
              <small className="text-muted">Pendientes</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm text-center">
            <div className="card-body py-3">
              <div className="fs-2 fw-bold text-success">{aprobadas}</div>
              <small className="text-muted">Aprobadas</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm text-center">
            <div className="card-body py-3">
              <div className="fs-2 fw-bold" style={{ color: '#fb7185' }}>{rechazadas}</div>
              <small className="text-muted">Rechazadas</small>
            </div>
          </div>
        </div>
      </div>

      {/* Filtro */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body p-4">
          <div className="row align-items-center">
            <div className="col-md-6">
              <label className="form-label fw-semibold">Filtrar por estado:</label>
              <select
                className="form-select form-select-lg"
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
              >
                <option value="todas">Todas las inscripciones</option>
                <option value="pendiente">⏳ Pendientes</option>
                <option value="aprobada">✅ Aprobadas</option>
                <option value="rechazada">❌ Rechazadas</option>
                <option value="cancelada">🚫 Canceladas</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de inscripciones */}
      {inscripcionesFiltradas.length === 0 ? (
        <div className="card border-0 shadow-sm text-center py-5">
          <div className="card-body">
            <div className="fs-1 mb-3">📭</div>
            <h3>No hay inscripciones</h3>
            <p className="text-muted">
              {filtroEstado !== 'todas'
                ? 'No hay inscripciones con este estado'
                : 'Aún no hay vecinos inscritos en esta actividad'}
            </p>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          {inscripcionesFiltradas.map((inscripcion) => {
            const estadoBadge = getEstadoBadge(inscripcion.estado);

            return (
              <div key={inscripcion.id} className="col-12">
                <div className="card border-0 shadow-sm">
                  <div className="card-body p-4">
                    <div className="row align-items-center">
                      {/* Info del participante */}
                      <div className="col-lg-6">
                        <div className="d-flex align-items-center mb-3">
                          <div className="me-3 fs-1">👤</div>
                          <div className="flex-grow-1">
                            <h4 className="h5 fw-bold mb-1">
                              {inscripcion.participante.nombres} {inscripcion.participante.apellidos}
                            </h4>
                            <div className="small text-muted">
                              📧 {inscripcion.participante.email}
                              {inscripcion.participante.telefono && (
                                <> • 📱 {inscripcion.participante.telefono}</>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="mb-2">
                          <small className="text-muted">
                            📅 Inscrito el {formatearFecha(inscripcion.created_at)}
                          </small>
                        </div>

                        {inscripcion.comentario && (
                          <div className="alert alert-light py-2 mb-2">
                            <small>
                              <strong>Comentario:</strong> {inscripcion.comentario}
                            </small>
                          </div>
                        )}

                        {inscripcion.motivo_rechazo && (
                          <div className="alert alert-warning py-2 mb-0">
                            <small>
                              <strong>Motivo del rechazo:</strong> {inscripcion.motivo_rechazo}
                            </small>
                          </div>
                        )}
                      </div>

                      {/* Estado y acciones */}
                      <div className="col-lg-6">
                        <div className="d-flex flex-column align-items-lg-end gap-3">
                          <span
                            className="badge"
                            style={{
                              backgroundColor: estadoBadge.bg,
                              color: estadoBadge.text,
                              fontSize: '1rem',
                              padding: '0.6rem 1.2rem'
                            }}
                          >
                            {estadoBadge.label}
                          </span>

                          {inscripcion.estado === 'pendiente' && (
                            <div className="d-flex gap-2">
                              <button
                                onClick={() => handleAprobar(inscripcion)}
                                className="btn btn-success"
                              >
                                ✅ Aprobar
                              </button>
                              <button
                                onClick={() => handleRechazar(inscripcion)}
                                className="btn btn-danger"
                              >
                                ❌ Rechazar
                              </button>
                            </div>
                          )}

                          {inscripcion.fecha_aprobacion && (
                            <small className="text-muted">
                              Aprobada el {formatearFecha(inscripcion.fecha_aprobacion)}
                            </small>
                          )}
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
