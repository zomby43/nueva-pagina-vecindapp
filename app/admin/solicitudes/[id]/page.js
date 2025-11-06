'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function AdminSolicitudDetallePage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();

  const [solicitud, setSolicitud] = useState(null);
  const [loading, setLoading] = useState(true);
  const [nuevoEstado, setNuevoEstado] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Cargar datos de la solicitud
  useEffect(() => {
    fetchSolicitud();
  }, [params.id]);

  const fetchSolicitud = async () => {
    try {
      setLoading(true);

      // Obtener solicitud con datos del usuario
      const { data, error } = await supabase
        .from('solicitudes')
        .select(`
          *,
          usuario:usuarios!solicitudes_usuario_id_fkey (
            id,
            nombres,
            apellidos,
            rut,
            email,
            telefono,
            direccion
          ),
          atendidoPor:usuarios!solicitudes_atendido_por_fkey (
            nombres,
            apellidos
          )
        `)
        .eq('id', params.id)
        .single();

      if (error) {
        console.error('Error al cargar solicitud:', error);
        alert('Error al cargar la solicitud');
        return;
      }

      setSolicitud(data);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleCambiarEstado = async (e) => {
    e.preventDefault();

    if (!nuevoEstado) {
      alert('Debes seleccionar un estado');
      return;
    }

    try {
      setSubmitting(true);

      // Obtener usuario actual (admin)
      const { data: { user } } = await supabase.auth.getUser();

      // Obtener perfil del usuario
      const { data: perfil } = await supabase
        .from('usuarios')
        .select('id')
        .eq('email', user.email)
        .single();

      // Actualizar solicitud
      const updateData = {
        estado: nuevoEstado,
        observaciones: observaciones,
        updated_at: new Date().toISOString()
      };

      // Si se completa o rechaza, agregar fecha de respuesta y quién atendió
      if (nuevoEstado === 'completado' || nuevoEstado === 'rechazado') {
        updateData.fecha_respuesta = new Date().toISOString();
        updateData.atendido_por = perfil.id;
      }

      const { error } = await supabase
        .from('solicitudes')
        .update(updateData)
        .eq('id', params.id);

      if (error) {
        console.error('Error al actualizar:', error);
        alert('Error al actualizar el estado');
        return;
      }

      alert('Estado actualizado exitosamente');

      // Recargar datos
      await fetchSolicitud();

      // Limpiar formulario
      setNuevoEstado('');
      setObservaciones('');

    } catch (error) {
      console.error('Error:', error);
      alert('Error al procesar la solicitud');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h1>Cargando...</h1>
        </div>
      </div>
    );
  }

  if (!solicitud) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h1>Solicitud no encontrada</h1>
          <button onClick={() => router.back()} className="btn btn-secondary">
            ← Volver
          </button>
        </div>
      </div>
    );
  }

  // Mapear tipos para mostrar
  const tipoDisplay = {
    'certificado_residencia': 'Certificado de Residencia',
    'certificado_antiguedad': 'Certificado de Antigüedad',
    'otro': 'Otro'
  };

  // Mapear estados para mostrar
  const estadoDisplay = {
    'pendiente': 'Pendiente',
    'en_proceso': 'En Proceso',
    'completado': 'Completado',
    'rechazado': 'Rechazado'
  };

  const estadoBadgeClass = {
    'pendiente': 'badge-pendiente',
    'en_proceso': 'badge-en-proceso',
    'completado': 'badge-completado',
    'rechazado': 'badge-rechazado'
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Gestionar Solicitud</h1>
          <p className="page-subtitle">ID: {solicitud.id.substring(0, 8)}...</p>
        </div>
        <button onClick={() => router.back()} className="btn btn-secondary">
          ← Volver
        </button>
      </div>

      <div className="admin-detail-grid">
        {/* Información del Usuario */}
        <div className="detail-card">
          <h2>👤 Información del Usuario</h2>
          <div className="detail-grid">
            <div className="detail-item">
              <label>Nombre Completo:</label>
              <span>{solicitud.usuario.nombres} {solicitud.usuario.apellidos}</span>
            </div>
            <div className="detail-item">
              <label>RUT:</label>
              <span>{solicitud.usuario.rut}</span>
            </div>
            <div className="detail-item">
              <label>Email:</label>
              <span><a href={`mailto:${solicitud.usuario.email}`}>{solicitud.usuario.email}</a></span>
            </div>
            <div className="detail-item">
              <label>Teléfono:</label>
              <span>{solicitud.usuario.telefono ? <a href={`tel:${solicitud.usuario.telefono}`}>{solicitud.usuario.telefono}</a> : 'No proporcionado'}</span>
            </div>
            <div className="detail-item full-width">
              <label>Dirección:</label>
              <span>{solicitud.usuario.direccion || 'No proporcionada'}</span>
            </div>
          </div>
          <div className="card-actions">
            <a href={`/admin/usuarios/${solicitud.usuario.id}`} className="btn btn-secondary btn-sm">
              Ver Perfil Completo
            </a>
          </div>
        </div>

        {/* Información de la Solicitud */}
        <div className="detail-card">
          <h2>📋 Detalles de la Solicitud</h2>
          <div className="detail-grid">
            <div className="detail-item">
              <label>Número:</label>
              <span><code>{solicitud.id.substring(0, 13)}...</code></span>
            </div>
            <div className="detail-item">
              <label>Estado Actual:</label>
              <span className={`status-badge ${estadoBadgeClass[solicitud.estado]}`}>
                {estadoDisplay[solicitud.estado] || solicitud.estado}
              </span>
            </div>
            <div className="detail-item">
              <label>Tipo:</label>
              <span>{tipoDisplay[solicitud.tipo] || solicitud.tipo}</span>
            </div>
            <div className="detail-item">
              <label>Fecha Solicitud:</label>
              <span>{new Date(solicitud.fecha_solicitud).toLocaleDateString('es-CL', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</span>
            </div>
            {solicitud.fecha_respuesta && (
              <div className="detail-item">
                <label>Fecha Respuesta:</label>
                <span>{new Date(solicitud.fecha_respuesta).toLocaleDateString('es-CL', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
              </div>
            )}
            {solicitud.atendidoPor && (
              <div className="detail-item">
                <label>Atendido Por:</label>
                <span>{solicitud.atendidoPor.nombres} {solicitud.atendidoPor.apellidos}</span>
              </div>
            )}
            {solicitud.motivo && (
              <div className="detail-item full-width">
                <label>Motivo:</label>
                <span>{solicitud.motivo}</span>
              </div>
            )}
            {solicitud.observaciones && (
              <div className="detail-item full-width">
                <label>Observaciones:</label>
                <span>{solicitud.observaciones}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Documento adjunto si existe */}
      {solicitud.documento_url && (
        <div className="detail-card">
          <h2>📎 Certificado Generado</h2>
          <div className="documents-list">
            <div className="document-item">
              <div className="document-icon">📄</div>
              <div className="document-info">
                <h4>Certificado PDF</h4>
                <p>Generado el {solicitud.fecha_respuesta ? new Date(solicitud.fecha_respuesta).toLocaleDateString('es-CL') : 'N/A'}</p>
              </div>
              <a
                href={solicitud.documento_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary btn-sm"
              >
                📥 Descargar
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Cambiar Estado */}
      <div className="detail-card action-card">
        <h2>⚙️ Acciones Administrativas</h2>
        <form onSubmit={handleCambiarEstado} className="admin-action-form">
          <div className="form-group">
            <label htmlFor="nuevoEstado">Cambiar Estado *</label>
            <select
              id="nuevoEstado"
              value={nuevoEstado}
              onChange={(e) => setNuevoEstado(e.target.value)}
              required
              disabled={submitting}
            >
              <option value="">-- Seleccionar Estado --</option>
              <option value="pendiente">Pendiente</option>
              <option value="en_proceso">En Proceso</option>
              <option value="completado">Completado</option>
              <option value="rechazado">Rechazado</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="observaciones">Observaciones / Notas</label>
            <textarea
              id="observaciones"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              rows="4"
              placeholder="Describe la acción realizada o razón del cambio..."
              disabled={submitting}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
          >
            {submitting ? 'Actualizando...' : 'Actualizar Estado'}
          </button>
        </form>
      </div>

      {/* Información del historial */}
      <div className="detail-card">
        <h2>📈 Información de Seguimiento</h2>
        <div className="admin-timeline">
          <div className="admin-timeline-item">
            <div className="timeline-marker"></div>
            <div className="timeline-content">
              <div className="timeline-header">
                <span className="timeline-date">
                  {new Date(solicitud.created_at).toLocaleString('es-CL')}
                </span>
                <span className="timeline-user">Sistema</span>
              </div>
              <h4>Solicitud Creada</h4>
              <p>La solicitud fue registrada en el sistema</p>
            </div>
          </div>

          {solicitud.updated_at !== solicitud.created_at && (
            <div className="admin-timeline-item">
              <div className="timeline-marker"></div>
              <div className="timeline-content">
                <div className="timeline-header">
                  <span className="timeline-date">
                    {new Date(solicitud.updated_at).toLocaleString('es-CL')}
                  </span>
                  <span className="timeline-user">
                    {solicitud.atendidoPor
                      ? `${solicitud.atendidoPor.nombres} ${solicitud.atendidoPor.apellidos}`
                      : 'Sistema'}
                  </span>
                </div>
                <h4>Última Actualización</h4>
                <p>Estado: {estadoDisplay[solicitud.estado] || solicitud.estado}</p>
                {solicitud.observaciones && <p>{solicitud.observaciones}</p>}
              </div>
            </div>
          )}
        </div>

        <p className="text-muted" style={{ marginTop: '1rem', fontSize: '0.9rem' }}>
          ℹ️ El historial detallado de cambios estará disponible cuando se implemente el sistema de logs.
        </p>
      </div>
    </div>
  );
}
