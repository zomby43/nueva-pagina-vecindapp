'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';

// === Helpers para abrir comprobantes desde Supabase ===
const DEFAULT_BUCKET = 'documentos';

function isAbsoluteUrl(url) {
  try { new URL(url); return true; } catch { return false; }
}
function normalizePath(p) {
  return (p || '').trim().replace(/\\+/g, '/').replace(/\s+/g, ' ');
}
/** Abre el comprobante (PDF/imagen) en nueva pestaña, usando Signed URL si el bucket es privado */
async function verComprobante(comprobante_url) {
  if (!comprobante_url) {
    alert('No hay comprobante disponible.');
    return;
  }

  const supabase = createClient();
  const clean = normalizePath(comprobante_url);

  // Si ya es http/https, abre directo
  if (isAbsoluteUrl(clean)) {
    window.open(clean, '_blank', 'noopener,noreferrer');
    return;
  }

  // Si viene como "comprobantes/archivo.ext" y el bucket real es "documentos"
  let bucket = DEFAULT_BUCKET;
  let objectPath = clean;
  if (clean.startsWith(`${DEFAULT_BUCKET}/`)) {
    objectPath = clean.replace(`${DEFAULT_BUCKET}/`, '');
  }

  // 1) Intentar Signed URL (privado)
  const { data: signed, error: signErr } = await supabase
    .storage
    .from(bucket)
    .createSignedUrl(objectPath, 300); // 5 minutos

  if (signed?.signedUrl) {
    window.open(signed.signedUrl, '_blank', 'noopener,noreferrer');
    return;
  }

  // 2) Fallback público
  const pub = supabase.storage.from(bucket).getPublicUrl(objectPath);
  if (pub?.data?.publicUrl) {
    window.open(pub.data.publicUrl, '_blank', 'noopener,noreferrer');
    return;
  }

  console.error('No se pudo abrir comprobante', { signErr, clean, bucket, objectPath, pub });
  alert('No se pudo abrir el comprobante. Revisa la ruta o las policies del bucket.');
}

