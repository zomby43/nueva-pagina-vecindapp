'use client';

import Link from 'next/link';

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

export default function SecretariaDashboard() {
  // Datos de ejemplo (posteriormente vendrán de la BD)
  const stats = {
    vecinosPendientes: 8,
    solicitudesPendientes: 15,
    solicitudesEnProceso: 12,
    certificadosEmitidos: 45,
    totalVecinos: 247,
    proyectosPendientes: 3,
    reservasPendientes: 2
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
        <h1 style={{ color: '#154765', fontSize: '2rem', fontWeight: 700, margin: 0 }}>Panel de Secretaría</h1>
        <p className="dashboard-subtitle" style={{ color: '#439fa4', fontSize: '1rem', margin: '0.5rem 0 0 0' }}>
          Gestión de vecinos y solicitudes de la Junta de Vecinos
        </p>
      </div>

      {/* Estadísticas Principales */}
      <div className="stats-grid admin-stats" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <StatCard
          icon="⏰"
          title="Vecinos Pendientes"
          value={stats.vecinosPendientes}
          subtitle="Requieren aprobación"
          borderColor="#fb7185"
          subtitleColor="#fbbf24"
        />

        <StatCard
          icon="📋"
          title="Solicitudes Pendientes"
          value={stats.solicitudesPendientes}
          subtitle="Por revisar"
          borderColor="#fbbf24"
          subtitleColor="#fbbf24"
        />

        <StatCard
          icon="⏳"
          title="En Proceso"
          value={stats.solicitudesEnProceso}
          borderColor="#439fa4"
        />

        <StatCard
          icon="📄"
          title="Certificados Emitidos"
          value={stats.certificadosEmitidos}
          subtitle="Este mes"
          borderColor="#34d399"
        />

        <StatCard
          icon="👥"
          title="Total Vecinos"
          value={stats.totalVecinos}
          subtitle="Activos"
          borderColor="#439fa4"
        />

        <StatCard
          icon="🏗️"
          title="Proyectos Pendientes"
          value={stats.proyectosPendientes}
          subtitle="Por revisar"
          borderColor="#fbbf24"
          subtitleColor="#fbbf24"
        />

        <StatCard
          icon="🏟️"
          title="Reservas Pendientes"
          value={stats.reservasPendientes}
          subtitle="Por aprobar"
          borderColor="#fbbf24"
          subtitleColor="#fbbf24"
        />
      </div>

      {/* Vecinos Pendientes de Aprobación */}
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
          <h2 style={{ color: '#154765', fontSize: '1.5rem', margin: 0 }}>⏰ Vecinos Pendientes de Aprobación</h2>
          <Link href="/secretaria/vecinos/aprobaciones" className="btn btn-primary btn-sm" style={{
            padding: '0.375rem 0.875rem',
            fontSize: '0.875rem',
            background: '#439fa4',
            color: 'white',
            borderRadius: '12px',
            textDecoration: 'none',
            fontWeight: 600,
            border: 'none'
          }}>
            Ver Todos
          </Link>
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
                <th style={{ fontWeight: 600, padding: '1rem', border: 'none' }}>Nombre</th>
                <th style={{ fontWeight: 600, padding: '1rem', border: 'none' }}>RUT</th>
                <th style={{ fontWeight: 600, padding: '1rem', border: 'none' }}>Dirección</th>
                <th style={{ fontWeight: 600, padding: '1rem', border: 'none' }}>Fecha Registro</th>
                <th style={{ fontWeight: 600, padding: '1rem', border: 'none' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {vecinosPendientes.map(vecino => (
                <tr key={vecino.id}>
                  <td style={{ padding: '1rem', verticalAlign: 'middle', borderColor: '#bfd3d9' }}>
                    <strong>{vecino.nombre}</strong>
                  </td>
                  <td style={{ padding: '1rem', verticalAlign: 'middle', borderColor: '#bfd3d9' }}>
                    <code style={{ background: '#bfd3d9', padding: '0.25rem 0.5rem', borderRadius: '6px', fontSize: '0.875rem' }}>
                      {vecino.rut}
                    </code>
                  </td>
                  <td style={{ padding: '1rem', verticalAlign: 'middle', borderColor: '#bfd3d9' }}>{vecino.direccion}</td>
                  <td style={{ padding: '1rem', verticalAlign: 'middle', borderColor: '#bfd3d9' }}>{vecino.fecha}</td>
                  <td style={{ padding: '1rem', verticalAlign: 'middle', borderColor: '#bfd3d9' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-success btn-sm" style={{
                        background: '#34d399',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '0.375rem 0.875rem',
                        fontSize: '0.875rem',
                        color: 'white',
                        fontWeight: 600
                      }}>✓ Aprobar</button>
                      <button className="btn btn-danger btn-sm" style={{
                        background: '#fb7185',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '0.375rem 0.875rem',
                        fontSize: '0.875rem',
                        color: 'white',
                        fontWeight: 600
                      }}>✗ Rechazar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
          <h2 style={{ color: '#154765', fontSize: '1.5rem', margin: 0 }}>📋 Solicitudes Recientes</h2>
          <Link href="/secretaria/solicitudes" className="btn btn-secondary btn-sm" style={{
            padding: '0.375rem 0.875rem',
            fontSize: '0.875rem',
            background: '#bfd3d9',
            color: '#154765',
            borderRadius: '12px',
            textDecoration: 'none',
            fontWeight: 600
          }}>
            Ver Todas
          </Link>
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
                <th style={{ fontWeight: 600, padding: '1rem', border: 'none' }}>Vecino</th>
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
                  <td style={{ padding: '1rem', verticalAlign: 'middle', borderColor: '#bfd3d9' }}>{solicitud.vecino}</td>
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
                    <Link href={`/secretaria/solicitudes/${solicitud.id}`} className="btn-link" style={{
                      color: '#439fa4',
                      textDecoration: 'none',
                      fontWeight: 600,
                      padding: '0.375rem 0.875rem',
                      borderRadius: '8px'
                    }}>
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
      <div className="admin-section" style={{
        background: 'white',
        padding: '1.5rem',
        borderRadius: '16px',
        marginBottom: '2rem'
      }}>
        <div className="section-header" style={{ marginBottom: '1rem' }}>
          <h2 style={{ color: '#154765', fontSize: '1.5rem', margin: 0 }}>⚡ Acciones Rápidas</h2>
        </div>

        <div className="actions-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
          marginTop: '1rem'
        }}>
          <Link href="/secretaria/vecinos/aprobaciones" className="action-card" style={{
            background: '#f4f8f9',
            padding: '2rem',
            borderRadius: '12px',
            textDecoration: 'none',
            transition: 'all 0.2s',
            textAlign: 'center',
            position: 'relative',
            display: 'block'
          }}>
            <div className="action-icon" style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
            <h3 style={{ color: '#154765', fontSize: '1.125rem', marginBottom: '0.5rem' }}>Aprobar Vecinos</h3>
            <p style={{ color: '#439fa4', fontSize: '0.875rem', margin: 0 }}>Revisar y aprobar nuevos registros</p>
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
                fontWeight: 'bold',
                background: '#fb7185',
                color: 'white'
              }}>
                {stats.vecinosPendientes}
              </span>
            )}
          </Link>

          <Link href="/secretaria/solicitudes" className="action-card" style={{
            background: '#f4f8f9',
            padding: '2rem',
            borderRadius: '12px',
            textDecoration: 'none',
            transition: 'all 0.2s',
            textAlign: 'center',
            position: 'relative',
            display: 'block'
          }}>
            <div className="action-icon" style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
            <h3 style={{ color: '#154765', fontSize: '1.125rem', marginBottom: '0.5rem' }}>Solicitudes Pendientes</h3>
            <p style={{ color: '#439fa4', fontSize: '0.875rem', margin: 0 }}>Revisar solicitudes por atender</p>
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
                color: '#154765',
                background: '#fbbf24'
              }}>
                {stats.solicitudesPendientes}
              </span>
            )}
          </Link>

          <Link href="/secretaria/certificados" className="action-card" style={{
            background: '#f4f8f9',
            padding: '2rem',
            borderRadius: '12px',
            textDecoration: 'none',
            transition: 'all 0.2s',
            textAlign: 'center',
            display: 'block'
          }}>
            <div className="action-icon" style={{ fontSize: '3rem', marginBottom: '1rem' }}>📄</div>
            <h3 style={{ color: '#154765', fontSize: '1.125rem', marginBottom: '0.5rem' }}>Emitir Certificado</h3>
            <p style={{ color: '#439fa4', fontSize: '0.875rem', margin: 0 }}>Generar certificados de residencia</p>
          </Link>

          <Link href="/secretaria/vecinos" className="action-card" style={{
            background: '#f4f8f9',
            padding: '2rem',
            borderRadius: '12px',
            textDecoration: 'none',
            transition: 'all 0.2s',
            textAlign: 'center',
            display: 'block'
          }}>
            <div className="action-icon" style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</div>
            <h3 style={{ color: '#154765', fontSize: '1.125rem', marginBottom: '0.5rem' }}>Gestionar Vecinos</h3>
            <p style={{ color: '#439fa4', fontSize: '0.875rem', margin: 0 }}>Ver y administrar vecinos activos</p>
          </Link>

          <Link href="/secretaria/proyectos/pendientes" className="action-card" style={{
            background: '#f4f8f9',
            padding: '2rem',
            borderRadius: '12px',
            textDecoration: 'none',
            transition: 'all 0.2s',
            textAlign: 'center',
            position: 'relative',
            display: 'block'
          }}>
            <div className="action-icon" style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏗️</div>
            <h3 style={{ color: '#154765', fontSize: '1.125rem', marginBottom: '0.5rem' }}>Proyectos Vecinales</h3>
            <p style={{ color: '#439fa4', fontSize: '0.875rem', margin: 0 }}>Revisar proyectos postulados</p>
            {stats.proyectosPendientes > 0 && (
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
                color: '#154765',
                background: '#fbbf24'
              }}>
                {stats.proyectosPendientes}
              </span>
            )}
          </Link>

          <Link href="/secretaria/reservas/pendientes" className="action-card" style={{
            background: '#f4f8f9',
            padding: '2rem',
            borderRadius: '12px',
            textDecoration: 'none',
            transition: 'all 0.2s',
            textAlign: 'center',
            position: 'relative',
            display: 'block'
          }}>
            <div className="action-icon" style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏟️</div>
            <h3 style={{ color: '#154765', fontSize: '1.125rem', marginBottom: '0.5rem' }}>Reservas de Espacios</h3>
            <p style={{ color: '#439fa4', fontSize: '0.875rem', margin: 0 }}>Aprobar solicitudes de reserva</p>
            {stats.reservasPendientes > 0 && (
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
                color: '#154765',
                background: '#fbbf24'
              }}>
                {stats.reservasPendientes}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Resumen Semanal */}
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
          <h3 style={{ color: '#154765', marginBottom: '1.5rem' }}>📊 Resumen de la Semana</h3>
          <div className="chart-placeholder" style={{
            background: '#f4f8f9',
            borderRadius: '12px'
          }}>
            <div style={{ padding: '1.5rem', textAlign: 'left' }}>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <li style={{ padding: '0.75rem 0', borderBottom: '1px solid #bfd3d9', color: '#154765' }}>
                  ✅ <strong>8</strong> vecinos aprobados
                </li>
                <li style={{ padding: '0.75rem 0', borderBottom: '1px solid #bfd3d9', color: '#154765' }}>
                  📄 <strong>23</strong> certificados emitidos
                </li>
                <li style={{ padding: '0.75rem 0', borderBottom: '1px solid #bfd3d9', color: '#154765' }}>
                  📋 <strong>31</strong> solicitudes procesadas
                </li>
                <li style={{ padding: '0.75rem 0', color: '#154765' }}>
                  📈 <strong>15</strong> nuevas solicitudes recibidas
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="chart-card" style={{
          background: 'white',
          borderRadius: '16px',
          padding: '2rem',
          boxShadow: '0 2px 8px rgba(21, 71, 101, 0.06)'
        }}>
          <h3 style={{ color: '#154765', marginBottom: '1.5rem' }}>📌 Recordatorios</h3>
          <div className="chart-placeholder" style={{
            background: '#f4f8f9',
            borderRadius: '12px'
          }}>
            <div style={{ padding: '1.5rem', textAlign: 'left' }}>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <li style={{ padding: '0.75rem 0', borderBottom: '1px solid #bfd3d9', color: '#154765' }}>
                  ⏰ <strong>{stats.vecinosPendientes}</strong> vecinos esperando aprobación
                </li>
                <li style={{ padding: '0.75rem 0', borderBottom: '1px solid #bfd3d9', color: '#154765' }}>
                  📋 <strong>{stats.solicitudesPendientes}</strong> solicitudes por revisar
                </li>
                <li style={{ padding: '0.75rem 0', borderBottom: '1px solid #bfd3d9', color: '#154765' }}>
                  ⏳ <strong>{stats.solicitudesEnProceso}</strong> solicitudes en proceso
                </li>
                <li style={{ padding: '0.75rem 0', color: '#154765' }}>
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
