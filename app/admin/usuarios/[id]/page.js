'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const ESTADO_LABEL = {
  pendiente_aprobacion: 'Pendiente de aprobación',
  activo: 'Activo',
  rechazado: 'Rechazado',
  inactivo: 'Inactivo'
};

const ESTADO_BADGE = {
  pendiente_aprobacion: 'warning',
  activo: 'success',
  rechazado: 'danger',
  inactivo: 'secondary'
};

const TIPO_SOLICITUD_LABEL = {
  certificado_residencia: 'Certificado de residencia',
  certificado_antiguedad: 'Certificado de antigüedad',
  otro: 'Otro'
};

const ESTADO_SOLICITUD_LABEL = {
  pendiente: 'Pendiente',
  en_proceso: 'En proceso',
  completado: 'Completado',
  rechazado: 'Rechazado'
};

const ESTADO_SOLICITUD_BADGE = {
  pendiente: 'warning',
  en_proceso: 'info',
  completado: 'success',
  rechazado: 'danger'
};

export default function AdminUsuarioDetallePage() {
  const params = useParams();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [usuario, setUsuario] = useState(null);
  const [formData, setFormData] = useState(null);
  const [solicitudes, setSolicitudes] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (params?.id) {
      fetchUsuario(params.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.id]);

  const fetchUsuario = async (usuarioId) => {
    try {
      setLoading(true);
      setError('');

      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', usuarioId)
        .single();

      if (error) throw error;
      if (!data) {
        setError('No se encontró al usuario solicitado.');
        return;
      }

      setUsuario(data);
      setFormData({
        nombres: data.nombres || '',
        apellidos: data.apellidos || '',
        email: data.email || '',
        telefono: data.telefono || '',
        direccion: data.direccion || ''
      });

      await fetchSolicitudes(usuarioId);
    } catch (fetchError) {
      console.error('Error obteniendo usuario:', fetchError);
      setError(fetchError.message || 'No se pudo cargar la información del usuario');
    } finally {
      setLoading(false);
    }
  };

  const fetchSolicitudes = async (usuarioId) => {
    try {
      const { data, error } = await supabase
        .from('solicitudes')
        .select('id, tipo, estado, fecha_solicitud, fecha_respuesta')
        .eq('usuario_id', usuarioId)
        .order('fecha_solicitud', { ascending: false })
        .limit(20);

      if (error) throw error;
      setSolicitudes(data || []);
    } catch (fetchError) {
      console.error('Error obteniendo solicitudes del usuario:', fetchError);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!usuario || !formData) return;

    try {
      setSaving(true);
      setError('');

      const { error } = await supabase
        .from('usuarios')
        .update({
          nombres: formData.nombres.trim(),
          apellidos: formData.apellidos.trim(),
          email: formData.email.trim(),
          telefono: formData.telefono.trim(),
          direccion: formData.direccion.trim()
        })
        .eq('id', usuario.id);

      if (error) throw error;

      const usuarioActualizado = {
        ...usuario,
        nombres: formData.nombres.trim(),
        apellidos: formData.apellidos.trim(),
        email: formData.email.trim(),
        telefono: formData.telefono.trim(),
        direccion: formData.direccion.trim(),
        updated_at: new Date().toISOString()
      };

      setUsuario(usuarioActualizado);
      setIsEditing(false);
      alert('Usuario actualizado exitosamente');
    } catch (saveError) {
      console.error('Error al guardar cambios:', saveError);
      setError(saveError.message || 'No se pudo actualizar el usuario');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleEstado = async () => {
    if (!usuario) return;

    const nuevoEstado = usuario.estado === 'activo' ? 'inactivo' : 'activo';

    if (!confirm(`¿Confirmas cambiar el estado del usuario a "${ESTADO_LABEL[nuevoEstado] || nuevoEstado}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('usuarios')
        .update({ estado: nuevoEstado })
        .eq('id', usuario.id);

      if (error) throw error;

      setUsuario((prev) => ({ ...prev, estado: nuevoEstado }));
      alert(`Usuario marcado como ${ESTADO_LABEL[nuevoEstado] || nuevoEstado}`);
    } catch (estadoError) {
      console.error('Error actualizando estado:', estadoError);
      alert(estadoError.message || 'No se pudo actualizar el estado');
    }
  };

  const formatFecha = (fecha) => {
    if (!fecha) return 'No registrado';
    try {
      return new Date(fecha).toLocaleDateString('es-CL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return fecha;
    }
  };

  const formatFechaCorta = (fecha) => {
    if (!fecha) return '—';
    try {
      return new Date(fecha).toLocaleDateString('es-CL', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch {
      return fecha;
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="text-center py-5">
          <div className="spinner-border mb-3" role="status"></div>
          <p>Cargando información del usuario...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="alert alert-danger d-flex justify-content-between align-items-center">
          <div>
            <strong>Error:</strong> {error}
          </div>
          <button onClick={() => router.back()} className="btn btn-secondary btn-sm">
            ← Volver
          </button>
        </div>
      </div>
    );
  }

  if (!usuario) {
    return (
      <div className="page-container">
        <div className="alert alert-warning">
          No se encontró información para el usuario solicitado.
        </div>
        <button onClick={() => router.back()} className="btn btn-secondary">
          ← Volver
        </button>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Detalle de Usuario</h1>
          <p className="page-subtitle">{usuario.rut}</p>
        </div>
        <button onClick={() => router.back()} className="btn btn-secondary">
          ← Volver
        </button>
      </div>

      <div className="admin-detail-grid">
        {/* Información Personal */}
        <div className="detail-card">
          <div className="detail-header">
            <h2>👤 Información Personal</h2>
            <div className="header-actions">
              {!isEditing && (
                <button onClick={() => setIsEditing(true)} className="btn btn-secondary btn-sm">
                  ✏️ Editar
                </button>
              )}
            </div>
          </div>

          {isEditing ? (
            <div className="edit-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Nombres</label>
                  <input
                    type="text"
                    name="nombres"
                    value={formData.nombres}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Apellidos</label>
                  <input
                    type="text"
                    name="apellidos"
                    value={formData.apellidos}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Teléfono</label>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Dirección</label>
                <input
                  type="text"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleChange}
                />
              </div>

              <div className="form-actions">
                <button onClick={handleSave} className="btn btn-primary" disabled={saving}>
                  {saving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
                <button onClick={() => setIsEditing(false)} className="btn btn-secondary">
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div className="detail-grid">
              <div className="detail-item">
                <label>Nombre Completo:</label>
                <span>{usuario.nombres} {usuario.apellidos}</span>
              </div>
              <div className="detail-item">
                <label>RUT:</label>
                <span><code>{usuario.rut}</code></span>
              </div>
              <div className="detail-item">
                <label>Email:</label>
                <span><a href={`mailto:${usuario.email}`}>{usuario.email}</a></span>
              </div>
              <div className="detail-item">
                <label>Teléfono:</label>
                <span><a href={`tel:${usuario.telefono}`}>{usuario.telefono}</a></span>
              </div>
              <div className="detail-item full-width">
                <label>Dirección:</label>
                <span>{usuario.direccion}</span>
              </div>
            </div>
          )}
        </div>

        {/* Estado y Verificación */}
        <div className="detail-card">
          <h2>⚙️ Estado de la Cuenta</h2>
          <div className="detail-grid">
            <div className="detail-item">
              <label>Estado:</label>
              <span className={`status-badge badge-${ESTADO_BADGE[usuario.estado] || 'secondary'}`}>
                {ESTADO_LABEL[usuario.estado] || usuario.estado}
              </span>
            </div>
            <div className="detail-item">
              <label>Rol:</label>
              <span className="badge bg-light text-dark text-capitalize">
                {usuario.rol}
              </span>
            </div>
            <div className="detail-item">
              <label>Verificado:</label>
              <span>{usuario.estado === 'activo' ? '✅ Sí' : '❌ No'}</span>
            </div>
            <div className="detail-item full-width">
              <label>Fecha de Registro:</label>
              <span>{formatFecha(usuario.created_at)}</span>
            </div>
          </div>

          <div className="card-actions">
            <button onClick={handleToggleEstado} className="btn btn-secondary">
              {usuario.estado === 'activo' ? 'Desactivar Usuario' : 'Activar Usuario'}
            </button>
          </div>
        </div>
      </div>

      {/* Solicitudes del Usuario */}
      <div className="detail-card">
        <h2>📋 Historial de Solicitudes</h2>
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tipo</th>
                <th>Estado</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {solicitudes.map((solicitud) => (
                <tr key={solicitud.id}>
                  <td><code>{solicitud.id.slice(0, 8).toUpperCase()}</code></td>
                  <td>{(TIPO_SOLICITUD_LABEL[solicitud.tipo] || solicitud.tipo)}</td>
                  <td>
                    <span className={`status-badge badge-${ESTADO_SOLICITUD_BADGE[solicitud.estado] || 'secondary'}`}>
                      {ESTADO_SOLICITUD_LABEL[solicitud.estado] || solicitud.estado}
                    </span>
                  </td>
                  <td>{formatFechaCorta(solicitud.fecha_solicitud)}</td>
                  <td>
                    <a href={`/admin/solicitudes/${solicitud.id}`} className="btn-link">
                      Ver
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {solicitudes.length === 0 && (
          <div className="empty-state-small">
            <p>Este usuario no tiene solicitudes registradas</p>
          </div>
        )}
      </div>

      {/* Acciones Administrativas */}
      <div className="detail-card danger-zone">
        <h2>⚠️ Zona de Peligro</h2>
        <p>Estas acciones son irreversibles y deben usarse con precaución.</p>
        <div className="danger-actions">
          <button className="btn btn-danger">
            Eliminar Usuario
          </button>
          <button className="btn btn-secondary">
            Reiniciar Contraseña
          </button>
        </div>
      </div>
    </div>
  );
}
