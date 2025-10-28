'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { enviarCorreoAprobacionProyecto, enviarCorreoRechazoProyecto } from '@/lib/emails/sendEmail';

export default function GestionProyectoDetallePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [proyecto, setProyecto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [motivoRechazo, setMotivoRechazo] = useState('');
  const [mostrarFormRechazo, setMostrarFormRechazo] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchProyecto();
    }
  }, [params.id]);

  const fetchProyecto = async () => {
    try {
      setLoading(true);
      setError('');
      const supabase = createClient();

      const { data, error } = await supabase
        .from('proyectos')
        .select(`
          *,
          creador:creador_id (
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
        .eq('id', params.id)
        .single();

      if (error) throw error;
      setProyecto(data);
      if (data.motivo_rechazo) {
        setMotivoRechazo(data.motivo_rechazo);
      }
    } catch (error) {
      console.error('Error fetching proyecto:', error);
      setError('Error al cargar el proyecto');
    } finally {
      setLoading(false);
    }
  };

  const aprobarProyecto = async () => {
    if (!confirm('¿Estás seguro de aprobar este proyecto? Esta acción quedará registrada.')) {
      return;
    }

    try {
      setProcessing(true);
      const supabase = createClient();

      const { error } = await supabase
        .from('proyectos')
        .update({
          estado: 'aprobado',
          aprobador_id: user.id,
          fecha_aprobacion: new Date().toISOString()
        })
        .eq('id', params.id);

      if (error) throw error;

      // Enviar email de aprobación
      try {
        await enviarCorreoAprobacionProyecto(
          proyecto.creador.email,
          `${proyecto.creador.nombres} ${proyecto.creador.apellidos}`,
          proyecto.titulo
        );
      } catch (emailError) {
        console.error('Error enviando email:', emailError);
        // No bloquear el flujo si falla el email
      }

      alert('Proyecto aprobado exitosamente');
      fetchProyecto();
    } catch (error) {
      console.error('Error aprobando proyecto:', error);
      alert('Error al aprobar el proyecto: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const rechazarProyecto = async () => {
    if (!motivoRechazo.trim()) {
      alert('Por favor ingresa un motivo de rechazo');
      return;
    }

    if (!confirm('¿Estás seguro de rechazar este proyecto? Esta acción quedará registrada.')) {
      return;
    }

    try {
      setProcessing(true);
      const supabase = createClient();

      const { error } = await supabase
        .from('proyectos')
        .update({
          estado: 'rechazado',
          motivo_rechazo: motivoRechazo.trim()
        })
        .eq('id', params.id);

      if (error) throw error;

      // Enviar email de rechazo
      try {
        await enviarCorreoRechazoProyecto(
          proyecto.creador.email,
          `${proyecto.creador.nombres} ${proyecto.creador.apellidos}`,
          proyecto.titulo,
          motivoRechazo.trim()
        );
      } catch (emailError) {
        console.error('Error enviando email:', emailError);
        // No bloquear el flujo si falla el email
      }

      alert('Proyecto rechazado');
      setMostrarFormRechazo(false);
      fetchProyecto();
    } catch (error) {
      console.error('Error rechazando proyecto:', error);
      alert('Error al rechazar el proyecto: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const cambiarEstado = async (nuevoEstado) => {
    const mensajes = {
      en_ejecucion: '¿Marcar este proyecto como "En Ejecución"?',
      completado: '¿Marcar este proyecto como "Completado"? Esta acción indicará que el proyecto finalizó exitosamente.',
      aprobado: '¿Volver a marcar como "Aprobado"?'
    };

    if (!confirm(mensajes[nuevoEstado] || '¿Cambiar el estado del proyecto?')) {
      return;
    }

    try {
      setProcessing(true);
      const supabase = createClient();

      const updateData = { estado: nuevoEstado };

      if (nuevoEstado === 'completado') {
        updateData.fecha_completado = new Date().toISOString();
      }

      const { error } = await supabase
        .from('proyectos')
        .update(updateData)
        .eq('id', params.id);

      if (error) throw error;

      alert('Estado actualizado exitosamente');
      fetchProyecto();
    } catch (error) {
      console.error('Error actualizando estado:', error);
      alert('Error al actualizar el estado: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const formatearPresupuesto = (monto) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(monto);
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-CL', {
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

  const getEstadoBadge = (estado) => {
    const badges = {
      pendiente: 'bg-warning text-dark',
      aprobado: 'bg-success',
      rechazado: 'bg-danger',
      en_ejecucion: 'bg-info',
      completado: 'bg-secondary'
    };
    return badges[estado] || 'bg-secondary';
  };

  const getEstadoTexto = (estado) => {
    const textos = {
      pendiente: 'Pendiente de Revisión',
      aprobado: 'Aprobado',
      rechazado: 'Rechazado',
      en_ejecucion: 'En Ejecución',
      completado: 'Completado'
    };
    return textos[estado] || estado;
  };

  const getEstadoIcon = (estado) => {
    const iconos = {
      pendiente: '⏳',
      aprobado: '✅',
      rechazado: '❌',
      en_ejecucion: '🚧',
      completado: '🎉'
    };
    return iconos[estado] || '📋';
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="text-center py-5">
          <div className="spinner-border mb-3" role="status"></div>
          <p>Cargando proyecto...</p>
        </div>
      </div>
    );
  }

  if (error || !proyecto) {
    return (
      <div className="page-container">
        <div className="alert alert-danger mb-4">
          <strong>Error:</strong> {error || 'Proyecto no encontrado'}
        </div>
        <Link href="/secretaria/proyectos" className="btn btn-secondary">
          ← Volver a Proyectos
        </Link>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link href="/secretaria/proyectos">Proyectos</Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            {proyecto.titulo}
          </li>
        </ol>
      </nav>

      {/* Header */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-start mb-3">
            <div>
              <h1 className="display-6 fw-bold mb-3">{proyecto.titulo}</h1>
              <span className={`badge ${getEstadoBadge(proyecto.estado)} px-3 py-2 fs-6`}>
                {getEstadoIcon(proyecto.estado)} {getEstadoTexto(proyecto.estado)}
              </span>
            </div>
            <div className="text-end">
              <div className="fs-3 fw-bold text-primary">
                {formatearPresupuesto(proyecto.presupuesto)}
              </div>
              <small className="text-muted">Presupuesto Estimado</small>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Columna Principal */}
        <div className="col-lg-8">
          {/* Descripción */}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-body p-4">
              <h4 className="card-title mb-3">📝 Descripción del Proyecto</h4>
              <p style={{ whiteSpace: 'pre-line', lineHeight: '1.8' }}>
                {proyecto.descripcion}
              </p>
            </div>
          </div>

          {/* Objetivo */}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-body p-4">
              <h4 className="card-title mb-3">🎯 Objetivo y Beneficios</h4>
              <p style={{ whiteSpace: 'pre-line', lineHeight: '1.8' }}>
                {proyecto.objetivo}
              </p>
            </div>
          </div>

          {/* Motivo de Rechazo (si aplica) */}
          {proyecto.estado === 'rechazado' && proyecto.motivo_rechazo && (
            <div className="card shadow-sm border-danger mb-4">
              <div className="card-body p-4">
                <h4 className="card-title text-danger mb-3">❌ Motivo de Rechazo</h4>
                <p style={{ whiteSpace: 'pre-line', lineHeight: '1.8' }}>
                  {proyecto.motivo_rechazo}
                </p>
              </div>
            </div>
          )}

          {/* Acciones de Gestión */}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-body p-4">
              <h4 className="card-title mb-4">⚙️ Acciones de Gestión</h4>

              {proyecto.estado === 'pendiente' && (
                <div>
                  <p className="text-muted mb-3">Este proyecto está pendiente de revisión. Puedes aprobarlo o rechazarlo:</p>
                  <div className="d-flex gap-2 mb-3">
                    <button
                      className="btn btn-success"
                      onClick={aprobarProyecto}
                      disabled={processing}
                    >
                      {processing ? 'Procesando...' : '✅ Aprobar Proyecto'}
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => setMostrarFormRechazo(!mostrarFormRechazo)}
                      disabled={processing}
                    >
                      ❌ Rechazar Proyecto
                    </button>
                  </div>

                  {mostrarFormRechazo && (
                    <div className="card bg-light border-danger">
                      <div className="card-body">
                        <h6 className="mb-3">Motivo de Rechazo</h6>
                        <textarea
                          className="form-control mb-3"
                          rows={4}
                          placeholder="Explica detalladamente por qué se rechaza este proyecto..."
                          value={motivoRechazo}
                          onChange={(e) => setMotivoRechazo(e.target.value)}
                        />
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-danger"
                            onClick={rechazarProyecto}
                            disabled={processing || !motivoRechazo.trim()}
                          >
                            {processing ? 'Rechazando...' : 'Confirmar Rechazo'}
                          </button>
                          <button
                            className="btn btn-secondary"
                            onClick={() => setMostrarFormRechazo(false)}
                            disabled={processing}
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {proyecto.estado === 'aprobado' && (
                <div>
                  <p className="text-muted mb-3">Este proyecto ha sido aprobado. Puedes iniciar su ejecución:</p>
                  <button
                    className="btn btn-info"
                    onClick={() => cambiarEstado('en_ejecucion')}
                    disabled={processing}
                  >
                    {processing ? 'Procesando...' : '🚧 Marcar como "En Ejecución"'}
                  </button>
                </div>
              )}

              {proyecto.estado === 'en_ejecucion' && (
                <div>
                  <p className="text-muted mb-3">Este proyecto está en ejecución. Cuando finalice, márcalo como completado:</p>
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-secondary"
                      onClick={() => cambiarEstado('completado')}
                      disabled={processing}
                    >
                      {processing ? 'Procesando...' : '🎉 Marcar como "Completado"'}
                    </button>
                    <button
                      className="btn btn-outline-warning"
                      onClick={() => cambiarEstado('aprobado')}
                      disabled={processing}
                    >
                      Volver a "Aprobado"
                    </button>
                  </div>
                </div>
              )}

              {proyecto.estado === 'completado' && (
                <div className="alert alert-success mb-0">
                  <strong>✅ Proyecto Completado</strong>
                  <p className="mb-0 mt-2">Este proyecto ha sido marcado como completado exitosamente.</p>
                </div>
              )}

              {proyecto.estado === 'rechazado' && (
                <div className="alert alert-danger mb-0">
                  <strong>❌ Proyecto Rechazado</strong>
                  <p className="mb-0 mt-2">Este proyecto fue rechazado. El creador ha sido notificado del motivo.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Columna Lateral */}
        <div className="col-lg-4">
          {/* Información del Proyecto */}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-body p-4">
              <h5 className="card-title mb-4">ℹ️ Información del Proyecto</h5>

              <div className="mb-3">
                <small className="text-muted d-block mb-1">Beneficiarios</small>
                <strong className="fs-5">👥 {proyecto.num_beneficiarios} vecinos</strong>
              </div>

              {proyecto.ubicacion && (
                <div className="mb-3">
                  <small className="text-muted d-block mb-1">Ubicación</small>
                  <strong>📍 {proyecto.ubicacion}</strong>
                </div>
              )}

              <div className="mb-3">
                <small className="text-muted d-block mb-1">Fecha de Inicio</small>
                <strong>📅 {formatearFecha(proyecto.fecha_inicio_estimada)}</strong>
              </div>

              <div className="mb-3">
                <small className="text-muted d-block mb-1">Fecha de Término</small>
                <strong>📅 {formatearFecha(proyecto.fecha_fin_estimada)}</strong>
              </div>

              <div className="mb-3">
                <small className="text-muted d-block mb-1">Duración Estimada</small>
                <strong>
                  {Math.ceil((new Date(proyecto.fecha_fin_estimada) - new Date(proyecto.fecha_inicio_estimada)) / (1000 * 60 * 60 * 24))} días
                </strong>
              </div>
            </div>
          </div>

          {/* Información del Creador */}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-body p-4">
              <h5 className="card-title mb-3">👤 Postulado Por</h5>
              {proyecto.creador ? (
                <>
                  <p className="mb-1">
                    <strong>{proyecto.creador.nombres} {proyecto.creador.apellidos}</strong>
                  </p>
                  <p className="mb-1 text-muted small">
                    📧 {proyecto.creador.email}
                  </p>
                  {proyecto.creador.telefono && (
                    <p className="mb-2 text-muted small">
                      📞 {proyecto.creador.telefono}
                    </p>
                  )}
                  <p className="mb-0 text-muted small">
                    📅 Postulado el {formatearFecha(proyecto.created_at)}
                  </p>
                </>
              ) : (
                <p className="text-muted mb-0">Información no disponible</p>
              )}
            </div>
          </div>

          {/* Información de Aprobación */}
          {proyecto.aprobador && proyecto.fecha_aprobacion && (
            <div className="card shadow-sm border-0 mb-4">
              <div className="card-body p-4">
                <h5 className="card-title mb-3">✅ Aprobado Por</h5>
                <p className="mb-1">
                  <strong>{proyecto.aprobador.nombres} {proyecto.aprobador.apellidos}</strong>
                </p>
                <p className="mb-0 text-muted small">
                  📅 {formatearFechaHora(proyecto.fecha_aprobacion)}
                </p>
              </div>
            </div>
          )}

          {/* Botón Volver */}
          <Link href="/secretaria/proyectos" className="btn btn-outline-secondary w-100">
            ← Volver a Proyectos
          </Link>
        </div>
      </div>
    </div>
  );
}