export default function PerfilPage() {
  const { user, userProfile, loading: authLoading } = useAuth();
  const supabase = createClient();

  const [userData, setUserData] = useState({
    nombres: '',
    apellidos: '',
    rut: '',
    email: '',
    telefono: '',
    direccion: ''
  });

  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Cargar datos del usuario al montar el componente
  useEffect(() => {
    if (userProfile && user) {
      setUserData({
        nombres: userProfile.nombres || '',
        apellidos: userProfile.apellidos || '',
        rut: userProfile.rut || '',
        email: user.email || '',
        telefono: userProfile.telefono || '',
        direccion: userProfile.direccion || ''
      });
      setLoading(false);
    }
  }, [userProfile, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      // Actualizar datos en Supabase
      const { error: updateError } = await supabase
        .from('usuarios')
        .update({
          nombres: userData.nombres,
          apellidos: userData.apellidos,
          telefono: userData.telefono,
          direccion: userData.direccion,
          // No actualizamos email ni rut
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setSuccess('¡Perfil actualizado correctamente!');
      setEditMode(false);

      // Refrescar el perfil en el contexto
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      console.error('Error actualizando perfil:', err);
      setError('Error al actualizar el perfil. Por favor intenta nuevamente.');
    } finally {
      setSaving(false);
    }
  };

  // Mostrar loading mientras se cargan los datos
  if (loading || authLoading) {
    return (
      <div className="page-container">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-3 text-muted">Cargando información del perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header vecino-page-header">
        <h1><i className="bi bi-person me-2"></i>Mi Perfil</h1>
        <p className="text-muted vecino-text-base">Gestiona tu información personal</p>
      </div>

      <div className="profile-content">
        <div className="row">
          <div className="col-lg-10 col-xl-8 mx-auto">
            <div className="card vecino-card">
              <div className="card-header d-flex justify-content-between align-items-center" style={{ padding: '1.5rem' }}>
                <h5 className="mb-0 vecino-text-lg">Información Personal</h5>
                <button
                  type="button"
                  className={`btn ${editMode ? 'btn-secondary' : 'btn-primary'} vecino-btn`}
                  onClick={() => setEditMode(!editMode)}
                  disabled={saving}
                >
                  {editMode ? 'Cancelar' : 'Editar'}
                </button>
              </div>
              <div className="card-body" style={{ padding: '2rem' }}>
                {/* Mensajes de éxito/error */}
                {success && (
                  <div className="alert alert-success alert-dismissible fade show vecino-alert" role="alert">
                    {success}
                    <button type="button" className="btn-close" onClick={() => setSuccess('')}></button>
                  </div>
                )}
                {error && (
                  <div className="alert alert-danger alert-dismissible fade show vecino-alert" role="alert">
                    {error}
                    <button type="button" className="btn-close" onClick={() => setError('')}></button>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="row g-4">
                    <div className="col-12">
                      <div className="vecino-form-group">
                        <label htmlFor="nombres" className="form-label vecino-form-label">Nombres</label>
                        <input
                          type="text"
                          className="form-control vecino-form-control"
                          id="nombres"
                          name="nombres"
                          value={userData.nombres}
                          onChange={handleChange}
                          disabled={!editMode}
                        />
                      </div>
                    </div>

                    <div className="col-12">
                      <div className="vecino-form-group">
                        <label htmlFor="apellidos" className="form-label vecino-form-label">Apellidos</label>
                        <input
                          type="text"
                          className="form-control vecino-form-control"
                          id="apellidos"
                          name="apellidos"
                          value={userData.apellidos}
                          onChange={handleChange}
                          disabled={!editMode}
                        />
                      </div>
                    </div>

                    <div className="col-12">
                      <div className="vecino-form-group">
                        <label htmlFor="rut" className="form-label vecino-form-label">RUT</label>
                        <input
                          type="text"
                          className="form-control vecino-form-control"
                          id="rut"
                          name="rut"
                          value={userData.rut}
                          disabled={true}
                        />
                        <span className="text-muted vecino-text-sm mt-2 d-block">El RUT no se puede modificar</span>
                      </div>
                    </div>

                    <div className="col-12">
                      <div className="vecino-form-group">
                        <label htmlFor="telefono" className="form-label vecino-form-label">Teléfono</label>
                        <input
                          type="tel"
                          className="form-control vecino-form-control"
                          id="telefono"
                          name="telefono"
                          value={userData.telefono}
                          onChange={handleChange}
                          disabled={!editMode}
                          placeholder="+56 9 1234 5678"
                        />
                      </div>
                    </div>

                    <div className="col-12">
                      <div className="vecino-form-group">
                        <label htmlFor="email" className="form-label vecino-form-label">Email</label>
                        <input
                          type="email"
                          className="form-control vecino-form-control"
                          id="email"
                          name="email"
                          value={userData.email}
                          onChange={handleChange}
                          disabled={!editMode}
                        />
                      </div>
                    </div>

                    <div className="col-12">
                      <div className="vecino-form-group">
                        <label htmlFor="direccion" className="form-label vecino-form-label">Dirección</label>
                        <textarea
                          className="form-control vecino-form-control"
                          id="direccion"
                          name="direccion"
                          rows="4"
                          value={userData.direccion}
                          onChange={handleChange}
                          disabled={!editMode}
                          placeholder="Ingrese su dirección completa"
                        />
                      </div>
                    </div>
                  </div>

                  {editMode && (
                    <div className="d-flex gap-3 mt-4 vecino-btn-group">
                      <button type="submit" className="btn btn-success vecino-btn" disabled={saving}>
                        {saving ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Guardando...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-check-circle me-2"></i>
                            Guardar Cambios
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary vecino-btn"
                        onClick={() => setEditMode(false)}
                        disabled={saving}
                      >
                        <i className="bi bi-x-circle me-2"></i>
                        Cancelar
                      </button>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
          
          <div className="col-lg-4">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Estado de la Cuenta</h5>
              </div>
              <div className="card-body">
                <div className="status-item">
                  <span className="status-label">Estado:</span>
                  {userProfile?.estado === 'activo' && (
                    <span className="badge bg-success">✓ Activo</span>
                  )}
                  {userProfile?.estado === 'pendiente_aprobacion' && (
                    <span className="badge bg-warning">⏰ Pendiente</span>
                  )}
                  {userProfile?.estado === 'rechazado' && (
                    <span className="badge bg-danger">✗ Rechazado</span>
                  )}
                  {userProfile?.estado === 'inactivo' && (
                    <span className="badge bg-secondary">Inactivo</span>
                  )}
                </div>
                <div className="status-item">
                  <span className="status-label">Rol:</span>
                  {userProfile?.rol === 'vecino' && <span className="badge bg-primary">👤 Vecino</span>}
                  {userProfile?.rol === 'secretaria' && <span className="badge bg-info">📝 Secretaría</span>}
                  {userProfile?.rol === 'admin' && <span className="badge bg-danger">🛡️ Admin</span>}
                </div>
                <div className="status-item">
                  <span className="status-label">Miembro desde:</span>
                  <span>
                    {userProfile?.created_at
                      ? new Date(userProfile.created_at).toLocaleDateString('es-CL', {
                          year: 'numeric',
                          month: 'long'
                        })
                      : 'No disponible'}
                  </span>
                </div>

                <div className="status-item">
                  <span className="status-label">Comprobante:</span>
                  {userProfile?.comprobante_url ? (
                    <button
                      type="button"
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => verComprobante(userProfile.comprobante_url)}
                    >
                      👁️ Ver documento
                    </button>
                  ) : (
                    <span className="text-muted">No disponible</span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="card mt-3">
              <div className="card-header">
                <h5 className="mb-0">Acciones</h5>
              </div>
              <div className="card-body">
                <button className="btn btn-outline-primary w-100 mb-2">
                  Cambiar Contraseña
                </button>
                <button className="btn btn-outline-secondary w-100 mb-2">
                  Descargar Datos
                </button>
                <button className="btn btn-outline-danger w-100">
                  Eliminar Cuenta
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
