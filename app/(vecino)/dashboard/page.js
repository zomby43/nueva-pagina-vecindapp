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
    <div className="dashboard-container" style={{
      background: '#f4f8f9',
      borderRadius: '16px',
      padding: '2rem',
      boxShadow: '0 2px 8px rgba(21, 71, 101, 0.06)'
    }}>
      <div className="dashboard-header" style={{
        marginBottom: '2rem',
        paddingBottom: '1rem',
        borderBottom: '2px solid #bfd3d9'
      }}>
        <h1 style={{ color: '#154765', fontSize: '2rem', fontWeight: 700, margin: 0 }}>Dashboard</h1>
        <p className="dashboard-subtitle" style={{ color: '#439fa4', fontSize: '1rem', margin: '0.5rem 0 0 0' }}>
          Bienvenido a tu panel de control
        </p>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="stats-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <div className="stat-card" style={{
          background: 'white',
          borderRadius: '16px',
          padding: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          boxShadow: '0 2px 8px rgba(21, 71, 101, 0.06)',
          borderLeft: '4px solid #439fa4'
        }}>
          <div className="stat-icon" style={{ fontSize: '2.5rem', flexShrink: 0 }}>📋</div>
          <div className="stat-content" style={{ flex: 1 }}>
            <h3 style={{ fontSize: '0.875rem', color: '#439fa4', margin: 0, fontWeight: 600, textTransform: 'uppercase' }}>
              Total Solicitudes
            </h3>
            <p className="stat-number" style={{ fontSize: '2rem', fontWeight: 700, color: '#154765', margin: '0.25rem 0 0 0' }}>
              {stats.totalSolicitudes}
            </p>
          </div>
        </div>

        <div className="stat-card stat-pending" style={{
          background: 'white',
          borderRadius: '16px',
          padding: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          boxShadow: '0 2px 8px rgba(21, 71, 101, 0.06)',
          borderLeft: '4px solid #fbbf24'
        }}>
          <div className="stat-icon" style={{ fontSize: '2.5rem', flexShrink: 0 }}>⏳</div>
          <div className="stat-content" style={{ flex: 1 }}>
            <h3 style={{ fontSize: '0.875rem', color: '#439fa4', margin: 0, fontWeight: 600, textTransform: 'uppercase' }}>
              En Proceso
            </h3>
            <p className="stat-number" style={{ fontSize: '2rem', fontWeight: 700, color: '#154765', margin: '0.25rem 0 0 0' }}>
              {stats.enProceso}
            </p>
          </div>
        </div>

        <div className="stat-card stat-completed" style={{
          background: 'white',
          borderRadius: '16px',
          padding: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          boxShadow: '0 2px 8px rgba(21, 71, 101, 0.06)',
          borderLeft: '4px solid #34d399'
        }}>
          <div className="stat-icon" style={{ fontSize: '2.5rem', flexShrink: 0 }}>✅</div>
          <div className="stat-content" style={{ flex: 1 }}>
            <h3 style={{ fontSize: '0.875rem', color: '#439fa4', margin: 0, fontWeight: 600, textTransform: 'uppercase' }}>
              Completadas
            </h3>
            <p className="stat-number" style={{ fontSize: '2rem', fontWeight: 700, color: '#154765', margin: '0.25rem 0 0 0' }}>
              {stats.completadas}
            </p>
          </div>
        </div>

        <div className="stat-card stat-waiting" style={{
          background: 'white',
          borderRadius: '16px',
          padding: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          boxShadow: '0 2px 8px rgba(21, 71, 101, 0.06)',
          borderLeft: '4px solid #fb7185'
        }}>
          <div className="stat-icon" style={{ fontSize: '2.5rem', flexShrink: 0 }}>⏰</div>
          <div className="stat-content" style={{ flex: 1 }}>
            <h3 style={{ fontSize: '0.875rem', color: '#439fa4', margin: 0, fontWeight: 600, textTransform: 'uppercase' }}>
              Pendientes
            </h3>
            <p className="stat-number" style={{ fontSize: '2rem', fontWeight: 700, color: '#154765', margin: '0.25rem 0 0 0' }}>
              {stats.pendientes}
            </p>
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
