'use client';

// Componente para tarjeta de estadística con estilos inline
const StatCard = ({ icon, title, value, subtitle, borderColor = '#439fa4', subtitleColor = '#34d399' }) => (
  <div className="stat-card" style={{
    background: 'white',
    borderRadius: '16px',
    padding: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    boxShadow: '0 2px 8px rgba(21, 71, 101, 0.06)',
    transition: 'transform 0.2s',
    borderLeft: `4px solid ${borderColor}`
  }}>
    <div className="stat-icon" style={{ fontSize: '2.5rem', flexShrink: 0 }}>{icon}</div>
    <div className="stat-content" style={{ flex: 1 }}>
      <h3 style={{ fontSize: '0.875rem', color: '#439fa4', margin: 0, fontWeight: 600, textTransform: 'uppercase' }}>{title}</h3>
      <p className="stat-number" style={{ fontSize: '2rem', fontWeight: 700, color: '#154765', margin: '0.25rem 0 0 0', lineHeight: 1 }}>{value}</p>
      {subtitle && (
        <span className="stat-change" style={{ fontSize: '0.75rem', marginTop: '0.25rem', display: 'block', color: subtitleColor }}>
          {subtitle}
        </span>
      )}
    </div>
  </div>
);

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
        <h1 style={{ color: '#154765', fontSize: '2rem', fontWeight: 700, margin: 0 }}>Panel de Administración</h1>
        <p className="dashboard-subtitle" style={{ color: '#439fa4', fontSize: '1rem', margin: '0.5rem 0 0 0' }}>Vista general del sistema</p>
      </div>

      {/* Estadísticas Globales */}
      <div className="stats-grid admin-stats" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <StatCard
          icon="👥"
          title="Total Usuarios"
          value={stats.totalUsuarios}
          subtitle="+12 este mes"
          borderColor="#439fa4"
        />

        <StatCard
          icon="📋"
          title="Total Solicitudes"
          value={stats.totalSolicitudes}
          subtitle="+8 esta semana"
          borderColor="#439fa4"
        />

        <StatCard
          icon="⏰"
          title="Pendientes"
          value={stats.pendientes}
          subtitle="Requieren atención"
          borderColor="#fbbf24"
          subtitleColor="#fbbf24"
        />

        <StatCard
          icon="⏳"
          title="En Proceso"
          value={stats.enProceso}
          borderColor="#439fa4"
        />

        <StatCard
          icon="✅"
          title="Completadas"
          value={stats.completadas}
          subtitle="60.7% tasa de resolución"
          borderColor="#34d399"
        />
      </div>

      {/* Solicitudes Recientes */}
      <div className="admin-section" style={{
        background: 'white',
        padding: '1.5rem',
        borderRadius: '16px',
        marginBottom: '2rem'
      }}>
        <div className="section-header" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem'
        }}>
          <h2 style={{ color: '#154765', fontSize: '1.5rem', margin: 0 }}>Solicitudes Recientes</h2>
          <a href="/admin/solicitudes" className="btn btn-secondary btn-sm" style={{
            padding: '0.375rem 0.875rem',
            fontSize: '0.875rem',
            background: '#bfd3d9',
            color: '#154765',
            borderRadius: '12px',
            textDecoration: 'none',
            fontWeight: 600
          }}>
            Ver Todas
          </a>
        </div>

        <div className="table-container" style={{ overflowX: 'auto' }}>
          <table className="admin-table" style={{
            width: '100%',
            background: 'white',
            borderRadius: '16px',
            overflow: 'hidden'
          }}>
            <thead style={{ background: '#bfd3d9', color: '#154765' }}>
              <tr>
                <th style={{ fontWeight: 600, padding: '1rem', border: 'none' }}>ID</th>
                <th style={{ fontWeight: 600, padding: '1rem', border: 'none' }}>Usuario</th>
                <th style={{ fontWeight: 600, padding: '1rem', border: 'none' }}>Tipo</th>
                <th style={{ fontWeight: 600, padding: '1rem', border: 'none' }}>Estado</th>
                <th style={{ fontWeight: 600, padding: '1rem', border: 'none' }}>Fecha</th>
                <th style={{ fontWeight: 600, padding: '1rem', border: 'none' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {solicitudesRecientes.map(solicitud => (
                <tr key={solicitud.id}>
                  <td style={{ padding: '1rem', verticalAlign: 'middle', borderColor: '#bfd3d9' }}>
                    <code style={{ background: '#bfd3d9', padding: '0.25rem 0.5rem', borderRadius: '6px', fontSize: '0.875rem' }}>
                      {solicitud.id}
                    </code>
                  </td>
                  <td style={{ padding: '1rem', verticalAlign: 'middle', borderColor: '#bfd3d9' }}>{solicitud.usuario}</td>
                  <td style={{ padding: '1rem', verticalAlign: 'middle', borderColor: '#bfd3d9' }}>{solicitud.tipo}</td>
                  <td style={{ padding: '1rem', verticalAlign: 'middle', borderColor: '#bfd3d9' }}>
                    <span className={`status-badge badge-${solicitud.estado.toLowerCase().replace(' ', '-')}`} style={{
                      display: 'inline-block',
                      padding: '0.375rem 0.875rem',
                      borderRadius: '20px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      background: solicitud.estado === 'Pendiente' ? 'rgba(251, 191, 36, 0.2)' : 'rgba(67, 159, 164, 0.2)',
                      color: solicitud.estado === 'Pendiente' ? '#fbbf24' : '#439fa4'
                    }}>
                      {solicitud.estado}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', verticalAlign: 'middle', borderColor: '#bfd3d9' }}>{solicitud.fecha}</td>
                  <td style={{ padding: '1rem', verticalAlign: 'middle', borderColor: '#bfd3d9' }}>
                    <a href={`/admin/solicitudes/${solicitud.id}`} className="btn-link" style={{
                      color: '#439fa4',
                      textDecoration: 'none',
                      fontWeight: 600,
                      padding: '0.375rem 0.875rem',
                      borderRadius: '8px'
                    }}>
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
      <div className="charts-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '2rem',
        marginBottom: '2rem'
      }}>
        <div className="chart-card" style={{
          background: 'white',
          borderRadius: '16px',
          padding: '2rem',
          boxShadow: '0 2px 8px rgba(21, 71, 101, 0.06)'
        }}>
          <h3 style={{ color: '#154765', marginBottom: '1.5rem' }}>Solicitudes por Estado</h3>
          <div className="chart-placeholder" style={{
            textAlign: 'center',
            padding: '3rem 1rem',
            background: '#f4f8f9',
            borderRadius: '12px'
          }}>
            <p style={{ color: '#439fa4', margin: '0.5rem 0' }}>📊 Gráfico próximamente</p>
            <p className="chart-summary" style={{ fontSize: '0.875rem', color: '#439fa4' }}>
              Pendientes: {stats.pendientes} |
              En Proceso: {stats.enProceso} |
              Completadas: {stats.completadas}
            </p>
          </div>
        </div>

        <div className="chart-card" style={{
          background: 'white',
          borderRadius: '16px',
          padding: '2rem',
          boxShadow: '0 2px 8px rgba(21, 71, 101, 0.06)'
        }}>
          <h3 style={{ color: '#154765', marginBottom: '1.5rem' }}>Actividad Semanal</h3>
          <div className="chart-placeholder" style={{
            textAlign: 'center',
            padding: '3rem 1rem',
            background: '#f4f8f9',
            borderRadius: '12px'
          }}>
            <p style={{ color: '#439fa4', margin: '0.5rem 0' }}>📈 Gráfico próximamente</p>
            <p className="chart-summary" style={{ fontSize: '0.875rem', color: '#439fa4' }}>
              Esta semana: 8 solicitudes nuevas
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
