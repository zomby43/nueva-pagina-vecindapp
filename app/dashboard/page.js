'use client';

export default function UserDashboard() {
  // Datos de ejemplo (posteriormente vendrán de la BD)
  const stats = {
    totalSolicitudes: 5,
    enProceso: 2,
    completadas: 3,
    pendientes: 0
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p className="dashboard-subtitle">Bienvenido a tu panel de control</p>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <h3>Total Solicitudes</h3>
            <p className="stat-number">{stats.totalSolicitudes}</p>
          </div>
        </div>

        <div className="stat-card stat-pending">
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
          </div>
        </div>

        <div className="stat-card stat-waiting">
          <div className="stat-icon">⏰</div>
          <div className="stat-content">
            <h3>Pendientes</h3>
            <p className="stat-number">{stats.pendientes}</p>
          </div>
        </div>
      </div>

      {/* Actividad reciente */}
      <div className="recent-activity">
        <h2>Actividad Reciente</h2>
        <div className="activity-list">
          <div className="activity-item">
            <div className="activity-icon">📝</div>
            <div className="activity-content">
              <h4>Solicitud #SOL-001234 actualizada</h4>
              <p>Estado cambió a "En Proceso"</p>
              <span className="activity-time">Hace 2 horas</span>
            </div>
          </div>

          <div className="activity-item">
            <div className="activity-icon">✅</div>
            <div className="activity-content">
              <h4>Solicitud #SOL-001220 completada</h4>
              <p>Certificado de residencia listo para descarga</p>
              <span className="activity-time">Hace 1 día</span>
            </div>
          </div>

          <div className="activity-item">
            <div className="activity-icon">📋</div>
            <div className="activity-content">
              <h4>Nueva solicitud creada</h4>
              <p>Solicitud #SOL-001234 registrada</p>
              <span className="activity-time">Hace 3 días</span>
            </div>
          </div>
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className="quick-actions">
        <h2>Acciones Rápidas</h2>
        <div className="actions-grid">
          <a href="/solicitudes/nueva" className="action-card">
            <div className="action-icon">➕</div>
            <h3>Nueva Solicitud</h3>
            <p>Crea una nueva solicitud de certificado</p>
          </a>

          <a href="/solicitudes" className="action-card">
            <div className="action-icon">📋</div>
            <h3>Mis Solicitudes</h3>
            <p>Ver todas tus solicitudes</p>
          </a>

          <a href="/perfil" className="action-card">
            <div className="action-icon">👤</div>
            <h3>Mi Perfil</h3>
            <p>Actualiza tu información</p>
          </a>
        </div>
      </div>
    </div>
  );
}
