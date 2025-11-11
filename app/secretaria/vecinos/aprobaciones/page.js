'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import { enviarCorreoAprobacionRegistro } from '@/lib/emails/sendEmail';

// ====== Utils ======
const DEFAULT_BUCKET = 'documentos';

const isAbsoluteUrl = (u) => { try { new URL(u); return true; } catch { return false; } };
const cleanPath = (p = '') =>
  p.trim().replace(/^\/+/, '').replace(/^documentos\//, '').replace(/\\+/g, '/');

const guessFilename = (fromPathOrUrl = '') => {
  try {
    const u = new URL(fromPathOrUrl);
    const name = u.pathname.split('/').pop() || 'archivo';
    return name.split('?')[0];
  } catch {
    const name = (fromPathOrUrl.split('/').pop() || 'archivo').split('?')[0];
    return name;
  }
};

// ------ Resolver URL (firma si es ruta de storage) ------
async function resolveComprobanteUrl(comprobante_url) {
  if (!comprobante_url) return null;

  if (isAbsoluteUrl(comprobante_url)) return comprobante_url;

  const supabase = createClient();
  const objectPath = cleanPath(comprobante_url); // ej: "comprobantes/archivo.pdf"
  const { data, error } = await supabase
    .storage
    .from(DEFAULT_BUCKET)
    .createSignedUrl(objectPath, 300); // 5 min

  if (error || !data?.signedUrl) {
    console.error('Error firmando URL:', error);
    return null;
  }
  return data.signedUrl;
}

// ------ Ver: solo abrir en pestaña nueva, sin descargar ------
async function verComprobante(comprobante_url) {
  const finalUrl = await resolveComprobanteUrl(comprobante_url);
  if (!finalUrl) {
    alert('No se pudo abrir el comprobante');
    return;
  }
  window.open(finalUrl, '_blank', 'noopener,noreferrer');
}

// ------ Descargar: solo descarga, no abre pestaña ------
async function descargarComprobante(comprobante_url) {
  const finalUrl = await resolveComprobanteUrl(comprobante_url);
  if (!finalUrl) {
    alert('No se pudo descargar el comprobante');
    return;
  }

  try {
    const resp = await fetch(finalUrl, { credentials: 'omit', cache: 'no-store' });
    if (!resp.ok) throw new Error('HTTP ' + resp.status);
    const blob = await resp.blob();
    const tmpUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = tmpUrl;
    a.download = guessFilename(finalUrl);
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(tmpUrl);
  } catch (e) {
    console.error('Fallo descarga directa, usando fallback:', e);
    const a = document.createElement('a');
    a.href = finalUrl;
    a.setAttribute('download', guessFilename(finalUrl));
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
}

export default function AprobacionesPage() {
  const { user, userProfile } = useAuth();
  const [vecinosPendientes, setVecinosPendientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [vecinoSeleccionado, setVecinoSeleccionado] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);

  useEffect(() => {
    if (user && userProfile?.rol === 'secretaria') {
      fetchVecinosPendientes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, userProfile]);

  const fetchVecinosPendientes = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const supabase = createClient();

      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('estado', 'pendiente_aprobacion')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setVecinosPendientes(data || []);
    } catch (err) {
      console.error(err);
      setErrorMsg(`Error al cargar los vecinos pendientes: ${err.message || err.toString()}`);
    } finally {
      setLoading(false);
    }
  };

  const formatearFecha = (fecha) =>
    new Date(fecha).toLocaleDateString('es-CL', {
      year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
    });

  const aprobarVecino = async (vecinoId) => {
    if (!confirm('¿Estás segura de aprobar este vecino?')) return;

    try {
      const supabase = createClient();
      const vecinoAprobar = vecinosPendientes.find(v => v.id === vecinoId);
      if (!vecinoAprobar) {
        alert('No se encontró el vecino');
        return;
      }

      const { error } = await supabase
        .from('usuarios')
        .update({ estado: 'activo' })
        .eq('id', vecinoId);

      if (error) throw error;

      try {
        await enviarCorreoAprobacionRegistro(
          vecinoAprobar.email,
          `${vecinoAprobar.nombres} ${vecinoAprobar.apellidos}`
        );
      } catch (emailError) {
        console.error('Error al enviar correo (aprobado igual):', emailError);
      }

      setVecinosPendientes(prev => prev.filter(v => v.id !== vecinoId));
      alert('Vecino aprobado exitosamente. Se ha enviado un correo de confirmación.');
    } catch (err) {
      console.error(err);
      alert('Error al aprobar vecino');
    }
  };

  const rechazarVecino = async (vecinoId) => {
    if (!confirm('¿Estás segura de rechazar este vecino?')) return;

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('usuarios')
        .update({ estado: 'rechazado' })
        .eq('id', vecinoId);

      if (error) throw error;

      setVecinosPendientes(prev => prev.filter(v => v.id !== vecinoId));
      alert('Vecino rechazado');
    } catch (err) {
      console.error(err);
      alert('Error al rechazar vecino');
    }
  };

  const vecinosFiltrados = vecinosPendientes.filter(vecino => {
    const t = busqueda.toLowerCase();
    return (
      vecino.nombres?.toLowerCase().includes(t) ||
      vecino.apellidos?.toLowerCase().includes(t) ||
      vecino.rut?.toLowerCase().includes(t) ||
      vecino.email?.toLowerCase().includes(t) ||
      vecino.direccion?.toLowerCase().includes(t)
    );
  });

  if (loading) {
    return (
      <div className="page-container">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 400 }}>
          <div className="text-center">
            <div className="spinner-border mb-3" role="status"></div>
            <p>Cargando vecinos pendientes...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1><i className="bi bi-person-check me-2"></i>Aprobación de Vecinos</h1>
            <p className="text-muted">Revisa y aprueba las solicitudes de inscripción de nuevos vecinos</p>
          </div>
          <button className="btn btn-outline-primary" onClick={fetchVecinosPendientes} disabled={loading}>
            🔄 Actualizar
          </button>
        </div>
      </div>

      <div className="solicitudes-content">
        {errorMsg && (
          <div className="alert alert-danger mb-4">
            <strong>Error:</strong> {errorMsg}
            <button className="btn btn-sm btn-outline-danger ms-2" onClick={fetchVecinosPendientes}>
              Reintentar
            </button>
          </div>
        )}

        <div className="card mb-4" style={{ background: '#f0f9fa', border: '1px solid #439fa4' }}>
          <div className="card-body text-center">
            <h3 className="mb-0" style={{ color: '#154765', fontSize: '2.5rem', fontWeight: 'bold' }}>
              {vecinosPendientes.length}
            </h3>
            <p className="mb-0" style={{ color: '#439fa4', fontWeight: 600 }}>
              {vecinosPendientes.length === 1 ? 'Vecino pendiente de aprobación' : 'Vecinos pendientes de aprobación'}
            </p>
          </div>
        </div>

        {vecinosPendientes.length > 0 && (
          <div className="card mb-4">
            <div className="card-body">
              <div className="row">
                <div className="col-md-8">
                  <label htmlFor="busqueda" className="form-label">Buscar vecino:</label>
                  <input
                    type="text"
                    id="busqueda"
                    className="form-control"
                    placeholder="Nombre, RUT, email, dirección..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                  />
                </div>
                <div className="col-md-4 d-flex align-items-end">
                  <button className="btn btn-secondary w-100" onClick={() => setBusqueda('')}>
                    Limpiar Búsqueda
                  </button>
                </div>
              </div>
              {busqueda && (
                <div className="text-end mt-2">
                  <span className="text-muted">
                    Mostrando {vecinosFiltrados.length} de {vecinosPendientes.length} vecinos
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="card">
          <div className="card-header" style={{ background: '#439fa4', color: 'white' }}>
            <h5 className="mb-0">📋 Vecinos Pendientes de Aprobación</h5>
          </div>
          <div className="card-body">
            {vecinosFiltrados.length === 0 ? (
              <div className="empty-state text-center py-5">
                <div className="empty-icon mb-3" style={{ fontSize: '3rem' }}>
                  {busqueda ? '🔍' : '✅'}
                </div>
                <h5>{busqueda ? 'No se encontraron resultados' : 'No hay vecinos pendientes'}</h5>
                <p className="text-muted">
                  {busqueda
                    ? 'No se encontraron vecinos pendientes con los criterios de búsqueda'
                    : '¡Excelente! Todas las solicitudes han sido procesadas'}
                </p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Nombre Completo</th>
                      <th>RUT</th>
                      <th>Email</th>
                      <th>Dirección</th>
                      <th>Teléfono</th>
                      <th>Fecha de Registro</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vecinosFiltrados.map((vecino) => (
                      <tr key={vecino.id}>
                        <td><div className="fw-medium">{vecino.nombres} {vecino.apellidos}</div></td>
                        <td><code>{vecino.rut}</code></td>
                        <td><small>{vecino.email}</small></td>
                        <td><small>{vecino.direccion}</small></td>
                        <td><small>{vecino.telefono}</small></td>
                        <td><small>{formatearFecha(vecino.created_at)}</small></td>
                        <td>
                          <div className="btn-group btn-group-sm">
                            <button
                              className="btn btn-outline-primary"
                              onClick={() => { setVecinoSeleccionado(vecino); setMostrarModal(true); }}
                              title="Ver detalles"
                            >
                              👁️ Ver
                            </button>

                            {/* (Sin botón extra aquí) */}

                            <button
                              className="btn btn-outline-success"
                              onClick={() => aprobarVecino(vecino.id)}
                              title="Aprobar vecino"
                            >
                              ✅ Aprobar
                            </button>
                            <button
                              className="btn btn-outline-danger"
                              onClick={() => rechazarVecino(vecino.id)}
                              title="Rechazar vecino"
                            >
                              ❌ Rechazar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Detalles */}
      {mostrarModal && vecinoSeleccionado && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setMostrarModal(false)}>
          <div className="modal-dialog modal-lg modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Detalles del Vecino Pendiente</h5>
                <button type="button" className="btn-close" onClick={() => setMostrarModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h4 className="mb-0">{vecinoSeleccionado.nombres} {vecinoSeleccionado.apellidos}</h4>
                    <span className="badge bg-warning text-dark fs-6">⏰ Pendiente de Aprobación</span>
                  </div>
                  <hr />
                </div>

                <div className="mb-4">
                  <h6 className="mb-3">👤 Información Personal</h6>
                  <div className="row">
                    <div className="col-md-6">
                      <p className="mb-2"><strong>Nombres:</strong><br /><span className="text-muted">{vecinoSeleccionado.nombres}</span></p>
                      <p className="mb-2"><strong>Apellidos:</strong><br /><span className="text-muted">{vecinoSeleccionado.apellidos}</span></p>
                      <p className="mb-2"><strong>RUT:</strong><br /><code>{vecinoSeleccionado.rut}</code></p>
                    </div>
                    <div className="col-md-6">
                      <p className="mb-2"><strong>Email:</strong><br /><span className="text-muted">{vecinoSeleccionado.email}</span></p>
                      <p className="mb-2"><strong>Teléfono:</strong><br /><span className="text-muted">{vecinoSeleccionado.telefono}</span></p>
                      <p className="mb-2"><strong>Dirección:</strong><br /><span className="text-muted">{vecinoSeleccionado.direccion}</span></p>
                    </div>
                  </div>
                  <hr />
                </div>

                <div className="mb-4">
                  <h6 className="mb-3">📅 Información de Registro</h6>
                  <div className="row">
                    <div className="col-md-6">
                      <p className="mb-2"><strong>Fecha de Registro:</strong><br /><span className="text-muted">{formatearFecha(vecinoSeleccionado.created_at)}</span></p>
                    </div>
                    <div className="col-md-6">
                      <p className="mb-2"><strong>Última Actualización:</strong><br /><span className="text-muted">{formatearFecha(vecinoSeleccionado.updated_at)}</span></p>
                    </div>
                  </div>
                  <hr />
                </div>

                {/* Botones separados: Ver / Descargar */}
                {vecinoSeleccionado.comprobante_url && (
                  <div className="mb-3">
                    <h6 className="mb-3">📄 Comprobante de Residencia</h6>
                    <div className="d-flex gap-2">
                      <button
                        type="button"
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => verComprobante(vecinoSeleccionado.comprobante_url)}
                      >
                        👁️ Ver
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => descargarComprobante(vecinoSeleccionado.comprobante_url)}
                      >
                        ⬇️ Descargar
                      </button>
                    </div>
                  </div>
                )}

                <div className="mb-3">
                  <h6 className="mb-3">ℹ️ Información del Sistema</h6>
                  <p className="mb-2"><strong>ID de Usuario:</strong><br /><code>{vecinoSeleccionado.id}</code></p>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-success" onClick={() => { aprobarVecino(vecinoSeleccionado.id); setMostrarModal(false); }}>
                  ✅ Aprobar Vecino
                </button>
                <button className="btn btn-danger" onClick={() => { rechazarVecino(vecinoSeleccionado.id); setMostrarModal(false); }}>
                  ❌ Rechazar Vecino
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setMostrarModal(false)}>Cerrar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .page-container { padding: 2rem; max-width: 1400px; margin: 0 auto; }
        .page-header { margin-bottom: 2rem; }
        .page-header h1 { color: #154765; font-size: 2rem; font-weight: bold; margin-bottom: .5rem; }
        .empty-state { color: #6c757d; }
        .empty-icon { opacity: .5; }
        .table { margin-bottom: 0; }
        .table thead { background: #f8f9fa; }
        .btn-group-sm .btn { font-size: .875rem; padding: .25rem .5rem; }
        .modal.show { display: block; }
      `}</style>
    </div>
  );
}
