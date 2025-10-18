'use client';

import Link from 'next/link';

export default function SecretariaDashboard() {
  // Datos de ejemplo (posteriormente vendrán de la BD)
  const stats = {
    vecinosPendientes: 8,
    solicitudesPendientes: 15,
    solicitudesEnProceso: 12,
    certificadosEmitidos: 45,
    totalVecinos: 247
  };

  const vecinosPendientes = [
    { id: 1, nombre: 'Pedro Sánchez', rut: '12.345.678-9', fecha: '2025-01-15', direccion: 'Calle Principal 123' },
    { id: 2, nombre: 'Ana Martínez', rut: '98.765.432-1', fecha: '2025-01-14', direccion: 'Avenida Los Rosales 456' },
    { id: 3, nombre: 'Carlos López', rut: '15.678.234-5', fecha: '2025-01-13', direccion: 'Pasaje El Carmen 789' },
  ];

  const solicitudesRecientes = [
    { id: 'SOL-001240', vecino: 'María González', tipo: 'Certificado Residencia', estado: 'Pendiente', fecha: '2025-01-15' },
    { id: 'SOL-001239', vecino: 'Juan Pérez', tipo: 'Certificado Residencia', estado: 'En Proceso', fecha: '2025-01-14' },
    { id: 'SOL-001238', vecino: 'Laura Torres', tipo: 'Certificado Antigüedad', estado: 'Pendiente', fecha: '2025-01-14' },
  ];

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Panel de Secretaría</h1>
        <p className="dashboard-subtitle">Gestión de vecinos y solicitudes de la Junta de Vecinos</p>
      </div>

      {/* Estadísticas Principales */}
      <div className="stats-grid admin-stats">
        <div className="stat-card" style={{ borderLeft: '4px solid #fb7185' }}>
          <div className="stat-icon">⏰</div>
          <div className="stat-content">
            <h3>Vecinos Pendientes</h3>
            <p className="stat-number">{stats.vecinosPendientes}</p>
            <span className="stat-change warning">Requieren aprobación</span>
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid #fbbf24' }}>
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <h3>Solicitudes Pendientes</h3>
            <p className="stat-number">{stats.solicitudesPendientes}</p>
            <span className="stat-change warning">Por revisar</span>
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid #439fa4' }}>
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>En Proceso</h3>
            <p className="stat-number">{stats.solicitudesEnProceso}</p>
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid #34d399' }}>
          <div className="stat-icon">📄</div>
          <div className="stat-content">
            <h3>Certificados Emitidos</h3>
            <p className="stat-number">{stats.certificadosEmitidos}</p>
            <span className="stat-change positive">Este mes</span>
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid #439fa4' }}>
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>Total Vecinos</h3>
            <p className="stat-number">{stats.totalVecinos}</p>
            <span className="stat-change positive">Activos</span>
          </div>
        </div>
      </div>

      {/* Vecinos Pendientes de Aprobación */}
      <div className="admin-section">
        <div className="section-header">
          <h2>⏰ Vecinos Pendientes de Aprobación</h2>
          <Link href="/secretaria/vecinos/aprobaciones" className="btn btn-primary btn-sm">
            Ver Todos
          </Link>
        </div>

        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>RUT</th>
                <th>Dirección</th>
                <th>Fecha Registro</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {vecinosPendientes.map(vecino => (
                <tr key={vecino.id}>
                  <td><strong>{vecino.nombre}</strong></td>
                  <td><code>{vecino.rut}</code></td>
                  <td>{vecino.direccion}</td>
                  <td>{vecino.fecha}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-success btn-sm">✓ Aprobar</button>
                      <button className="btn btn-danger btn-sm">✗ Rechazar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Solicitudes Recientes */}
      <div className="admin-section">
        <div className="section-header">
          <h2>📋 Solicitudes Recientes</h2>
          <Link href="/secretaria/solicitudes" className="btn btn-secondary btn-sm">
            Ver Todas
          </Link>
        </div>

        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Vecino</th>
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
                  <td>{solicitud.vecino}</td>
                  <td>{solicitud.tipo}</td>
                  <td>
                    <span className={`status-badge badge-${solicitud.estado.toLowerCase().replace(' ', '-')}`}>
                      {solicitud.estado}
                    </span>
                  </td>
                  <td>{solicitud.fecha}</td>
                  <td>
                    <Link href={`/secretaria/solicitudes/${solicitud.id}`} className="btn-link">
                      Revisar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Acciones Rápidas */}
      <div className="admin-section">
        <div className="section-header">
          <h2>⚡ Acciones Rápidas</h2>
        </div>

        <div className="actions-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
          marginTop: '1rem'
        }}>
          <Link href="/secretaria/vecinos/aprobaciones" className="action-card">
            <div className="action-icon">✅</div>
            <h3>Aprobar Vecinos</h3>
            <p>Revisar y aprobar nuevos registros</p>
            {stats.vecinosPendientes > 0 && (
              <span className="badge bg-danger" style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold'
              }}>
                {stats.vecinosPendientes}
              </span>
            )}
          </Link>

          <Link href="/secretaria/solicitudes/pendientes" className="action-card">
            <div className="action-icon">📝</div>
            <h3>Solicitudes Pendientes</h3>
            <p>Revisar solicitudes por atender</p>
            {stats.solicitudesPendientes > 0 && (
              <span className="badge bg-warning" style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                color: '#154765'
              }}>
                {stats.solicitudesPendientes}
              </span>
            )}
          </Link>

          <Link href="/secretaria/certificados" className="action-card">
            <div className="action-icon">📄</div>
            <h3>Emitir Certificado</h3>
            <p>Generar certificados de residencia</p>
          </Link>

          <Link href="/secretaria/vecinos" className="action-card">
            <div className="action-icon">👥</div>
            <h3>Gestionar Vecinos</h3>
            <p>Ver y administrar vecinos activos</p>
          </Link>
        </div>
      </div>

      {/* Resumen Semanal */}
      <div className="charts-grid">
        <div className="chart-card">
          <h3>📊 Resumen de la Semana</h3>
          <div className="chart-placeholder">
            <div style={{ padding: '1.5rem', textAlign: 'left' }}>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <li style={{ padding: '0.75rem 0', borderBottom: '1px solid #bfd3d9' }}>
                  ✅ <strong>8</strong> vecinos aprobados
                </li>
                <li style={{ padding: '0.75rem 0', borderBottom: '1px solid #bfd3d9' }}>
                  📄 <strong>23</strong> certificados emitidos
                </li>
                <li style={{ padding: '0.75rem 0', borderBottom: '1px solid #bfd3d9' }}>
                  📋 <strong>31</strong> solicitudes procesadas
                </li>
                <li style={{ padding: '0.75rem 0' }}>
                  📈 <strong>15</strong> nuevas solicitudes recibidas
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="chart-card">
          <h3>📌 Recordatorios</h3>
          <div className="chart-placeholder">
            <div style={{ padding: '1.5rem', textAlign: 'left' }}>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <li style={{ padding: '0.75rem 0', borderBottom: '1px solid #bfd3d9' }}>
                  ⏰ <strong>{stats.vecinosPendientes}</strong> vecinos esperando aprobación
                </li>
                <li style={{ padding: '0.75rem 0', borderBottom: '1px solid #bfd3d9' }}>
                  📋 <strong>{stats.solicitudesPendientes}</strong> solicitudes por revisar
                </li>
                <li style={{ padding: '0.75rem 0', borderBottom: '1px solid #bfd3d9' }}>
                  ⏳ <strong>{stats.solicitudesEnProceso}</strong> solicitudes en proceso
                </li>
                <li style={{ padding: '0.75rem 0' }}>
                  📅 Próxima reunión de directiva: 25 de Enero
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
