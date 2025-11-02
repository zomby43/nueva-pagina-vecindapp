'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/useAuth';

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
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsuarios: 0,
    usuariosActivos: 0,
    usuariosPendientes: 0,
    usuariosVecinos: 0,
    usuariosSecretarias: 0,
    usuariosAdmins: 0,
    totalSolicitudes: 0,
    solicitudesPendientes: 0,
    solicitudesEnProceso: 0,
    solicitudesCompletadas: 0,
    solicitudesRechazadas: 0,
    totalProyectos: 0,
    totalReservas: 0,
    totalActividades: 0,
    totalNoticias: 0,
    totalAvisos: 0
  });
  const [actividadReciente, setActividadReciente] = useState([]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    const supabase = createClient();

    try {
      setLoading(true);

      // Estadísticas de usuarios
      const { count: totalUsuarios } = await supabase
        .from('usuarios')
        .select('*', { count: 'exact', head: true });

      const { count: usuariosActivos } = await supabase
        .from('usuarios')
        .select('*', { count: 'exact', head: true })
        .eq('estado', 'activo');

      const { count: usuariosPendientes } = await supabase
        .from('usuarios')
        .select('*', { count: 'exact', head: true })
        .eq('estado', 'pendiente_aprobacion');

      const { count: usuariosVecinos } = await supabase
        .from('usuarios')
        .select('*', { count: 'exact', head: true })
        .eq('rol', 'vecino');

      const { count: usuariosSecretarias } = await supabase
        .from('usuarios')
        .select('*', { count: 'exact', head: true })
        .eq('rol', 'secretaria');

      const { count: usuariosAdmins } = await supabase
        .from('usuarios')
        .select('*', { count: 'exact', head: true })
        .eq('rol', 'admin');

      // Estadísticas de solicitudes
      const { count: totalSolicitudes } = await supabase
        .from('solicitudes')
        .select('*', { count: 'exact', head: true });

      const { count: solicitudesPendientes } = await supabase
        .from('solicitudes')
        .select('*', { count: 'exact', head: true })
        .eq('estado', 'pendiente');

      const { count: solicitudesEnProceso } = await supabase
        .from('solicitudes')
        .select('*', { count: 'exact', head: true })
        .eq('estado', 'en_proceso');

      const { count: solicitudesCompletadas } = await supabase
        .from('solicitudes')
        .select('*', { count: 'exact', head: true })
        .eq('estado', 'completado');

      const { count: solicitudesRechazadas } = await supabase
        .from('solicitudes')
        .select('*', { count: 'exact', head: true })
        .eq('estado', 'rechazado');

      // Estadísticas de proyectos
      const { count: totalProyectos } = await supabase
        .from('proyectos')
        .select('*', { count: 'exact', head: true });

      // Estadísticas de reservas
      const { count: totalReservas } = await supabase
        .from('reservas')
        .select('*', { count: 'exact', head: true });

      // Estadísticas de actividades
      const { count: totalActividades } = await supabase
        .from('actividades')
        .select('*', { count: 'exact', head: true });

      // Estadísticas de noticias
      const { count: totalNoticias } = await supabase
        .from('noticias')
        .select('*', { count: 'exact', head: true });

      // Estadísticas de avisos
      const { count: totalAvisos } = await supabase
        .from('avisos')
        .select('*', { count: 'exact', head: true });

      setStats({
        totalUsuarios: totalUsuarios || 0,
        usuariosActivos: usuariosActivos || 0,
        usuariosPendientes: usuariosPendientes || 0,
        usuariosVecinos: usuariosVecinos || 0,
        usuariosSecretarias: usuariosSecretarias || 0,
        usuariosAdmins: usuariosAdmins || 0,
        totalSolicitudes: totalSolicitudes || 0,
        solicitudesPendientes: solicitudesPendientes || 0,
        solicitudesEnProceso: solicitudesEnProceso || 0,
        solicitudesCompletadas: solicitudesCompletadas || 0,
        solicitudesRechazadas: solicitudesRechazadas || 0,
        totalProyectos: totalProyectos || 0,
        totalReservas: totalReservas || 0,
        totalActividades: totalActividades || 0,
        totalNoticias: totalNoticias || 0,
        totalAvisos: totalAvisos || 0
      });

      // Actividad reciente (últimos 10 registros de múltiples tablas)
      const { data: solicitudesRecientes } = await supabase
        .from('solicitudes')
        .select(`
          id,
          tipo,
          created_at,
          usuario:usuarios!usuario_id(nombres, apellidos)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      const { data: proyectosRecientes } = await supabase
        .from('proyectos')
        .select(`
          id,
          titulo,
          created_at,
          usuario:usuarios!usuario_id(nombres, apellidos)
        `)
        .order('created_at', { ascending: false })
        .limit(3);

      const { data: usuariosRecientes } = await supabase
        .from('usuarios')
        .select('id, nombres, apellidos, created_at, rol')
        .order('created_at', { ascending: false })
        .limit(2);

      // Combinar y ordenar actividad
      const actividad = [
        ...(solicitudesRecientes || []).map(s => ({
          tipo: 'solicitud',
          titulo: `Nueva solicitud de ${s.tipo}`,
          usuario: `${s.usuario?.nombres || ''} ${s.usuario?.apellidos || ''}`.trim(),
          fecha: s.created_at,
          link: `/admin/solicitudes/${s.id}`
        })),
        ...(proyectosRecientes || []).map(p => ({
          tipo: 'proyecto',
          titulo: `Nuevo proyecto: ${p.titulo}`,
          usuario: `${p.usuario?.nombres || ''} ${p.usuario?.apellidos || ''}`.trim(),
          fecha: p.created_at,
          link: `/admin/proyectos/${p.id}`
        })),
        ...(usuariosRecientes || []).map(u => ({
          tipo: 'usuario',
          titulo: `Nuevo usuario registrado`,
          usuario: `${u.nombres || ''} ${u.apellidos || ''}`.trim(),
          fecha: u.created_at,
          link: `/admin/usuarios/${u.id}`
        }))
      ].sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).slice(0, 10);

      setActividadReciente(actividad);

    } catch (error) {
      console.error('Error al cargar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getIconoActividad = (tipo) => {
    const iconos = {
      'solicitud': 'bi-clipboard-check',
      'proyecto': 'bi-building',
      'usuario': 'bi-person-plus'
    };
    return iconos[tipo] || 'bi-circle';
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  const tasaCompletadas = stats.totalSolicitudes > 0
    ? ((stats.solicitudesCompletadas / stats.totalSolicitudes) * 100).toFixed(1)
    : 0;

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
        <h1 style={{ color: '#154765', fontSize: '2rem', fontWeight: 700, margin: 0 }}>
          <i className="bi bi-shield-check me-2"></i>Panel de Administración
        </h1>
        <p className="dashboard-subtitle" style={{ color: '#439fa4', fontSize: '1rem', margin: '0.5rem 0 0 0' }}>
          Vista general completa del sistema VecindApp
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
          icon={<i className="bi bi-people-fill"></i>}
          title="Total Usuarios"
          value={stats.totalUsuarios}
          subtitle={`${stats.usuariosActivos} activos`}
          borderColor="#439fa4"
        />

        <StatCard
          icon={<i className="bi bi-clipboard-check"></i>}
          title="Total Solicitudes"
          value={stats.totalSolicitudes}
          subtitle={`${stats.solicitudesPendientes} pendientes`}
          borderColor="#439fa4"
        />

        <StatCard
          icon={<i className="bi bi-clock"></i>}
          title="Pendientes"
          value={stats.solicitudesPendientes + stats.usuariosPendientes}
          subtitle="Requieren atención"
          borderColor="#fbbf24"
          subtitleColor="#fbbf24"
        />

        <StatCard
          icon={<i className="bi bi-hourglass-split"></i>}
          title="En Proceso"
          value={stats.solicitudesEnProceso}
          borderColor="#439fa4"
        />

        <StatCard
          icon={<i className="bi bi-check-circle"></i>}
          title="Completadas"
          value={stats.solicitudesCompletadas}
          subtitle={`${tasaCompletadas}% tasa de resolución`}
          borderColor="#34d399"
        />
      </div>

      {/* Estadísticas del Sistema */}
      <div className="row g-3 mb-4">
        <div className="col-md-12">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h5 className="card-title mb-4">
                <i className="bi bi-bar-chart me-2"></i>Estadísticas del Sistema
              </h5>
              <div className="row text-center">
                <div className="col-md-2">
                  <Link href="/admin/usuarios" className="text-decoration-none">
                    <div className="p-3 bg-primary bg-opacity-10 rounded">
                      <i className="bi bi-people-fill text-primary" style={{ fontSize: '2rem' }}></i>
                      <div className="h4 mt-2 mb-0">{stats.totalUsuarios}</div>
                      <small className="text-muted">Usuarios</small>
                    </div>
                  </Link>
                </div>
                <div className="col-md-2">
                  <Link href="/admin/solicitudes" className="text-decoration-none">
                    <div className="p-3 bg-info bg-opacity-10 rounded">
                      <i className="bi bi-file-text text-info" style={{ fontSize: '2rem' }}></i>
                      <div className="h4 mt-2 mb-0">{stats.totalSolicitudes}</div>
                      <small className="text-muted">Solicitudes</small>
                    </div>
                  </Link>
                </div>
                <div className="col-md-2">
                  <div className="p-3 bg-success bg-opacity-10 rounded">
                    <i className="bi bi-building text-success" style={{ fontSize: '2rem' }}></i>
                    <div className="h4 mt-2 mb-0">{stats.totalProyectos}</div>
                    <small className="text-muted">Proyectos</small>
                  </div>
                </div>
                <div className="col-md-2">
                  <div className="p-3 bg-warning bg-opacity-10 rounded">
                    <i className="bi bi-house-door text-warning" style={{ fontSize: '2rem' }}></i>
                    <div className="h4 mt-2 mb-0">{stats.totalReservas}</div>
                    <small className="text-muted">Reservas</small>
                  </div>
                </div>
                <div className="col-md-2">
                  <div className="p-3 bg-danger bg-opacity-10 rounded">
                    <i className="bi bi-calendar-event text-danger" style={{ fontSize: '2rem' }}></i>
                    <div className="h4 mt-2 mb-0">{stats.totalActividades}</div>
                    <small className="text-muted">Actividades</small>
                  </div>
                </div>
                <div className="col-md-2">
                  <div className="p-3 bg-secondary bg-opacity-10 rounded">
                    <i className="bi bi-newspaper text-secondary" style={{ fontSize: '2rem' }}></i>
                    <div className="h4 mt-2 mb-0">{stats.totalNoticias}</div>
                    <small className="text-muted">Noticias</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Resúmenes Básicos */}
      <div className="row g-3 mb-4">
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <h5 className="card-title mb-3">
                <i className="bi bi-person-lines-fill me-2"></i>Usuarios por Rol
              </h5>
              <ul className="list-group list-group-flush">
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  <span><i className="bi bi-people-fill text-primary me-2"></i>Vecinos</span>
                  <strong>{stats.usuariosVecinos}</strong>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  <span><i className="bi bi-person-badge text-success me-2"></i>Secretaría</span>
                  <strong>{stats.usuariosSecretarias}</strong>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  <span><i className="bi bi-shield-lock text-danger me-2"></i>Administradores</span>
                  <strong>{stats.usuariosAdmins}</strong>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  <span>Total usuarios</span>
                  <strong>{stats.totalUsuarios}</strong>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <h5 className="card-title mb-3">
                <i className="bi bi-clipboard-data me-2"></i>Estado de Solicitudes
              </h5>
              <ul className="list-group list-group-flush">
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  <span><span className="badge bg-secondary me-2">Pendiente</span>Pendientes</span>
                  <strong>{stats.solicitudesPendientes}</strong>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  <span><span className="badge bg-info me-2">Proceso</span>En proceso</span>
                  <strong>{stats.solicitudesEnProceso}</strong>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  <span><span className="badge bg-success me-2">✔</span>Completadas</span>
                  <strong>{stats.solicitudesCompletadas}</strong>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  <span><span className="badge bg-danger me-2">✖</span>Rechazadas</span>
                  <strong>{stats.solicitudesRechazadas}</strong>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  <span>Total solicitudes</span>
                  <strong>{stats.totalSolicitudes}</strong>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Actividad Reciente */}
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
          <h2 style={{ color: '#154765', fontSize: '1.5rem', margin: 0 }}>
            <i className="bi bi-clock-history me-2"></i>Actividad Reciente
          </h2>
        </div>

        {actividadReciente.length > 0 ? (
          <div className="list-group list-group-flush">
            {actividadReciente.map((item, index) => (
              <Link
                key={index}
                href={item.link}
                className="list-group-item list-group-item-action border-0"
                style={{ borderBottom: '1px solid #dee2e6' }}
              >
                <div className="d-flex align-items-center">
                  <div className="flex-shrink-0">
                    <i className={`bi ${getIconoActividad(item.tipo)} text-primary`} style={{ fontSize: '1.5rem' }}></i>
                  </div>
                  <div className="flex-grow-1 ms-3">
                    <div className="fw-semibold">{item.titulo}</div>
                    <small className="text-muted">
                      {item.usuario} - {formatFecha(item.fecha)}
                    </small>
                  </div>
                  <div className="flex-shrink-0">
                    <i className="bi bi-chevron-right text-muted"></i>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-muted">
            <i className="bi bi-inbox" style={{ fontSize: '3rem' }}></i>
            <p className="mt-2 mb-0">No hay actividad reciente</p>
          </div>
        )}
      </div>

      {/* Accesos Rápidos */}
      <div className="admin-section" style={{
        background: 'white',
        padding: '1.5rem',
        borderRadius: '16px',
        marginBottom: '2rem'
      }}>
        <div className="section-header" style={{ marginBottom: '1rem' }}>
          <h2 style={{ color: '#154765', fontSize: '1.5rem', margin: 0 }}>
            <i className="bi bi-lightning me-2"></i>Accesos Rápidos
          </h2>
        </div>

        <div className="row g-3">
          <div className="col-md-4">
            <Link href="/admin/usuarios" className="card border-0 shadow-sm text-decoration-none h-100">
              <div className="card-body text-center">
                <i className="bi bi-people-fill text-primary" style={{ fontSize: '3rem' }}></i>
                <h5 className="mt-3 mb-2">Gestionar Usuarios</h5>
                <p className="text-muted small mb-0">Administrar todos los usuarios del sistema</p>
              </div>
            </Link>
          </div>
          <div className="col-md-4">
            <Link href="/admin/solicitudes" className="card border-0 shadow-sm text-decoration-none h-100">
              <div className="card-body text-center">
                <i className="bi bi-clipboard-check text-info" style={{ fontSize: '3rem' }}></i>
                <h5 className="mt-3 mb-2">Ver Solicitudes</h5>
                <p className="text-muted small mb-0">Revisar y gestionar todas las solicitudes</p>
              </div>
            </Link>
          </div>
          <div className="col-md-4">
            <Link href="/admin/reportes" className="card border-0 shadow-sm text-decoration-none h-100">
              <div className="card-body text-center">
                <i className="bi bi-graph-up text-success" style={{ fontSize: '3rem' }}></i>
                <h5 className="mt-3 mb-2">Estadísticas</h5>
                <p className="text-muted small mb-0">Ver reportes y métricas del sistema</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Resumen */}
      <div className="row g-3">
        <div className="col-md-6">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h5 className="card-title mb-4">
                <i className="bi bi-bar-chart-line me-2"></i>Resumen de Solicitudes
              </h5>
              <ul className="list-unstyled mb-0">
                <li className="mb-3 d-flex justify-content-between align-items-center">
                  <span><i className="bi bi-circle-fill text-warning me-2" style={{ fontSize: '0.5rem' }}></i>Pendientes</span>
                  <span className="badge bg-warning">{stats.solicitudesPendientes}</span>
                </li>
                <li className="mb-3 d-flex justify-content-between align-items-center">
                  <span><i className="bi bi-circle-fill text-info me-2" style={{ fontSize: '0.5rem' }}></i>En Proceso</span>
                  <span className="badge bg-info">{stats.solicitudesEnProceso}</span>
                </li>
                <li className="d-flex justify-content-between align-items-center">
                  <span><i className="bi bi-circle-fill text-success me-2" style={{ fontSize: '0.5rem' }}></i>Completadas</span>
                  <span className="badge bg-success">{stats.solicitudesCompletadas}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h5 className="card-title mb-4">
                <i className="bi bi-people me-2"></i>Resumen de Usuarios
              </h5>
              <ul className="list-unstyled mb-0">
                <li className="mb-3 d-flex justify-content-between align-items-center">
                  <span><i className="bi bi-circle-fill text-success me-2" style={{ fontSize: '0.5rem' }}></i>Activos</span>
                  <span className="badge bg-success">{stats.usuariosActivos}</span>
                </li>
                <li className="mb-3 d-flex justify-content-between align-items-center">
                  <span><i className="bi bi-circle-fill text-warning me-2" style={{ fontSize: '0.5rem' }}></i>Pendientes</span>
                  <span className="badge bg-warning">{stats.usuariosPendientes}</span>
                </li>
                <li className="d-flex justify-content-between align-items-center">
                  <span><i className="bi bi-circle-fill text-primary me-2" style={{ fontSize: '0.5rem' }}></i>Total</span>
                  <span className="badge bg-primary">{stats.totalUsuarios}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
