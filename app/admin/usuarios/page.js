'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export default function AdminUsuariosPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [usuarios, setUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [filtroRol, setFiltroRol] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    activos: 0,
    pendientes: 0,
    vecinos: 0,
    secretarias: 0,
    admins: 0,
    nuevosEsteMes: 0
  });

  useEffect(() => {
    if (user) {
      fetchUsuarios();
    }
  }, [user]);

  const fetchUsuarios = async () => {
    const supabase = createClient();

    try {
      setLoading(true);

      // Obtener todos los usuarios
      const { data: usuariosData, error } = await supabase
        .from('usuarios')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setUsuarios(usuariosData || []);

      // Calcular estadísticas
      const total = usuariosData?.length || 0;
      const activos = usuariosData?.filter(u => u.estado === 'activo').length || 0;
      const pendientes = usuariosData?.filter(u => u.estado === 'pendiente_aprobacion').length || 0;
      const vecinos = usuariosData?.filter(u => u.rol === 'vecino').length || 0;
      const secretarias = usuariosData?.filter(u => u.rol === 'secretaria').length || 0;
      const admins = usuariosData?.filter(u => u.rol === 'admin').length || 0;

      // Nuevos este mes
      const primerDiaMes = new Date();
      primerDiaMes.setDate(1);
      primerDiaMes.setHours(0, 0, 0, 0);
      const nuevosEsteMes = usuariosData?.filter(u => {
        const fechaCreacion = new Date(u.created_at);
        return fechaCreacion >= primerDiaMes;
      }).length || 0;

      setStats({
        total,
        activos,
        pendientes,
        vecinos,
        secretarias,
        admins,
        nuevosEsteMes
      });

    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      alert('Error al cargar usuarios: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCambiarEstado = async (usuarioId, nuevoEstado) => {
    if (!confirm(`¿Estás seguro de cambiar el estado a "${nuevoEstado}"?`)) {
      return;
    }

    const supabase = createClient();

    try {
      const { error } = await supabase
        .from('usuarios')
        .update({ estado: nuevoEstado })
        .eq('id', usuarioId);

      if (error) throw error;

      alert('Estado actualizado correctamente');
      fetchUsuarios(); // Recargar datos
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      alert('Error al cambiar estado: ' + error.message);
    }
  };

  const handleCambiarRol = async (usuarioId, nuevoRol) => {
    if (!confirm(`¿Estás seguro de cambiar el rol a "${nuevoRol}"?`)) {
      return;
    }

    const supabase = createClient();

    try {
      const { error } = await supabase
        .from('usuarios')
        .update({ rol: nuevoRol })
        .eq('id', usuarioId);

      if (error) throw error;

      alert('Rol actualizado correctamente');
      fetchUsuarios(); // Recargar datos
    } catch (error) {
      console.error('Error al cambiar rol:', error);
      alert('Error al cambiar rol: ' + error.message);
    }
  };

  const handleEliminarUsuario = async (usuarioId, nombreUsuario) => {
    if (!confirm(`⚠️ ADVERTENCIA: ¿Estás seguro de eliminar al usuario "${nombreUsuario}"?\n\nEsta acción NO se puede deshacer y eliminará:\n- El perfil del usuario\n- Todas sus solicitudes\n- Todos sus proyectos\n- Todas sus reservas\n- Todas sus inscripciones\n\n¿Continuar?`)) {
      return;
    }

    const supabase = createClient();

    try {
      // Eliminar usuario (las foreign keys en cascada eliminarán sus registros relacionados)
      const { error } = await supabase
        .from('usuarios')
        .delete()
        .eq('id', usuarioId);

      if (error) throw error;

      alert('Usuario eliminado correctamente');
      fetchUsuarios(); // Recargar datos
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      alert('Error al eliminar usuario: ' + error.message);
    }
  };

  const usuariosFiltrados = usuarios.filter(u => {
    const matchBusqueda = busqueda === '' ||
      u.nombre_completo?.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.rut?.includes(busqueda) ||
      u.email?.toLowerCase().includes(busqueda.toLowerCase());

    const matchRol = filtroRol === '' || u.rol === filtroRol;
    const matchEstado = filtroEstado === '' || u.estado === filtroEstado;

    return matchBusqueda && matchRol && matchEstado;
  });

  const formatFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const getEstadoLabel = (estado) => {
    const estados = {
      'activo': 'Activo',
      'pendiente_aprobacion': 'Pendiente',
      'rechazado': 'Rechazado',
      'inactivo': 'Inactivo'
    };
    return estados[estado] || estado;
  };

  const getEstadoBadgeColor = (estado) => {
    const colores = {
      'activo': 'success',
      'pendiente_aprobacion': 'warning',
      'rechazado': 'danger',
      'inactivo': 'secondary'
    };
    return colores[estado] || 'secondary';
  };

  const getRolLabel = (rol) => {
    const roles = {
      'vecino': 'Vecino',
      'secretaria': 'Secretaría',
      'admin': 'Admin'
    };
    return roles[rol] || rol;
  };

  const getRolBadgeColor = (rol) => {
    const colores = {
      'vecino': 'primary',
      'secretaria': 'info',
      'admin': 'dark'
    };
    return colores[rol] || 'secondary';
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1><i className="bi bi-people me-2"></i>Gestionar Usuarios</h1>
          <p className="page-subtitle">Administra todos los usuarios registrados en el sistema</p>
        </div>
      </div>

      {/* Estadísticas detalladas */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <i className="bi bi-people-fill text-primary" style={{ fontSize: '2rem' }}></i>
                </div>
                <div className="flex-grow-1 ms-3">
                  <div className="text-muted small">Total Usuarios</div>
                  <div className="h4 mb-0">{stats.total}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '2rem' }}></i>
                </div>
                <div className="flex-grow-1 ms-3">
                  <div className="text-muted small">Activos</div>
                  <div className="h4 mb-0">{stats.activos}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <i className="bi bi-clock-fill text-warning" style={{ fontSize: '2rem' }}></i>
                </div>
                <div className="flex-grow-1 ms-3">
                  <div className="text-muted small">Pendientes</div>
                  <div className="h4 mb-0">{stats.pendientes}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <i className="bi bi-calendar-plus text-info" style={{ fontSize: '2rem' }}></i>
                </div>
                <div className="flex-grow-1 ms-3">
                  <div className="text-muted small">Nuevos este mes</div>
                  <div className="h4 mb-0">{stats.nuevosEsteMes}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas por rol */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm bg-primary bg-opacity-10">
            <div className="card-body text-center">
              <i className="bi bi-person text-primary" style={{ fontSize: '2rem' }}></i>
              <div className="h3 mt-2 mb-0">{stats.vecinos}</div>
              <div className="text-muted small">Vecinos</div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm bg-info bg-opacity-10">
            <div className="card-body text-center">
              <i className="bi bi-pencil-square text-info" style={{ fontSize: '2rem' }}></i>
              <div className="h3 mt-2 mb-0">{stats.secretarias}</div>
              <div className="text-muted small">Secretarías</div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm bg-dark bg-opacity-10">
            <div className="card-body text-center">
              <i className="bi bi-shield-check text-dark" style={{ fontSize: '2rem' }}></i>
              <div className="h3 mt-2 mb-0">{stats.admins}</div>
              <div className="text-muted small">Administradores</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="search"
                  className="form-control border-start-0"
                  placeholder="Buscar por nombre, RUT o email..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={filtroRol}
                onChange={(e) => setFiltroRol(e.target.value)}
              >
                <option value="">Todos los roles</option>
                <option value="vecino">Vecinos</option>
                <option value="secretaria">Secretarías</option>
                <option value="admin">Administradores</option>
              </select>
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
              >
                <option value="">Todos los estados</option>
                <option value="activo">Activos</option>
                <option value="pendiente_aprobacion">Pendientes</option>
                <option value="inactivo">Inactivos</option>
                <option value="rechazado">Rechazados</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de usuarios */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="px-4 py-3">RUT</th>
                  <th className="py-3">Nombre</th>
                  <th className="py-3">Email</th>
                  <th className="py-3">Rol</th>
                  <th className="py-3">Estado</th>
                  <th className="py-3">Registro</th>
                  <th className="py-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuariosFiltrados.map(usuario => (
                  <tr key={usuario.id}>
                    <td className="px-4">
                      <code className="bg-light px-2 py-1 rounded">{usuario.rut}</code>
                    </td>
                    <td>
                      <div className="fw-semibold">{usuario.nombre_completo}</div>
                      <div className="small text-muted">{usuario.direccion}</div>
                    </td>
                    <td>
                      <a href={`mailto:${usuario.email}`} className="text-decoration-none">
                        {usuario.email}
                      </a>
                    </td>
                    <td>
                      <div className="dropdown">
                        <button
                          className={`badge bg-${getRolBadgeColor(usuario.rol)} dropdown-toggle`}
                          type="button"
                          data-bs-toggle="dropdown"
                          style={{ cursor: 'pointer', border: 'none' }}
                        >
                          {getRolLabel(usuario.rol)}
                        </button>
                        <ul className="dropdown-menu">
                          <li>
                            <a
                              className="dropdown-item"
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                handleCambiarRol(usuario.id, 'vecino');
                              }}
                            >
                              <i className="bi bi-person me-2"></i>Vecino
                            </a>
                          </li>
                          <li>
                            <a
                              className="dropdown-item"
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                handleCambiarRol(usuario.id, 'secretaria');
                              }}
                            >
                              <i className="bi bi-pencil-square me-2"></i>Secretaría
                            </a>
                          </li>
                          <li>
                            <a
                              className="dropdown-item"
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                handleCambiarRol(usuario.id, 'admin');
                              }}
                            >
                              <i className="bi bi-shield-check me-2"></i>Admin
                            </a>
                          </li>
                        </ul>
                      </div>
                    </td>
                    <td>
                      <div className="dropdown">
                        <button
                          className={`badge bg-${getEstadoBadgeColor(usuario.estado)} dropdown-toggle`}
                          type="button"
                          data-bs-toggle="dropdown"
                          style={{ cursor: 'pointer', border: 'none' }}
                        >
                          {getEstadoLabel(usuario.estado)}
                        </button>
                        <ul className="dropdown-menu">
                          <li>
                            <a
                              className="dropdown-item"
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                handleCambiarEstado(usuario.id, 'activo');
                              }}
                            >
                              <i className="bi bi-check-circle me-2 text-success"></i>Activar
                            </a>
                          </li>
                          <li>
                            <a
                              className="dropdown-item"
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                handleCambiarEstado(usuario.id, 'inactivo');
                              }}
                            >
                              <i className="bi bi-dash-circle me-2 text-secondary"></i>Desactivar
                            </a>
                          </li>
                          <li>
                            <a
                              className="dropdown-item"
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                handleCambiarEstado(usuario.id, 'rechazado');
                              }}
                            >
                              <i className="bi bi-x-circle me-2 text-danger"></i>Rechazar
                            </a>
                          </li>
                        </ul>
                      </div>
                    </td>
                    <td>
                      <small className="text-muted">{formatFecha(usuario.created_at)}</small>
                    </td>
                    <td>
                      <div className="d-flex gap-2 justify-content-center">
                        <Link
                          href={`/admin/usuarios/${usuario.id}`}
                          className="btn btn-sm btn-outline-primary"
                          title="Ver detalles"
                        >
                          <i className="bi bi-eye"></i>
                        </Link>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleEliminarUsuario(usuario.id, usuario.nombre_completo)}
                          title="Eliminar usuario"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Mensaje si no hay resultados */}
      {usuariosFiltrados.length === 0 && (
        <div className="text-center py-5">
          <i className="bi bi-search text-muted" style={{ fontSize: '3rem' }}></i>
          <h3 className="mt-3">No se encontraron usuarios</h3>
          <p className="text-muted">Intenta con otros términos de búsqueda o filtros</p>
        </div>
      )}

      <div className="mt-4 text-muted small">
        <i className="bi bi-info-circle me-2"></i>
        Mostrando {usuariosFiltrados.length} de {usuarios.length} usuarios
      </div>
    </div>
  );
}
