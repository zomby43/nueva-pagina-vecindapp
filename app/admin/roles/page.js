'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getLogsByEntidad } from '@/lib/logs/getLogs';
import Link from 'next/link';

export default function AdminRolesPage() {
  const [stats, setStats] = useState({
    vecinos: 0,
    secretarias: 0,
    admins: 0
  });
  const [cambiosRecientes, setCambiosRecientes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const supabase = createClient();

      // Obtener contadores por rol
      const { data: usuarios, error } = await supabase
        .from('usuarios')
        .select('rol');

      if (!error && usuarios) {
        const contadores = {
          vecinos: usuarios.filter(u => u.rol === 'vecino').length,
          secretarias: usuarios.filter(u => u.rol === 'secretaria').length,
          admins: usuarios.filter(u => u.rol === 'admin').length
        };
        setStats(contadores);
      }

      // Obtener historial de cambios de rol
      const { data: logs } = await getLogsByAccion('cambiar_rol', 20);
      if (logs) {
        setCambiosRecientes(logs);
      }

    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const permisosPorRol = {
    vecino: {
      nombre: 'Vecino',
      descripcion: 'Usuario estándar con acceso a servicios básicos',
      color: '#4CAF50',
      permisos: [
        { modulo: 'Solicitudes', acciones: ['Ver propias', 'Crear', 'Ver estado'] },
        { modulo: 'Certificados', acciones: ['Solicitar', 'Descargar propios'] },
        { modulo: 'Perfil', acciones: ['Ver', 'Editar propio'] },
        { modulo: 'Noticias', acciones: ['Ver publicadas'] },
        { modulo: 'Avisos', acciones: ['Ver activos'] },
        { modulo: 'Proyectos', acciones: ['Ver aprobados', 'Postular'] },
        { modulo: 'Reservas', acciones: ['Ver espacios', 'Solicitar', 'Ver propias'] },
        { modulo: 'Actividades', acciones: ['Ver publicadas', 'Inscribirse', 'Ver propias'] },
        { modulo: 'Mapa', acciones: ['Ver ubicación propia', 'Ver vecinos'] }
      ]
    },
    secretaria: {
      nombre: 'Secretaría',
      descripcion: 'Miembro de la directiva con permisos de gestión de contenido',
      color: '#FF9800',
      permisos: [
        { modulo: 'Vecinos', acciones: ['Ver todos', 'Aprobar registros', 'Ver detalles'] },
        { modulo: 'Solicitudes', acciones: ['Ver todas', 'Aprobar', 'Rechazar', 'Generar certificados'] },
        { modulo: 'Noticias', acciones: ['Crear', 'Editar', 'Eliminar', 'Publicar'] },
        { modulo: 'Avisos', acciones: ['Crear', 'Editar', 'Eliminar', 'Activar/Desactivar'] },
        { modulo: 'Proyectos', acciones: ['Ver todos', 'Aprobar', 'Rechazar', 'Cambiar estado'] },
        { modulo: 'Reservas', acciones: ['Ver todas', 'Aprobar', 'Rechazar', 'Gestionar espacios'] },
        { modulo: 'Actividades', acciones: ['Crear', 'Editar', 'Eliminar', 'Gestionar inscripciones'] },
        { modulo: 'Configuración', acciones: ['Ver', 'Editar organización'] },
        { modulo: 'Certificados', acciones: ['Emitir', 'Ver todos'] }
      ]
    },
    admin: {
      nombre: 'Administrador',
      descripcion: 'Acceso completo al sistema, gestión de usuarios y configuración avanzada',
      color: '#F44336',
      permisos: [
        { modulo: 'Usuarios', acciones: ['Ver todos', 'Crear', 'Editar', 'Eliminar', 'Cambiar rol', 'Cambiar estado'] },
        { modulo: 'Solicitudes', acciones: ['Ver todas', 'Editar', 'Eliminar', 'Cambiar estado'] },
        { modulo: 'Dashboard', acciones: ['Ver estadísticas globales', 'Ver actividad reciente'] },
        { modulo: 'Reportes', acciones: ['Ver estadísticas', 'Exportar datos'] },
        { modulo: 'Logs', acciones: ['Ver historial completo', 'Filtrar', 'Auditar'] },
        { modulo: 'Roles', acciones: ['Ver matriz de permisos', 'Ver historial cambios'] },
        { modulo: 'Configuración', acciones: ['Ver', 'Editar sistema', 'Editar organización'] },
        { modulo: 'Sistema', acciones: ['Acceso total', 'Gestión avanzada'] }
      ]
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h1>Cargando...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>👥 Gestión de Roles y Permisos</h1>
        <p className="page-subtitle">Matriz de permisos y control de acceso del sistema</p>
      </div>

      {/* Estadísticas por Rol */}
      <div className="stats-grid">
        <div className="stat-card" style={{ borderLeft: `4px solid ${permisosPorRol.vecino.color}` }}>
          <div className="stat-value">{stats.vecinos}</div>
          <div className="stat-label">👤 Vecinos</div>
        </div>

        <div className="stat-card" style={{ borderLeft: `4px solid ${permisosPorRol.secretaria.color}` }}>
          <div className="stat-value">{stats.secretarias}</div>
          <div className="stat-label">📝 Secretarías</div>
        </div>

        <div className="stat-card" style={{ borderLeft: `4px solid ${permisosPorRol.admin.color}` }}>
          <div className="stat-value">{stats.admins}</div>
          <div className="stat-label">⚙️ Administradores</div>
        </div>

        <div className="stat-card">
          <div className="stat-value">{stats.vecinos + stats.secretarias + stats.admins}</div>
          <div className="stat-label">Total Usuarios</div>
        </div>
      </div>

      {/* Descripción de Roles */}
      <div className="roles-grid">
        {Object.entries(permisosPorRol).map(([rolKey, rol]) => (
          <div key={rolKey} className="role-card">
            <div className="role-header" style={{ backgroundColor: rol.color }}>
              <h3>{rol.nombre}</h3>
            </div>
            <div className="role-body">
              <p style={{ color: '#666', marginBottom: '1rem' }}>{rol.descripcion}</p>

              <h4>Permisos:</h4>
              <div className="permisos-list">
                {rol.permisos.map((permiso, idx) => (
                  <div key={idx} className="permiso-item">
                    <strong>{permiso.modulo}:</strong>
                    <div className="acciones-list">
                      {permiso.acciones.map((accion, aidx) => (
                        <span key={aidx} className="accion-badge">
                          ✓ {accion}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Matriz de Permisos */}
      <div className="content-card">
        <h2>📊 Matriz de Permisos Resumida</h2>
        <p style={{ color: '#666', marginBottom: '1rem' }}>
          Comparación rápida de permisos entre roles
        </p>

        <div style={{ overflowX: 'auto' }}>
          <table className="permisos-table">
            <thead>
              <tr>
                <th>Módulo</th>
                <th style={{ backgroundColor: permisosPorRol.vecino.color, color: 'white' }}>
                  Vecino
                </th>
                <th style={{ backgroundColor: permisosPorRol.secretaria.color, color: 'white' }}>
                  Secretaría
                </th>
                <th style={{ backgroundColor: permisosPorRol.admin.color, color: 'white' }}>
                  Admin
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Dashboard</strong></td>
                <td>Básico</td>
                <td>Gestión</td>
                <td>Completo</td>
              </tr>
              <tr>
                <td><strong>Usuarios</strong></td>
                <td>-</td>
                <td>Ver, Aprobar</td>
                <td>CRUD Completo</td>
              </tr>
              <tr>
                <td><strong>Solicitudes</strong></td>
                <td>Propias</td>
                <td>Todas (Gestión)</td>
                <td>Todas (Admin)</td>
              </tr>
              <tr>
                <td><strong>Noticias</strong></td>
                <td>Ver</td>
                <td>CRUD Completo</td>
                <td>Ver</td>
              </tr>
              <tr>
                <td><strong>Avisos</strong></td>
                <td>Ver</td>
                <td>CRUD Completo</td>
                <td>Ver</td>
              </tr>
              <tr>
                <td><strong>Proyectos</strong></td>
                <td>Postular</td>
                <td>Aprobar/Rechazar</td>
                <td>Ver todos</td>
              </tr>
              <tr>
                <td><strong>Reservas</strong></td>
                <td>Solicitar</td>
                <td>Gestión completa</td>
                <td>Ver todas</td>
              </tr>
              <tr>
                <td><strong>Actividades</strong></td>
                <td>Inscribirse</td>
                <td>CRUD + Gestión</td>
                <td>Ver todas</td>
              </tr>
              <tr>
                <td><strong>Configuración</strong></td>
                <td>-</td>
                <td>Editar</td>
                <td>Editar</td>
              </tr>
              <tr>
                <td><strong>Logs/Auditoría</strong></td>
                <td>-</td>
                <td>-</td>
                <td>Ver completo</td>
              </tr>
              <tr>
                <td><strong>Roles</strong></td>
                <td>-</td>
                <td>-</td>
                <td>Gestión</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Historial de Cambios de Rol */}
      <div className="content-card">
        <h2>📜 Historial de Cambios de Rol</h2>
        <p style={{ color: '#666', marginBottom: '1rem' }}>
          Últimos 20 cambios de rol realizados en el sistema
        </p>

        {cambiosRecientes.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
            No hay cambios de rol registrados aún
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="historial-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Quién cambió</th>
                  <th>Usuario modificado</th>
                  <th>Cambio</th>
                </tr>
              </thead>
              <tbody>
                {cambiosRecientes.map((log) => (
                  <tr key={log.id}>
                    <td>
                      {new Date(log.created_at).toLocaleString('es-CL', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td>
                      <strong>{log.usuario_nombre || 'Sistema'}</strong>
                      <br />
                      <small style={{ color: '#666' }}>{log.usuario_email}</small>
                    </td>
                    <td>
                      {log.detalles?.usuario_modificado || 'N/A'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className="role-badge" style={{ backgroundColor: permisosPorRol[log.detalles?.rol_anterior]?.color || '#999' }}>
                          {log.detalles?.rol_anterior}
                        </span>
                        <span>→</span>
                        <span className="role-badge" style={{ backgroundColor: permisosPorRol[log.detalles?.rol_nuevo]?.color || '#999' }}>
                          {log.detalles?.rol_nuevo}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <Link href="/admin/logs?accion=cambiar_rol" className="btn btn-secondary btn-sm">
            Ver historial completo →
          </Link>
        </div>
      </div>

      {/* Acciones Rápidas */}
      <div className="content-card">
        <h2>⚡ Acciones Rápidas</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
          <Link href="/admin/usuarios" className="action-card">
            <div className="action-icon">👥</div>
            <div className="action-content">
              <h4>Gestionar Usuarios</h4>
              <p>Ver y editar todos los usuarios del sistema</p>
            </div>
          </Link>

          <Link href="/admin/logs" className="action-card">
            <div className="action-icon">📜</div>
            <div className="action-content">
              <h4>Ver Logs Completos</h4>
              <p>Auditoría detallada de todas las acciones</p>
            </div>
          </Link>

          <Link href="/admin/configuracion" className="action-card">
            <div className="action-icon">⚙️</div>
            <div className="action-content">
              <h4>Configuración</h4>
              <p>Ajustes del sistema y organización</p>
            </div>
          </Link>
        </div>
      </div>

      <style jsx>{`
        .roles-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 1.5rem;
          margin: 2rem 0;
        }

        .role-card {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .role-header {
          padding: 1.5rem;
          color: white;
        }

        .role-header h3 {
          margin: 0;
          font-size: 1.5rem;
        }

        .role-body {
          padding: 1.5rem;
        }

        .permisos-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .permiso-item {
          padding: 0.5rem;
          background: #f9f9f9;
          border-radius: 6px;
        }

        .acciones-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }

        .accion-badge {
          background: white;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.85rem;
          border: 1px solid #ddd;
        }

        .permisos-table, .historial-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 1rem;
        }

        .permisos-table th, .permisos-table td,
        .historial-table th, .historial-table td {
          padding: 0.75rem;
          text-align: left;
          border-bottom: 1px solid #eee;
        }

        .permisos-table th, .historial-table th {
          background: #f5f5f5;
          font-weight: 600;
        }

        .permisos-table tbody tr:hover,
        .historial-table tbody tr:hover {
          background: #f9f9f9;
        }

        .role-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 4px;
          color: white;
          font-weight: 600;
          font-size: 0.85rem;
        }

        .action-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.5rem;
          background: white;
          border: 2px solid #eee;
          border-radius: 8px;
          text-decoration: none;
          color: inherit;
          transition: all 0.2s;
        }

        .action-card:hover {
          border-color: #439fa4;
          box-shadow: 0 4px 12px rgba(67, 159, 164, 0.2);
        }

        .action-icon {
          font-size: 2.5rem;
        }

        .action-content h4 {
          margin: 0 0 0.25rem 0;
          color: #439fa4;
        }

        .action-content p {
          margin: 0;
          font-size: 0.9rem;
          color: #666;
        }
      `}</style>
    </div>
  );
}
