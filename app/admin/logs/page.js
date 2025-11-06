'use client';

import { useState, useEffect } from 'react';
import { getLogs, getEstadisticasLogs } from '@/lib/logs/getLogs';

export default function AdminLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [stats, setStats] = useState(null);

  // Filtros
  const [busqueda, setBusqueda] = useState('');
  const [filtroAccion, setFiltroAccion] = useState('');
  const [filtroEntidad, setFiltroEntidad] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');

  // Paginación
  const [page, setPage] = useState(1);
  const limit = 50;

  useEffect(() => {
    fetchLogs();
    fetchEstadisticas();
  }, [page, filtroAccion, filtroEntidad, fechaDesde, fechaHasta, busqueda]);

  const fetchLogs = async () => {
    try {
      setLoading(true);

      const options = {
        limit,
        offset: (page - 1) * limit,
      };

      if (filtroAccion) options.accion = filtroAccion;
      if (filtroEntidad) options.entidad = filtroEntidad;
      if (busqueda) options.busqueda = busqueda;
      if (fechaDesde) options.fechaDesde = new Date(fechaDesde);
      if (fechaHasta) {
        const hasta = new Date(fechaHasta);
        hasta.setHours(23, 59, 59, 999);
        options.fechaHasta = hasta;
      }

      const { data, count, error } = await getLogs(options);

      if (error) {
        console.error('Error al obtener logs:', error);
        alert('Error al cargar los logs');
        return;
      }

      setLogs(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const fetchEstadisticas = async () => {
    const data = await getEstadisticasLogs();
    if (!data.error) {
      setStats(data);
    }
  };

  const limpiarFiltros = () => {
    setBusqueda('');
    setFiltroAccion('');
    setFiltroEntidad('');
    setFechaDesde('');
    setFechaHasta('');
    setPage(1);
  };

  // Mapeo de acciones a iconos y colores
  const accionConfig = {
    'login': { icon: '🔐', color: '#4CAF50', label: 'Login' },
    'logout': { icon: '🚪', color: '#9E9E9E', label: 'Logout' },
    'crear': { icon: '➕', color: '#2196F3', label: 'Crear' },
    'editar': { icon: '✏️', color: '#FF9800', label: 'Editar' },
    'eliminar': { icon: '🗑️', color: '#F44336', label: 'Eliminar' },
    'cambiar_rol': { icon: '👤', color: '#9C27B0', label: 'Cambiar Rol' },
    'cambiar_estado': { icon: '🔄', color: '#00BCD4', label: 'Cambiar Estado' },
  };

  const getAccionConfig = (accion) => {
    return accionConfig[accion] || { icon: '📝', color: '#757575', label: accion };
  };

  // Mapeo de entidades a iconos
  const entidadIcons = {
    'sistema': '💻',
    'usuario': '👤',
    'solicitud': '📋',
    'proyecto': '🧱',
    'noticia': '📰',
    'aviso': '🔔',
    'reserva': '🏟️',
    'actividad': '🎯',
    'espacio': '🏢',
  };

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>📜 Registro de Actividad del Sistema</h1>
          <p className="page-subtitle">Auditoría y seguimiento de acciones</p>
        </div>
      </div>

      {/* Estadísticas */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{stats.totalLogs?.toLocaleString()}</div>
            <div className="stat-label">Total de Registros</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.logsHoy?.toLocaleString()}</div>
            <div className="stat-label">Actividad Hoy</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{Object.keys(stats.porAccion || {}).length}</div>
            <div className="stat-label">Tipos de Acciones</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{Object.keys(stats.porEntidad || {}).length}</div>
            <div className="stat-label">Tipos de Entidades</div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="filters-card">
        <h3>🔍 Filtros</h3>
        <div className="filters-grid">
          <div className="form-group">
            <label>Buscar Usuario</label>
            <input
              type="text"
              placeholder="Nombre o email..."
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <div className="form-group">
            <label>Acción</label>
            <select
              value={filtroAccion}
              onChange={(e) => {
                setFiltroAccion(e.target.value);
                setPage(1);
              }}
            >
              <option value="">Todas</option>
              <option value="login">Login</option>
              <option value="logout">Logout</option>
              <option value="crear">Crear</option>
              <option value="editar">Editar</option>
              <option value="eliminar">Eliminar</option>
              <option value="cambiar_rol">Cambiar Rol</option>
              <option value="cambiar_estado">Cambiar Estado</option>
            </select>
          </div>

          <div className="form-group">
            <label>Entidad</label>
            <select
              value={filtroEntidad}
              onChange={(e) => {
                setFiltroEntidad(e.target.value);
                setPage(1);
              }}
            >
              <option value="">Todas</option>
              <option value="sistema">Sistema</option>
              <option value="usuario">Usuario</option>
              <option value="solicitud">Solicitud</option>
              <option value="proyecto">Proyecto</option>
              <option value="noticia">Noticia</option>
              <option value="aviso">Aviso</option>
              <option value="reserva">Reserva</option>
              <option value="actividad">Actividad</option>
              <option value="espacio">Espacio</option>
            </select>
          </div>

          <div className="form-group">
            <label>Desde</label>
            <input
              type="date"
              value={fechaDesde}
              onChange={(e) => {
                setFechaDesde(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <div className="form-group">
            <label>Hasta</label>
            <input
              type="date"
              value={fechaHasta}
              onChange={(e) => {
                setFechaHasta(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button onClick={limpiarFiltros} className="btn btn-secondary">
              Limpiar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Resultados */}
      <div className="content-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3>Logs de Actividad</h3>
          <span className="badge" style={{ backgroundColor: '#2196F3', color: 'white', padding: '0.5rem 1rem' }}>
            {totalCount} registros
          </span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p>Cargando logs...</p>
          </div>
        ) : logs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p>No se encontraron registros</p>
          </div>
        ) : (
          <>
            <div className="logs-table-container">
              <table className="logs-table">
                <thead>
                  <tr>
                    <th style={{ width: '160px' }}>Fecha y Hora</th>
                    <th style={{ width: '120px' }}>Acción</th>
                    <th style={{ width: '120px' }}>Entidad</th>
                    <th>Usuario</th>
                    <th>Detalles</th>
                    <th style={{ width: '120px' }}>IP</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => {
                    const config = getAccionConfig(log.accion);
                    return (
                      <tr key={log.id}>
                        <td>
                          <small style={{ display: 'block', whiteSpace: 'nowrap' }}>
                            {new Date(log.created_at).toLocaleDateString('es-CL', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </small>
                          <small style={{ color: '#666', display: 'block' }}>
                            {new Date(log.created_at).toLocaleTimeString('es-CL', {
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit'
                            })}
                          </small>
                        </td>
                        <td>
                          <span
                            className="badge"
                            style={{
                              backgroundColor: config.color,
                              color: 'white',
                              padding: '0.4rem 0.8rem',
                              borderRadius: '4px',
                              display: 'inline-block',
                              fontSize: '0.85rem'
                            }}
                          >
                            {config.icon} {config.label}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontSize: '1.2rem' }}>
                            {entidadIcons[log.entidad] || '📄'} {log.entidad}
                          </span>
                        </td>
                        <td>
                          <div>
                            <strong>{log.usuario_nombre || 'Sistema'}</strong>
                            <br />
                            <small style={{ color: '#666' }}>{log.usuario_email || '-'}</small>
                          </div>
                        </td>
                        <td>
                          <div style={{ maxWidth: '400px' }}>
                            {log.detalles && Object.keys(log.detalles).length > 0 ? (
                              <details style={{ cursor: 'pointer' }}>
                                <summary style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
                                  Ver detalles
                                </summary>
                                <div style={{
                                  backgroundColor: '#f5f5f5',
                                  padding: '0.5rem',
                                  borderRadius: '4px',
                                  fontSize: '0.85rem',
                                  maxHeight: '200px',
                                  overflow: 'auto'
                                }}>
                                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                                    {JSON.stringify(log.detalles, null, 2)}
                                  </pre>
                                </div>
                              </details>
                            ) : (
                              <small style={{ color: '#999' }}>Sin detalles adicionales</small>
                            )}
                          </div>
                        </td>
                        <td>
                          <small style={{ color: '#666' }}>{log.ip_address || '-'}</small>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="btn btn-secondary btn-sm"
                >
                  ← Anterior
                </button>

                <span style={{ margin: '0 1rem' }}>
                  Página {page} de {totalPages}
                </span>

                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                  className="btn btn-secondary btn-sm"
                >
                  Siguiente →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <style jsx>{`
        .logs-table-container {
          overflow-x: auto;
          margin-top: 1rem;
        }

        .logs-table {
          width: 100%;
          border-collapse: collapse;
          background: white;
        }

        .logs-table th {
          background-color: #f5f5f5;
          padding: 0.75rem;
          text-align: left;
          font-weight: 600;
          border-bottom: 2px solid #ddd;
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .logs-table td {
          padding: 0.75rem;
          border-bottom: 1px solid #eee;
          vertical-align: top;
        }

        .logs-table tbody tr:hover {
          background-color: #f9f9f9;
        }

        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          margin-top: 2rem;
          padding: 1rem 0;
        }

        .filters-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-top: 1rem;
        }
      `}</style>
    </div>
  );
}
