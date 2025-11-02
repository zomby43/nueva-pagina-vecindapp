'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export default function AdminSolicitudesPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [solicitudes, setSolicitudes] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    pendientes: 0,
    enProceso: 0,
    completadas: 0,
    rechazadas: 0
  });

  useEffect(() => {
    if (user) {
      fetchSolicitudes();
    }
  }, [user]);

  const fetchSolicitudes = async () => {
    const supabase = createClient();

    try {
      setLoading(true);

      // Obtener todas las solicitudes con datos del usuario
      const { data: solicitudesData, error } = await supabase
        .from('solicitudes')
        .select(`
          *,
          usuario:usuarios!usuario_id(
            nombres,
            apellidos,
            rut,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setSolicitudes(solicitudesData || []);

      // Calcular estadísticas
      const total = solicitudesData?.length || 0;
      const pendientes = solicitudesData?.filter(s => s.estado === 'pendiente').length || 0;
      const enProceso = solicitudesData?.filter(s => s.estado === 'en_proceso').length || 0;
      const completadas = solicitudesData?.filter(s => s.estado === 'completado').length || 0;
      const rechazadas = solicitudesData?.filter(s => s.estado === 'rechazado').length || 0;

      setStats({
        total,
        pendientes,
        enProceso,
        completadas,
        rechazadas
      });

    } catch (error) {
      console.error('Error al cargar solicitudes:', error);
      alert('Error al cargar solicitudes: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCambiarEstado = async (solicitudId, nuevoEstado) => {
    if (!confirm(`¿Cambiar estado a "${nuevoEstado}"?`)) {
      return;
    }

    const supabase = createClient();

    try {
      const { error } = await supabase
        .from('solicitudes')
        .update({ estado: nuevoEstado })
        .eq('id', solicitudId);

      if (error) throw error;

      alert('Estado actualizado correctamente');
      fetchSolicitudes(); // Recargar
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      alert('Error: ' + error.message);
    }
  };

  const handleEliminar = async (solicitudId) => {
    if (!confirm('⚠️ ¿Eliminar esta solicitud?\n\nEsta acción NO se puede deshacer.')) {
      return;
    }

    const supabase = createClient();

    try {
      const { error } = await supabase
        .from('solicitudes')
        .delete()
        .eq('id', solicitudId);

      if (error) throw error;

      alert('Solicitud eliminada correctamente');
      fetchSolicitudes(); // Recargar
    } catch (error) {
      console.error('Error al eliminar:', error);
      alert('Error: ' + error.message);
    }
  };

  const solicitudesFiltradas = solicitudes.filter(s => {
    const nombreCompleto = `${s.usuario?.nombres || ''} ${s.usuario?.apellidos || ''}`.toLowerCase();
    const matchBusqueda = busqueda === '' ||
      nombreCompleto.includes(busqueda.toLowerCase()) ||
      s.usuario?.rut?.includes(busqueda) ||
      s.id?.toLowerCase().includes(busqueda.toLowerCase());

    const matchEstado = filtroEstado === '' || s.estado === filtroEstado;
    const matchTipo = filtroTipo === '' || s.tipo === filtroTipo;

    return matchBusqueda && matchEstado && matchTipo;
  });

  const formatFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const getTipoLabel = (tipo) => {
    const tipos = {
      'residencia': 'Certificado de Residencia',
      'antiguedad': 'Certificado de Antigüedad'
    };
    return tipos[tipo] || tipo;
  };

  const getEstadoLabel = (estado) => {
    const estados = {
      'pendiente': 'Pendiente',
      'en_proceso': 'En Proceso',
      'completado': 'Completado',
      'rechazado': 'Rechazado'
    };
    return estados[estado] || estado;
  };

  const getEstadoBadgeColor = (estado) => {
    const colores = {
      'pendiente': 'warning',
      'en_proceso': 'info',
      'completado': 'success',
      'rechazado': 'danger'
    };
    return colores[estado] || 'secondary';
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
          <h1><i className="bi bi-clipboard-check me-2"></i>Gestionar Solicitudes</h1>
          <p className="page-subtitle">Administra todas las solicitudes de certificados del sistema</p>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <i className="bi bi-file-text text-primary" style={{ fontSize: '2rem' }}></i>
                </div>
                <div className="flex-grow-1 ms-3">
                  <div className="text-muted small">Total</div>
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
                  <i className="bi bi-clock text-warning" style={{ fontSize: '2rem' }}></i>
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
                  <i className="bi bi-hourglass-split text-info" style={{ fontSize: '2rem' }}></i>
                </div>
                <div className="flex-grow-1 ms-3">
                  <div className="text-muted small">En Proceso</div>
                  <div className="h4 mb-0">{stats.enProceso}</div>
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
                  <i className="bi bi-check-circle text-success" style={{ fontSize: '2rem' }}></i>
                </div>
                <div className="flex-grow-1 ms-3">
                  <div className="text-muted small">Completadas</div>
                  <div className="h4 mb-0">{stats.completadas}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="search"
                  className="form-control border-start-0"
                  placeholder="Buscar por ID, usuario o RUT..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-4">
              <select
                className="form-select"
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
              >
                <option value="">Todos los estados</option>
                <option value="pendiente">Pendiente</option>
                <option value="en_proceso">En Proceso</option>
                <option value="completado">Completado</option>
                <option value="rechazado">Rechazado</option>
              </select>
            </div>
            <div className="col-md-4">
              <select
                className="form-select"
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
              >
                <option value="">Todos los tipos</option>
                <option value="residencia">Certificado de Residencia</option>
                <option value="antiguedad">Certificado de Antigüedad</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="py-3">Usuario</th>
                  <th className="py-3">RUT</th>
                  <th className="py-3">Tipo</th>
                  <th className="py-3">Estado</th>
                  <th className="py-3">Fecha</th>
                  <th className="py-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {solicitudesFiltradas.map(solicitud => (
                  <tr key={solicitud.id}>
                    <td className="px-4">
                      <code className="bg-light px-2 py-1 rounded">
                        {solicitud.id.substring(0, 8)}
                      </code>
                    </td>
                    <td>
                      <div className="fw-semibold">{solicitud.usuario?.nombres} {solicitud.usuario?.apellidos}</div>
                      <small className="text-muted">{solicitud.usuario?.email}</small>
                    </td>
                    <td>
                      <code className="bg-light px-2 py-1 rounded">{solicitud.usuario?.rut}</code>
                    </td>
                    <td>{getTipoLabel(solicitud.tipo)}</td>
                    <td>
                      <div className="dropdown">
                        <button
                          className={`badge bg-${getEstadoBadgeColor(solicitud.estado)} dropdown-toggle`}
                          type="button"
                          data-bs-toggle="dropdown"
                          style={{ cursor: 'pointer', border: 'none' }}
                        >
                          {getEstadoLabel(solicitud.estado)}
                        </button>
                        <ul className="dropdown-menu">
                          <li>
                            <a
                              className="dropdown-item"
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                handleCambiarEstado(solicitud.id, 'pendiente');
                              }}
                            >
                              <i className="bi bi-clock me-2 text-warning"></i>Pendiente
                            </a>
                          </li>
                          <li>
                            <a
                              className="dropdown-item"
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                handleCambiarEstado(solicitud.id, 'en_proceso');
                              }}
                            >
                              <i className="bi bi-hourglass-split me-2 text-info"></i>En Proceso
                            </a>
                          </li>
                          <li>
                            <a
                              className="dropdown-item"
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                handleCambiarEstado(solicitud.id, 'completado');
                              }}
                            >
                              <i className="bi bi-check-circle me-2 text-success"></i>Completado
                            </a>
                          </li>
                          <li><hr className="dropdown-divider" /></li>
                          <li>
                            <a
                              className="dropdown-item text-danger"
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                handleCambiarEstado(solicitud.id, 'rechazado');
                              }}
                            >
                              <i className="bi bi-x-circle me-2"></i>Rechazar
                            </a>
                          </li>
                        </ul>
                      </div>
                    </td>
                    <td>
                      <small className="text-muted">{formatFecha(solicitud.created_at)}</small>
                    </td>
                    <td>
                      <div className="d-flex gap-2 justify-content-center">
                        <Link
                          href={`/admin/solicitudes/${solicitud.id}`}
                          className="btn btn-sm btn-outline-primary"
                          title="Ver detalles"
                        >
                          <i className="bi bi-eye"></i>
                        </Link>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleEliminar(solicitud.id)}
                          title="Eliminar solicitud"
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

      {/* Sin resultados */}
      {solicitudesFiltradas.length === 0 && (
        <div className="text-center py-5">
          <i className="bi bi-inbox text-muted" style={{ fontSize: '3rem' }}></i>
          <h3 className="mt-3">No se encontraron solicitudes</h3>
          <p className="text-muted">Intenta con otros filtros</p>
        </div>
      )}

      <div className="mt-4 text-muted small">
        <i className="bi bi-info-circle me-2"></i>
        Mostrando {solicitudesFiltradas.length} de {solicitudes.length} solicitudes
      </div>
    </div>
  );
}
