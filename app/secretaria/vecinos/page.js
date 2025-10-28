'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import { enviarCorreoAprobacionRegistro } from '@/lib/emails/sendEmail';

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

      console.log('🔍 Cargando vecinos...');

      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error de Supabase:', error);
        throw error;
      }

      console.log('✅ Vecinos cargados:', data?.length || 0);
      setVecinos(data || []);
    } catch (error) {
      console.error('❌ Error completo:', error);
      setError(`Error al cargar los vecinos: ${error.message || error.toString()}`);
    } finally {
      setLoading(false);
    }
  };

  const getEstadoBadge = (estado) => {
    switch (estado) {
      case 'activo':
        return 'bg-success';
      case 'pendiente_aprobacion':
        return 'bg-warning text-dark';
      case 'rechazado':
        return 'bg-danger';
      case 'inactivo':
        return 'bg-secondary';
      default:
        return 'bg-secondary';
    }
  };

  const getEstadoTexto = (estado) => {
    switch (estado) {
      case 'activo':
        return 'Activo';
      case 'pendiente_aprobacion':
        return 'Pendiente Aprobación';
      case 'rechazado':
        return 'Rechazado';
      case 'inactivo':
        return 'Inactivo';
      default:
        return estado;
    }
  };

  const getRolBadge = (rol) => {
    switch (rol) {
      case 'admin':
        return 'bg-danger';
      case 'secretaria':
        return 'bg-primary';
      case 'vecino':
        return 'bg-info';
      default:
        return 'bg-secondary';
    }
  };

  const getRolTexto = (rol) => {
    switch (rol) {
      case 'admin':
        return 'Administrador';
      case 'secretaria':
        return 'Secretaría';
      case 'vecino':
        return 'Vecino';
      default:
        return rol;
    }
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const aprobarVecino = async (vecinoId) => {
    if (!confirm('¿Estás segura de aprobar este vecino?')) return;

    try {
      const supabase = createClient();
      
      // Obtener datos del vecino antes de aprobar
      const vecinoAprobar = vecinos.find(v => v.id === vecinoId);
      
      if (!vecinoAprobar) {
        alert('No se encontró el vecino');
        return;
      }

      // Aprobar vecino en la base de datos
      const { error } = await supabase
        .from('usuarios')
        .update({ estado: 'activo' })
        .eq('id', vecinoId);

      if (error) throw error;

      // Enviar correo de aprobación
      try {
        await enviarCorreoAprobacionRegistro(
          vecinoAprobar.email,
          `${vecinoAprobar.nombres} ${vecinoAprobar.apellidos}`
        );
        console.log('✅ Correo de aprobación enviado a:', vecinoAprobar.email);
      } catch (emailError) {
        console.error('⚠️ Error al enviar correo (el vecino fue aprobado):', emailError);
        // No interrumpimos el flujo si falla el email
      }

      // Actualizar la lista local
      setVecinos(prev =>
        prev.map(v => v.id === vecinoId ? { ...v, estado: 'activo' } : v)
      );

      alert('Vecino aprobado exitosamente. Se ha enviado un correo de confirmación.');
    } catch (error) {
      console.error('Error aprobando vecino:', error);
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

      // Actualizar la lista local
      setVecinos(prev =>
        prev.map(v => v.id === vecinoId ? { ...v, estado: 'rechazado' } : v)
      );

      alert('Vecino rechazado');
    } catch (error) {
      console.error('Error rechazando vecino:', error);
      alert('Error al rechazar vecino');
    }
  };

  // Filtrar vecinos
  const vecinosFiltrados = vecinos.filter(vecino => {
    // Filtro por estado
    if (filtroEstado !== 'todos' && vecino.estado !== filtroEstado) return false;

    // Filtro por rol
    if (filtroRol !== 'todos' && vecino.rol !== filtroRol) return false;

    // Búsqueda por texto
    if (busqueda) {
      const searchTerm = busqueda.toLowerCase();
      return (
        vecino.nombres?.toLowerCase().includes(searchTerm) ||
        vecino.apellidos?.toLowerCase().includes(searchTerm) ||
        vecino.rut?.toLowerCase().includes(searchTerm) ||
        vecino.email?.toLowerCase().includes(searchTerm) ||
        vecino.direccion?.toLowerCase().includes(searchTerm)
      );
    }

    return true;
  });

  const getResumenEstadisticas = () => {
    const total = vecinos.length;
    const activos = vecinos.filter(v => v.estado === 'activo').length;
    const pendientes = vecinos.filter(v => v.estado === 'pendiente_aprobacion').length;
    const rechazados = vecinos.filter(v => v.estado === 'rechazado').length;
    const totalVecinos = vecinos.filter(v => v.rol === 'vecino').length;

    return { total, activos, pendientes, rechazados, totalVecinos };
  };

  const stats = getResumenEstadisticas();

  if (loading) {
    return (
      <div className="page-container">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
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
          <button
            className="btn btn-outline-primary"
            onClick={fetchVecinos}
            disabled={loading}
          >
            🔄 Actualizar
          </button>
        </div>
      </div>

      <div className="solicitudes-content">
        {/* Mostrar error si existe */}
        {error && (
          <div className="alert alert-danger mb-4">
            <strong>Error:</strong> {error}
            <button
              className="btn btn-sm btn-outline-danger ms-2"
              onClick={fetchVecinos}
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Resumen de estadísticas */}
        <div className="row mb-4">
          <div className="col-md-2">
            <div className="stat-card text-center">
              <div className="stat-number">{stats.total}</div>
              <div className="stat-label">Total Usuarios</div>
            </div>
          </div>
          <div className="col-md-2">
            <div className="stat-card text-center">
              <div className="stat-number text-info">{stats.totalVecinos}</div>
              <div className="stat-label">Vecinos</div>
            </div>
          </div>
          <div className="col-md-2">
            <div className="stat-card text-center">
              <div className="stat-number text-success">{stats.activos}</div>
              <div className="stat-label">Activos</div>
            </div>
          </div>
          <div className="col-md-2">
            <div className="stat-card text-center">
              <div className="stat-number text-warning">{stats.pendientes}</div>
              <div className="stat-label">Pendientes</div>
            </div>
          </div>
          <div className="col-md-2">
            <div className="stat-card text-center">
              <div className="stat-number text-danger">{stats.rechazados}</div>
              <div className="stat-label">Rechazados</div>
            </div>
          </div>
        </div>

        {/* Filtros y búsqueda */}
        <div className="card mb-4">
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-4">
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
              <div className="col-md-3">
                <label htmlFor="filtroEstado" className="form-label">Estado:</label>
                <select
                  id="filtroEstado"
                  className="form-select"
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                >
                  <option value="todos">Todos los estados</option>
                  <option value="activo">Activos</option>
                  <option value="pendiente_aprobacion">Pendientes</option>
                  <option value="rechazado">Rechazados</option>
                  <option value="inactivo">Inactivos</option>
                </select>
              </div>
              <div className="col-md-3">
                <label htmlFor="filtroRol" className="form-label">Rol:</label>
                <select
                  id="filtroRol"
                  className="form-select"
                  value={filtroRol}
                  onChange={(e) => setFiltroRol(e.target.value)}
                >
                  <option value="todos">Todos los roles</option>
                  <option value="vecino">Vecinos</option>
                  <option value="secretaria">Secretaría</option>
                  <option value="admin">Administradores</option>
                </select>
              </div>
              <div className="col-md-2 d-flex align-items-end">
                <button
                  className="btn btn-secondary w-100"
                  onClick={() => {
                    setBusqueda('');
                    setFiltroEstado('todos');
                    setFiltroRol('todos');
                  }}
                >
                  Limpiar Filtros
                </button>
              </div>
            </div>
            <div className="text-end mt-2">
              <span className="text-muted">
                Mostrando {vecinosFiltrados.length} de {vecinos.length} vecinos
              </span>
            </div>
          </div>
        </div>

        {/* Lista de vecinos */}
        <div className="card">
          <div className="card-header">
            <h5 className="mb-0">Lista de Vecinos</h5>
          </div>
          <div className="card-body">
            {vecinosFiltrados.length === 0 ? (
              <div className="empty-state text-center py-5">
                <div className="empty-icon mb-3" style={{ fontSize: '3rem' }}>👥</div>
                <h5>No hay vecinos</h5>
                <p className="text-muted">
                  {busqueda || filtroEstado !== 'todos' || filtroRol !== 'todos'
                    ? 'No se encontraron vecinos con los filtros aplicados'
                    : 'No se han encontrado vecinos registrados'
                  }
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
                      <th>Rol</th>
                      <th>Estado</th>
                      <th>Registro</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vecinosFiltrados.map((vecino) => (
                      <tr key={vecino.id}>
                        <td>
                          <div className="fw-medium">
                            {vecino.nombres} {vecino.apellidos}
                          </div>
                        </td>
                        <td>
                          <code>{vecino.rut}</code>
                        </td>
                        <td>
                          <small>{vecino.email}</small>
                        </td>
                        <td>
                          <small>{vecino.direccion}</small>
                        </td>
                        <td>
                          <span className={`badge ${getRolBadge(vecino.rol)}`}>
                            {getRolTexto(vecino.rol)}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${getEstadoBadge(vecino.estado)}`}>
                            {getEstadoTexto(vecino.estado)}
                          </span>
                        </td>
                        <td>
                          <small>{formatearFecha(vecino.created_at)}</small>
                        </td>
                        <td>
                          <div className="btn-group btn-group-sm">
                            <button
                              className="btn btn-outline-primary"
                              onClick={() => {
                                setVecinoSeleccionado(vecino);
                                setMostrarModal(true);
                              }}
                            >
                              👁️ Ver
                            </button>
                            {vecino.estado === 'pendiente_aprobacion' && (
                              <>
                                <button
                                  className="btn btn-outline-success"
                                  onClick={() => aprobarVecino(vecino.id)}
                                >
                                  ✅ Aprobar
                                </button>
                                <button
                                  className="btn btn-outline-danger"
                                  onClick={() => rechazarVecino(vecino.id)}
                                >
                                  ❌ Rechazar
                                </button>
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
      </div>

      {/* Modal de Detalles */}
      {mostrarModal && vecinoSeleccionado && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setMostrarModal(false)}>
          <div className="modal-dialog modal-lg modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  Detalles de Vecino
                </h5>
                <button type="button" className="btn-close" onClick={() => setMostrarModal(false)}></button>
              </div>
              <div className="modal-body">
                {/* Estado y Rol */}
                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="mb-0">Estado y Rol</h6>
                    <div>
                      <span className={`badge ${getRolBadge(vecinoSeleccionado.rol)} me-2 fs-6`}>
                        {getRolTexto(vecinoSeleccionado.rol)}
                      </span>
                      <span className={`badge ${getEstadoBadge(vecinoSeleccionado.estado)} fs-6`}>
                        {getEstadoTexto(vecinoSeleccionado.estado)}
                      </span>
                    </div>
                  </div>
                  <hr />
                </div>

                {/* Información Personal */}
                <div className="mb-4">
                  <h6 className="mb-3">👤 Información Personal</h6>
                  <div className="row">
                    <div className="col-md-6">
                      <p className="mb-2">
                        <strong>Nombres:</strong><br />
                        <span className="text-muted">{vecinoSeleccionado.nombres}</span>
                      </p>
                      <p className="mb-2">
                        <strong>Apellidos:</strong><br />
                        <span className="text-muted">{vecinoSeleccionado.apellidos}</span>
                      </p>
                      <p className="mb-2">
                        <strong>RUT:</strong><br />
                        <code>{vecinoSeleccionado.rut}</code>
                      </p>
                    </div>
                    <div className="col-md-6">
                      <p className="mb-2">
                        <strong>Email:</strong><br />
                        <span className="text-muted">{vecinoSeleccionado.email}</span>
                      </p>
                      <p className="mb-2">
                        <strong>Teléfono:</strong><br />
                        <span className="text-muted">{vecinoSeleccionado.telefono}</span>
                      </p>
                      <p className="mb-2">
                        <strong>Dirección:</strong><br />
                        <span className="text-muted">{vecinoSeleccionado.direccion}</span>
                      </p>
                    </div>
                  </div>
                  <hr />
                </div>

                {/* Fechas */}
                <div className="mb-4">
                  <h6 className="mb-3">📅 Fechas</h6>
                  <div className="row">
                    <div className="col-md-6">
                      <p className="mb-2">
                        <strong>Fecha de Registro:</strong><br />
                        <span className="text-muted">{formatearFecha(vecinoSeleccionado.created_at)}</span>
                      </p>
                    </div>
                    <div className="col-md-6">
                      <p className="mb-2">
                        <strong>Última Actualización:</strong><br />
                        <span className="text-muted">{formatearFecha(vecinoSeleccionado.updated_at)}</span>
                      </p>
                    </div>
                  </div>
                  <hr />
                </div>

                {/* Comprobante */}
                {vecinoSeleccionado.comprobante_url && (
                  <div className="mb-3">
                    <h6 className="mb-3">📄 Comprobante de Residencia</h6>
                    <p className="mb-2">
                      <a href={vecinoSeleccionado.comprobante_url} target="_blank" rel="noopener noreferrer" className="btn btn-outline-primary btn-sm">
                        📥 Ver Comprobante
                      </a>
                    </p>
                  </div>
                )}

                {/* ID del Sistema */}
                <div className="mb-3">
                  <h6 className="mb-3">ℹ️ Información del Sistema</h6>
                  <p className="mb-2">
                    <strong>ID de Usuario:</strong><br />
                    <code>{vecinoSeleccionado.id}</code>
                  </p>
                </div>
              </div>
              <div className="modal-footer">
                {vecinoSeleccionado.estado === 'pendiente_aprobacion' && (
                  <>
                    <button
                      className="btn btn-success"
                      onClick={() => {
                        aprobarVecino(vecinoSeleccionado.id);
                        setMostrarModal(false);
                      }}
                    >
                      ✅ Aprobar Vecino
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => {
                        rechazarVecino(vecinoSeleccionado.id);
                        setMostrarModal(false);
                      }}
                    >
                      ❌ Rechazar Vecino
                    </button>
                  </>
                )}
                <button type="button" className="btn btn-secondary" onClick={() => setMostrarModal(false)}>
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
