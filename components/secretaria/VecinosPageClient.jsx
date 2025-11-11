'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import { enviarCorreoAprobacionRegistro } from '@/lib/emails/sendEmail';
import MapaGeneral from '@/components/maps/MapaGeneral';
import MapaDetalle from '@/components/maps/MapaDetalle';

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
  if (typeof window === 'undefined') return;
  const finalUrl = await resolveComprobanteUrl(comprobante_url);
  if (!finalUrl) {
    alert('No se pudo abrir el comprobante');
    return;
  }
  window.open(finalUrl, '_blank', 'noopener,noreferrer'); // solo ver
}

// ------ Descargar: solo descarga, no abre pestaña ------
async function descargarComprobante(comprobante_url) {
  if (typeof window === 'undefined') return;
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

export default function SecretariaVecinosPage() {
  const { user, userProfile } = useAuth();
  const [vecinos, setVecinos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroRol, setFiltroRol] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [vecinoSeleccionado, setVecinoSeleccionado] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [vistaActual, setVistaActual] = useState('tabla'); // 'tabla' | 'mapa'

  useEffect(() => {
    if (user && userProfile?.rol === 'secretaria') {
      fetchVecinos();
    }
  }, [user, userProfile]);

  const fetchVecinos = async () => {
    try {
      setLoading(true);
      setError('');
      const supabase = createClient();

      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVecinos(data || []);
    } catch (error) {
      console.error(error);
      setError(`Error al cargar los vecinos: ${error.message || error.toString()}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCoordenadasActualizadas = (vecinoId, lat, lng) => {
    setVecinos(prev =>
      prev.map(v =>
        v.id === vecinoId
          ? { ...v, latitude: lat, longitude: lng, geocoded_at: new Date().toISOString() }
          : v
      )
    );
    if (vecinoSeleccionado?.id === vecinoId) {
      setVecinoSeleccionado(prev => ({
        ...prev,
        latitude: lat,
        longitude: lng,
        geocoded_at: new Date().toISOString()
      }));
    }
  };

  const handleVerDetallesDesdeMapa = (vecino) => {
    setVecinoSeleccionado(vecino);
    setMostrarModal(true);
  };

  const getEstadoBadge = (estado) => {
    switch (estado) {
      case 'activo': return 'bg-success';
      case 'pendiente_aprobacion': return 'bg-warning text-dark';
      case 'rechazado': return 'bg-danger';
      case 'inactivo': return 'bg-secondary';
      default: return 'bg-secondary';
    }
  };
  const getEstadoTexto = (estado) => {
    switch (estado) {
      case 'activo': return 'Activo';
      case 'pendiente_aprobacion': return 'Pendiente Aprobación';
      case 'rechazado': return 'Rechazado';
      case 'inactivo': return 'Inactivo';
      default: return estado;
    }
  };
  const getRolBadge = (rol) => {
    switch (rol) {
      case 'admin': return 'bg-danger';
      case 'secretaria': return 'bg-primary';
      case 'vecino': return 'bg-info';
      default: return 'bg-secondary';
    }
  };
  const getRolTexto = (rol) => {
    switch (rol) {
      case 'admin': return 'Administrador';
      case 'secretaria': return 'Secretaría';
      case 'vecino': return 'Vecino';
      default: return rol;
    }
  };

  const formatearFecha = (fecha) =>
    new Date(fecha).toLocaleDateString('es-CL', { year: 'numeric', month: '2-digit', day: '2-digit' });

  const aprobarVecino = async (vecinoId) => {
    if (!confirm('¿Estás segura de aprobar este vecino?')) return;
    try {
      const supabase = createClient();
      const vecinoAprobar = vecinos.find(v => v.id === vecinoId);
      if (!vecinoAprobar) { alert('No se encontró el vecino'); return; }

      const { error } = await supabase.from('usuarios').update({ estado: 'activo' }).eq('id', vecinoId);
      if (error) throw error;

      try {
        await enviarCorreoAprobacionRegistro(
          vecinoAprobar.email,
          `${vecinoAprobar.nombres} ${vecinoAprobar.apellidos}`
        );
      } catch (emailError) {
        console.error('Error email (aprobado igual):', emailError);
      }

      setVecinos(prev => prev.map(v => v.id === vecinoId ? { ...v, estado: 'activo' } : v));
      alert('Vecino aprobado exitosamente. Se ha enviado un correo de confirmación.');
    } catch (error) {
      console.error(error);
      alert('Error al aprobar vecino');
    }
  };

  const rechazarVecino = async (vecinoId) => {
    if (!confirm('¿Estás segura de rechazar este vecino?')) return;
    try {
      const supabase = createClient();
      const { error } = await supabase.from('usuarios').update({ estado: 'rechazado' }).eq('id', vecinoId);
      if (error) throw error;
      setVecinos(prev => prev.map(v => v.id === vecinoId ? { ...v, estado: 'rechazado' } : v));
      alert('Vecino rechazado');
    } catch (error) {
      console.error(error);
      alert('Error al rechazar vecino');
    }
  };

  // Filtros
  const vecinosFiltrados = vecinos.filter(vecino => {
    if (filtroEstado !== 'todos' && vecino.estado !== filtroEstado) return false;
    if (filtroRol !== 'todos' && vecino.rol !== filtroRol) return false;
    if (busqueda) {
      const t = busqueda.toLowerCase();
      return (
        vecino.nombres?.toLowerCase().includes(t) ||
        vecino.apellidos?.toLowerCase().includes(t) ||
        vecino.rut?.toLowerCase().includes(t) ||
        vecino.email?.toLowerCase().includes(t) ||
        vecino.direccion?.toLowerCase().includes(t)
      );
    }
    return true;
  });

  const stats = {
    total: vecinos.length,
    activos: vecinos.filter(v => v.estado === 'activo').length,
    pendientes: vecinos.filter(v => v.estado === 'pendiente_aprobacion').length,
    rechazados: vecinos.filter(v => v.estado === 'rechazado').length,
    totalVecinos: vecinos.filter(v => v.rol === 'vecino').length,
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 400 }}>
          <div className="text-center">
            <div className="spinner-border mb-3" role="status"></div>
            <p>Cargando vecinos...</p>
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
            <h1>Gestión de Vecinos</h1>
            <p className="text-muted">Administrar vecinos registrados en la plataforma</p>
          </div>
          <button className="btn btn-outline-primary" onClick={fetchVecinos} disabled={loading}>
            🔄 Actualizar
          </button>
        </div>
      </div>

      <div className="solicitudes-content">
        {error && (
          <div className="alert alert-danger mb-4">
            <strong>Error:</strong> {error}
            <button className="btn btn-sm btn-outline-danger ms-2" onClick={fetchVecinos}>Reintentar</button>
          </div>
        )}

        {/* Stats */}
        <div className="row mb-4">
          <div className="col-md-2"><div className="stat-card text-center"><div className="stat-number">{stats.total}</div><div className="stat-label">Total Usuarios</div></div></div>
          <div className="col-md-2"><div className="stat-card text-center"><div className="stat-number text-info">{stats.totalVecinos}</div><div className="stat-label">Vecinos</div></div></div>
          <div className="col-md-2"><div className="stat-card text-center"><div className="stat-number text-success">{stats.activos}</div><div className="stat-label">Activos</div></div></div>
          <div className="col-md-2"><div className="stat-card text-center"><div className="stat-number text-warning">{stats.pendientes}</div><div className="stat-label">Pendientes</div></div></div>
          <div className="col-md-2"><div className="stat-card text-center"><div className="stat-number text-danger">{stats.rechazados}</div><div className="stat-label">Rechazados</div></div></div>
        </div>

        {/* Toggle vista */}
        <div className="mb-4">
          <div className="btn-group w-100" role="group">
            <button type="button" className={`btn ${vistaActual === 'tabla' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setVistaActual('tabla')}>Vista de Tabla</button>
            <button type="button" className={`btn ${vistaActual === 'mapa' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setVistaActual('mapa')}>Vista de Mapa</button>
          </div>
        </div>

        {/* Filtros */}
        <div className="card mb-4">
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-4">
                <label htmlFor="busqueda" className="form-label">Buscar vecino:</label>
                <input type="text" id="busqueda" className="form-control" placeholder="Nombre, RUT, email, dirección..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
              </div>
              <div className="col-md-3">
                <label htmlFor="filtroEstado" className="form-label">Estado:</label>
                <select id="filtroEstado" className="form-select" value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
                  <option value="todos">Todos los estados</option>
                  <option value="activo">Activos</option>
                  <option value="pendiente_aprobacion">Pendientes</option>
                  <option value="rechazado">Rechazados</option>
                  <option value="inactivo">Inactivos</option>
                </select>
              </div>
              <div className="col-md-3">
                <label htmlFor="filtroRol" className="form-label">Rol:</label>
                <select id="filtroRol" className="form-select" value={filtroRol} onChange={(e) => setFiltroRol(e.target.value)}>
                  <option value="todos">Todos los roles</option>
                  <option value="vecino">Vecinos</option>
                  <option value="secretaria">Secretaría</option>
                  <option value="admin">Administradores</option>
                </select>
              </div>
              <div className="col-md-2 d-flex align-items-end">
                <button className="btn btn-secondary w-100" onClick={() => { setBusqueda(''); setFiltroEstado('todos'); setFiltroRol('todos'); }}>
                  Limpiar Filtros
                </button>
              </div>
            </div>
            <div className="text-end mt-2">
              <span className="text-muted">Mostrando {vecinosFiltrados.length} de {vecinos.length} vecinos</span>
            </div>
          </div>
        </div>

        {/* Tabla */}
        {vistaActual === 'tabla' && (
          <div className="card">
            <div className="card-header"><h5 className="mb-0">Lista de Vecinos</h5></div>
            <div className="card-body">
              {vecinosFiltrados.length === 0 ? (
                <div className="empty-state text-center py-5">
                  <div className="empty-icon mb-3" style={{ fontSize: '3rem' }}>👥</div>
                  <h5>No hay vecinos</h5>
                  <p className="text-muted">{busqueda || filtroEstado !== 'todos' || filtroRol !== 'todos' ? 'No se encontraron vecinos con los filtros aplicados' : 'No se han encontrado vecinos registrados'}</p>
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
                        <th>Rol</th>
                        <th>Estado</th>
                        <th>Registro</th>
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
                          <td><span className={`badge ${getRolBadge(vecino.rol)}`}>{getRolTexto(vecino.rol)}</span></td>
                          <td><span className={`badge ${getEstadoBadge(vecino.estado)}`}>{getEstadoTexto(vecino.estado)}</span></td>
                          <td><small>{formatearFecha(vecino.created_at)}</small></td>
                          <td>
                            <div className="btn-group btn-group-sm">
                              <button
                                className="btn btn-outline-primary"
                                onClick={() => { setVecinoSeleccionado(vecino); setMostrarModal(true); }}
                              >
                                👁️ Ver
                              </button>

                              {/* ⛔️ No hay botón de comprobante aquí (solo en el modal) */}

                              {vecino.estado === 'pendiente_aprobacion' && (
                                <>
                                  <button className="btn btn-outline-success" onClick={() => aprobarVecino(vecino.id)}>✅ Aprobar</button>
                                  <button className="btn btn-outline-danger" onClick={() => rechazarVecino(vecino.id)}>❌ Rechazar</button>
                                </>
                              )}
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
        )}

        {/* Mapa */}
        {vistaActual === 'mapa' && (
          <div className="card">
            <div className="card-header"><h5 className="mb-0"><i className="bi bi-map me-2"></i>Mapa de Vecinos</h5></div>
            <div className="card-body">
              <MapaGeneral vecinos={vecinosFiltrados} onVerDetalles={handleVerDetallesDesdeMapa} />
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {mostrarModal && vecinoSeleccionado && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setMostrarModal(false)}>
          <div className="modal-dialog modal-lg modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Detalles de Vecino</h5>
                <button type="button" className="btn-close" onClick={() => setMostrarModal(false)}></button>
              </div>
              <div className="modal-body">
                {/* Estado y Rol */}
                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="mb-0">Estado y Rol</h6>
                    <div>
                      <span className={`badge ${getRolBadge(vecinoSeleccionado.rol)} me-2 fs-6`}>{getRolTexto(vecinoSeleccionado.rol)}</span>
                      <span className={`badge ${getEstadoBadge(vecinoSeleccionado.estado)} fs-6`}>{getEstadoTexto(vecinoSeleccionado.estado)}</span>
                    </div>
                  </div>
                  <hr />
                </div>

                {/* Info personal */}
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

                {/* Fechas */}
                <div className="mb-4">
                  <h6 className="mb-3">📅 Fechas</h6>
                  <div className="row">
                    <div className="col-md-6"><p className="mb-2"><strong>Fecha de Registro:</strong><br /><span className="text-muted">{formatearFecha(vecinoSeleccionado.created_at)}</span></p></div>
                    <div className="col-md-6"><p className="mb-2"><strong>Última Actualización:</strong><br /><span className="text-muted">{formatearFecha(vecinoSeleccionado.updated_at)}</span></p></div>
                  </div>
                  <hr />
                </div>

                {/* Comprobante: ahora dos botones (ver / descargar) */}
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

                {/* ID + mapa */}
                <div className="mb-4">
                  <h6 className="mb-3">ℹ️ Información del Sistema</h6>
                  <p className="mb-2"><strong>ID de Usuario:</strong><br /><code>{vecinoSeleccionado.id}</code></p>
                  <hr />
                </div>

                <div className="mb-3">
                  <MapaDetalle vecino={vecinoSeleccionado} onCoordenadasActualizadas={handleCoordenadasActualizadas} />
                </div>
              </div>
              <div className="modal-footer">
                {vecinoSeleccionado.estado === 'pendiente_aprobacion' && (
                  <>
                    <button className="btn btn-success" onClick={() => { aprobarVecino(vecinoSeleccionado.id); setMostrarModal(false); }}>✅ Aprobar Vecino</button>
                    <button className="btn btn-danger" onClick={() => { rechazarVecino(vecinoSeleccionado.id); setMostrarModal(false); }}>❌ Rechazar Vecino</button>
                  </>
                )}
                <button type="button" className="btn btn-secondary" onClick={() => setMostrarModal(false)}>Cerrar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
