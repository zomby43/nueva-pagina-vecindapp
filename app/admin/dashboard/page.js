'use client';

export default function AdminDashboard() {
  // Datos de ejemplo (posteriormente vendrán de la BD)
  const stats = {
    totalUsuarios: 247,
    totalSolicitudes: 89,
    pendientes: 12,
    enProceso: 23,
    completadas: 54
  };

  const solicitudesRecientes = [
    { id: 'SOL-001234', usuario: 'Juan González', tipo: 'Certificado', estado: 'Pendiente', fecha: '2025-09-20' },
    { id: 'SOL-001233', usuario: 'María López', tipo: 'Certificado', estado: 'En Proceso', fecha: '2025-09-19' },
    { id: 'SOL-001232', usuario: 'Carlos Ruiz', tipo: 'Certificado', estado: 'Pendiente', fecha: '2025-09-19' },
  ];

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Panel de Administración</h1>
        <p className="dashboard-subtitle">Vista general del sistema</p>
      </div>

      {/* Estadísticas Globales */}
      <div className="stats-grid admin-stats">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>Total Usuarios</h3>
            <p className="stat-number">{stats.totalUsuarios}</p>
            <span className="stat-change positive">+12 este mes</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <h3>Total Solicitudes</h3>
            <p className="stat-number">{stats.totalSolicitudes}</p>
            <span className="stat-change positive">+8 esta semana</span>
          </div>
        </div>

        <div className="stat-card stat-pending">
          <div className="stat-icon">⏰</div>
          <div className="stat-content">
            <h3>Pendientes</h3>
            <p className="stat-number">{stats.pendientes}</p>
            <span className="stat-change warning">Requieren atención</span>
          </div>
        </div>

        <div className="stat-card stat-in-progress">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>En Proceso</h3>
            <p className="stat-number">{stats.enProceso}</p>
          </div>
        </div>

        <div className="stat-card stat-completed">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>Completadas</h3>
            <p className="stat-number">{stats.completadas}</p>
            <span className="stat-change positive">60.7% tasa de resolución</span>
          </div>
        </div>
      </div>

      {/* Solicitudes Recientes */}
      <div className="admin-section">
        <div className="section-header">
          <h2>Solicitudes Recientes</h2>
          <a href="/admin/solicitudes" className="btn btn-secondary btn-sm">
            Ver Todas
          </a>
        </div>

        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Usuario</th>
                <th>Tipo</th>
                <th>Estado</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {solicitudesRecientes.map(solicitud => (
                <tr key={solicitud.id}>
                  <td><code>{solicitud.id}</code></td>
                  <td>{solicitud.usuario}</td>
                  <td>{solicitud.tipo}</td>
                  <td>
                    <span className={`status-badge badge-${solicitud.estado.toLowerCase().replace(' ', '-')}`}>
                      {solicitud.estado}
                    </span>
                  </td>
                  <td>{solicitud.fecha}</td>
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
      </div>

      {/* Gráficas */}
      <div className="charts-grid">
        <div className="chart-card">
          <h3>Solicitudes por Estado</h3>
          <div className="chart-placeholder">
            <p>📊 Gráfico próximamente</p>
            <p className="chart-summary">
              Pendientes: {stats.pendientes} |
              En Proceso: {stats.enProceso} |
              Completadas: {stats.completadas}
            </p>
          </div>
        </div>

        <div className="chart-card">
          <h3>Actividad Semanal</h3>
          <div className="chart-placeholder">
            <p>📈 Gráfico próximamente</p>
            <p className="chart-summary">
              Esta semana: 8 solicitudes nuevas
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
