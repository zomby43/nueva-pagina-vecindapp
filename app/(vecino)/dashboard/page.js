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
      <div className="recent-activity" style={{
        background: 'white',
        padding: '1.5rem',
        borderRadius: '16px',
        marginBottom: '2rem'
      }}>
        <h2 style={{ color: '#154765', fontSize: '1.5rem', marginBottom: '1.5rem' }}>Actividad Reciente</h2>
        <div className="activity-list" style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <div className="activity-item" style={{
            display: 'flex',
            gap: '1rem',
            padding: '1rem',
            background: '#f4f8f9',
            borderRadius: '12px'
          }}>
            <div className="activity-icon" style={{ fontSize: '2rem', flexShrink: 0 }}>📝</div>
            <div className="activity-content">
              <h4 style={{ color: '#154765', fontSize: '1rem', marginBottom: '0.25rem' }}>Solicitud #SOL-001234 actualizada</h4>
              <p style={{ color: '#439fa4', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Estado cambió a "En Proceso"</p>
              <span className="activity-time" style={{ color: '#bfd3d9', fontSize: '0.75rem' }}>Hace 2 horas</span>
            </div>
          </div>

          <div className="activity-item" style={{
            display: 'flex',
            gap: '1rem',
            padding: '1rem',
            background: '#f4f8f9',
            borderRadius: '12px'
          }}>
            <div className="activity-icon" style={{ fontSize: '2rem', flexShrink: 0 }}>✅</div>
            <div className="activity-content">
              <h4 style={{ color: '#154765', fontSize: '1rem', marginBottom: '0.25rem' }}>Solicitud #SOL-001220 completada</h4>
              <p style={{ color: '#439fa4', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Certificado de residencia listo para descarga</p>
              <span className="activity-time" style={{ color: '#bfd3d9', fontSize: '0.75rem' }}>Hace 1 día</span>
            </div>
          </div>

          <div className="activity-item" style={{
            display: 'flex',
            gap: '1rem',
            padding: '1rem',
            background: '#f4f8f9',
            borderRadius: '12px'
          }}>
            <div className="activity-icon" style={{ fontSize: '2rem', flexShrink: 0 }}>📋</div>
            <div className="activity-content">
              <h4 style={{ color: '#154765', fontSize: '1rem', marginBottom: '0.25rem' }}>Nueva solicitud creada</h4>
              <p style={{ color: '#439fa4', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Solicitud #SOL-001234 registrada</p>
              <span className="activity-time" style={{ color: '#bfd3d9', fontSize: '0.75rem' }}>Hace 3 días</span>
            </div>
          </div>
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className="quick-actions" style={{
        background: 'white',
        padding: '1.5rem',
        borderRadius: '16px',
        marginBottom: '2rem'
      }}>
        <h2 style={{ color: '#154765', fontSize: '1.5rem', marginBottom: '1.5rem' }}>Acciones Rápidas</h2>
        <div className="actions-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem'
        }}>
          <a href="/solicitudes/nueva" className="action-card" style={{
            background: '#f4f8f9',
            padding: '2rem',
            borderRadius: '12px',
            textDecoration: 'none',
            textAlign: 'center',
            display: 'block'
          }}>
            <div className="action-icon" style={{ fontSize: '3rem', marginBottom: '1rem' }}>➕</div>
            <h3 style={{ color: '#154765', fontSize: '1.125rem', marginBottom: '0.5rem' }}>Nueva Solicitud</h3>
            <p style={{ color: '#439fa4', fontSize: '0.875rem', margin: 0 }}>Crea una nueva solicitud de certificado</p>
          </a>

          <a href="/solicitudes" className="action-card" style={{
            background: '#f4f8f9',
            padding: '2rem',
            borderRadius: '12px',
            textDecoration: 'none',
            textAlign: 'center',
            display: 'block'
          }}>
            <div className="action-icon" style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
            <h3 style={{ color: '#154765', fontSize: '1.125rem', marginBottom: '0.5rem' }}>Mis Solicitudes</h3>
            <p style={{ color: '#439fa4', fontSize: '0.875rem', margin: 0 }}>Ver todas tus solicitudes</p>
          </a>

          <a href="/perfil" className="action-card" style={{
            background: '#f4f8f9',
            padding: '2rem',
            borderRadius: '12px',
            textDecoration: 'none',
            textAlign: 'center',
            display: 'block'
          }}>
            <div className="action-icon" style={{ fontSize: '3rem', marginBottom: '1rem' }}>👤</div>
            <h3 style={{ color: '#154765', fontSize: '1.125rem', marginBottom: '0.5rem' }}>Mi Perfil</h3>
            <p style={{ color: '#439fa4', fontSize: '0.875rem', margin: 0 }}>Actualiza tu información</p>
          </a>
        </div>
      </div>
    </div>
  );
}
