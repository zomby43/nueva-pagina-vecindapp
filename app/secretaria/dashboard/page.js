'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/useAuth';

// Componente para tarjeta de estadística con estilos inline
const StatCard = ({
  icon,
  title,
  value,
  subtitle,
  borderColor = '#439fa4',
  subtitleColor = '#34d399',
  iconBg = 'rgba(67, 159, 164, 0.12)',
  iconColor = '#2d7a7f'
}) => (
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
    <div
      className="stat-icon"
      style={{
        fontSize: '1.5rem',
        flexShrink: 0,
        background: iconBg,
        color: iconColor,
        width: '3.25rem',
        height: '3.25rem',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      {icon}
    </div>
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
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    vecinosPendientes: 0,
    solicitudesPendientes: 0,
    solicitudesEnProceso: 0,
    certificadosEmitidos: 0,
    totalVecinos: 0,
    proyectosPendientes: 0,
    reservasPendientes: 0,
    actividadesPendientes: 0
  });
  const [vecinosPendientes, setVecinosPendientes] = useState([]);
  const [solicitudesRecientes, setSolicitudesRecientes] = useState([]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    const supabase = createClient();

    try {
      setLoading(true);

      // 1. Contar vecinos pendientes de aprobación
      const { count: vecinosPendientesCount } = await supabase
        .from('usuarios')
        .select('*', { count: 'exact', head: true })
        .eq('estado', 'pendiente_aprobacion');

      // 2. Contar solicitudes pendientes
      const { count: solicitudesPendientesCount } = await supabase
        .from('solicitudes')
        .select('*', { count: 'exact', head: true })
        .eq('estado', 'pendiente');

      // 3. Contar solicitudes en proceso
      const { count: solicitudesEnProcesoCount } = await supabase
        .from('solicitudes')
        .select('*', { count: 'exact', head: true })
        .eq('estado', 'en_proceso');

      // 4. Contar certificados emitidos este mes
      const primerDiaMes = new Date();
      primerDiaMes.setDate(1);
      primerDiaMes.setHours(0, 0, 0, 0);

      const { count: certificadosEmitidosCount } = await supabase
        .from('solicitudes')
        .select('*', { count: 'exact', head: true })
        .eq('estado', 'completado')
        .gte('updated_at', primerDiaMes.toISOString());

      // 5. Contar total de vecinos activos
      const { count: totalVecinosCount } = await supabase
        .from('usuarios')
        .select('*', { count: 'exact', head: true })
        .eq('rol', 'vecino')
        .eq('estado', 'activo');

      // 6. Contar proyectos pendientes
      const { count: proyectosPendientesCount } = await supabase
        .from('proyectos')
        .select('*', { count: 'exact', head: true })
        .eq('estado', 'pendiente');

      // 7. Contar reservas pendientes
      const { count: reservasPendientesCount } = await supabase
        .from('reservas')
        .select('*', { count: 'exact', head: true })
        .eq('estado', 'pendiente');

      // 8. Contar inscripciones de actividades pendientes
      const { count: actividadesPendientesCount } = await supabase
        .from('inscripciones_actividades')
        .select('*', { count: 'exact', head: true })
        .eq('estado', 'pendiente');

      // Actualizar estadísticas
      setStats({
        vecinosPendientes: vecinosPendientesCount || 0,
        solicitudesPendientes: solicitudesPendientesCount || 0,
        solicitudesEnProceso: solicitudesEnProcesoCount || 0,
        certificadosEmitidos: certificadosEmitidosCount || 0,
        totalVecinos: totalVecinosCount || 0,
        proyectosPendientes: proyectosPendientesCount || 0,
        reservasPendientes: reservasPendientesCount || 0,
        actividadesPendientes: actividadesPendientesCount || 0
      });

      // 9. Obtener últimos 3 vecinos pendientes
      const { data: vecinosData } = await supabase
        .from('usuarios')
        .select('id, nombres, apellidos, rut, direccion, created_at')
        .eq('estado', 'pendiente_aprobacion')
        .order('created_at', { ascending: false })
        .limit(3);

      setVecinosPendientes(vecinosData || []);

      // 10. Obtener últimas 3 solicitudes
      const { data: solicitudesData } = await supabase
        .from('solicitudes')
        .select(`
          id,
          tipo,
          estado,
          created_at,
          usuario_id,
          usuario:usuarios!usuario_id(nombres, apellidos)
        `)
        .order('created_at', { ascending: false })
        .limit(3);

      setSolicitudesRecientes(solicitudesData || []);

    } catch (error) {
      console.error('Error al cargar datos del dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const getTipoLabel = (tipo) => {
    const tipos = {
      'residencia': 'Certificado de Residencia',
      'antiguedad': 'Certificado de Antigüedad'
    };
    return tipos[tipo] || tipo;
  };

  const getEstadoLabel = (estado) => {
    const estados = {
      'pendiente': 'Pendiente',
      'en_proceso': 'En Proceso',
      'completado': 'Completado',
      'rechazado': 'Rechazado'
    };
    return estados[estado] || estado;
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
          icon={<i className="bi bi-alarm-fill"></i>}
          title="Vecinos Pendientes"
          value={stats.vecinosPendientes}
          subtitle="Requieren aprobación"
          borderColor="#fb7185"
          subtitleColor="#fbbf24"
          iconBg="rgba(251, 113, 133, 0.12)"
          iconColor="#cc2f52"
        />

        <StatCard
          icon={<i className="bi bi-clipboard-data"></i>}
          title="Solicitudes Pendientes"
          value={stats.solicitudesPendientes}
          subtitle="Por revisar"
          borderColor="#fbbf24"
          subtitleColor="#fbbf24"
          iconBg="rgba(251, 191, 36, 0.12)"
          iconColor="#c27803"
        />

        <StatCard
          icon={<i className="bi bi-hourglass-split"></i>}
          title="En Proceso"
          value={stats.solicitudesEnProceso}
          borderColor="#439fa4"
          iconBg="rgba(67, 159, 164, 0.12)"
          iconColor="#2d7a7f"
        />

        <StatCard
          icon={<i className="bi bi-file-earmark-text"></i>}
          title="Certificados Emitidos"
          value={stats.certificadosEmitidos}
          subtitle="Este mes"
          borderColor="#34d399"
          iconBg="rgba(52, 211, 153, 0.12)"
          iconColor="#0b8a66"
        />

        <StatCard
          icon={<i className="bi bi-people-fill"></i>}
          title="Total Vecinos"
          value={stats.totalVecinos}
          subtitle="Activos"
          borderColor="#439fa4"
          iconBg="rgba(67, 159, 164, 0.12)"
          iconColor="#2d7a7f"
        />

        <StatCard
          icon={<i className="bi bi-diagram-3"></i>}
          title="Proyectos Pendientes"
          value={stats.proyectosPendientes}
          subtitle="Por revisar"
          borderColor="#fbbf24"
          subtitleColor="#fbbf24"
          iconBg="rgba(251, 191, 36, 0.12)"
          iconColor="#c27803"
        />

        <StatCard
          icon={<i className="bi bi-calendar-event"></i>}
          title="Reservas Pendientes"
          value={stats.reservasPendientes}
          subtitle="Por aprobar"
          borderColor="#fbbf24"
          subtitleColor="#fbbf24"
          iconBg="rgba(251, 191, 36, 0.12)"
          iconColor="#c27803"
        />

        <StatCard
          icon={<i className="bi bi-bullseye"></i>}
          title="Inscripciones Pendientes"
          value={stats.actividadesPendientes}
          subtitle="Actividades"
          borderColor="#fbbf24"
          subtitleColor="#fbbf24"
          iconBg="rgba(251, 191, 36, 0.12)"
          iconColor="#c27803"
        />
      </div>

      {/* Vecinos Pendientes de Aprobación */}
      {vecinosPendientes.length > 0 && (
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
              <i className="bi bi-alarm-fill me-2 text-danger"></i>
              Vecinos Pendientes de Aprobación
            </h2>
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
                      <strong>{vecino.nombres} {vecino.apellidos}</strong>
                    </td>
                    <td style={{ padding: '1rem', verticalAlign: 'middle', borderColor: '#bfd3d9' }}>
                      <code style={{ background: '#bfd3d9', padding: '0.25rem 0.5rem', borderRadius: '6px', fontSize: '0.875rem' }}>
                        {vecino.rut}
                      </code>
                    </td>
                    <td style={{ padding: '1rem', verticalAlign: 'middle', borderColor: '#bfd3d9' }}>{vecino.direccion}</td>
                    <td style={{ padding: '1rem', verticalAlign: 'middle', borderColor: '#bfd3d9' }}>{formatFecha(vecino.created_at)}</td>
                    <td style={{ padding: '1rem', verticalAlign: 'middle', borderColor: '#bfd3d9' }}>
                      <Link href="/secretaria/vecinos/aprobaciones" className="btn btn-primary btn-sm" style={{
                        background: '#439fa4',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '0.375rem 0.875rem',
                        fontSize: '0.875rem',
                        color: 'white',
                        fontWeight: 600,
                        textDecoration: 'none'
                      }}>Revisar</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Solicitudes Recientes */}
      {solicitudesRecientes.length > 0 && (
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
            <i className="bi bi-clipboard-data me-2 text-primary"></i>
            Solicitudes Recientes
          </h2>
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
                        {solicitud.id.substring(0, 8)}
                      </code>
                    </td>
                    <td style={{ padding: '1rem', verticalAlign: 'middle', borderColor: '#bfd3d9' }}>{solicitud.usuario?.nombres} {solicitud.usuario?.apellidos}</td>
                    <td style={{ padding: '1rem', verticalAlign: 'middle', borderColor: '#bfd3d9' }}>{getTipoLabel(solicitud.tipo)}</td>
                    <td style={{ padding: '1rem', verticalAlign: 'middle', borderColor: '#bfd3d9' }}>
                      <span className={`status-badge badge-${solicitud.estado}`} style={{
                        display: 'inline-block',
                        padding: '0.375rem 0.875rem',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        background: solicitud.estado === 'pendiente' ? 'rgba(251, 191, 36, 0.2)' :
                                    solicitud.estado === 'en_proceso' ? 'rgba(67, 159, 164, 0.2)' :
                                    solicitud.estado === 'completado' ? 'rgba(52, 211, 153, 0.2)' : 'rgba(251, 113, 133, 0.2)',
                        color: solicitud.estado === 'pendiente' ? '#fbbf24' :
                               solicitud.estado === 'en_proceso' ? '#439fa4' :
                               solicitud.estado === 'completado' ? '#34d399' : '#fb7185'
                      }}>
                        {getEstadoLabel(solicitud.estado)}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', verticalAlign: 'middle', borderColor: '#bfd3d9' }}>{formatFecha(solicitud.created_at)}</td>
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
      )}

      {/* Acciones Rápidas */}
      <div className="admin-section" style={{
        background: 'white',
        padding: '1.5rem',
        borderRadius: '16px',
        marginBottom: '2rem'
      }}>
        <div className="section-header" style={{ marginBottom: '1rem' }}>
          <h2 style={{ color: '#154765', fontSize: '1.5rem', margin: 0 }}>
            <i className="bi bi-lightning-charge-fill me-2 text-warning"></i>
            Acciones Rápidas
          </h2>
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
            <div className="action-icon" style={{ color: '#0b8a66', background: 'rgba(52, 211, 153, 0.15)' }}>
              <i className="bi bi-person-check-fill"></i>
            </div>
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
            <div className="action-icon" style={{ color: '#c27803', background: 'rgba(251, 191, 36, 0.18)' }}>
              <i className="bi bi-clipboard-check"></i>
            </div>
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
            <div className="action-icon" style={{ color: '#2d7a7f', background: 'rgba(67, 159, 164, 0.18)' }}>
              <i className="bi bi-file-earmark-plus"></i>
            </div>
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
            <div className="action-icon" style={{ color: '#154765', background: 'rgba(21, 71, 101, 0.18)' }}>
              <i className="bi bi-people"></i>
            </div>
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
            <div className="action-icon" style={{ color: '#c27803', background: 'rgba(251, 191, 36, 0.18)' }}>
              <i className="bi bi-diagram-3"></i>
            </div>
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
            <div className="action-icon" style={{ color: '#c27803', background: 'rgba(251, 191, 36, 0.18)' }}>
              <i className="bi bi-calendar2-event"></i>
            </div>
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

          <Link href="/secretaria/actividades/inscripciones" className="action-card" style={{
            background: '#f4f8f9',
            padding: '2rem',
            borderRadius: '12px',
            textDecoration: 'none',
            transition: 'all 0.2s',
            textAlign: 'center',
            position: 'relative',
            display: 'block'
          }}>
            <div className="action-icon" style={{ color: '#0b8a66', background: 'rgba(52, 211, 153, 0.15)' }}>
              <i className="bi bi-bullseye"></i>
            </div>
            <h3 style={{ color: '#154765', fontSize: '1.125rem', marginBottom: '0.5rem' }}>Inscripciones Actividades</h3>
            <p style={{ color: '#439fa4', fontSize: '0.875rem', margin: 0 }}>Aprobar inscripciones pendientes</p>
            {stats.actividadesPendientes > 0 && (
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
                {stats.actividadesPendientes}
              </span>
            )}
          </Link>

          <Link href="/secretaria/noticias" className="action-card" style={{
            background: '#f4f8f9',
            padding: '2rem',
            borderRadius: '12px',
            textDecoration: 'none',
            transition: 'all 0.2s',
            textAlign: 'center',
            display: 'block'
          }}>
            <div className="action-icon" style={{ color: '#2d7a7f', background: 'rgba(67, 159, 164, 0.18)' }}>
              <i className="bi bi-newspaper"></i>
            </div>
            <h3 style={{ color: '#154765', fontSize: '1.125rem', marginBottom: '0.5rem' }}>Gestionar Noticias</h3>
            <p style={{ color: '#439fa4', fontSize: '0.875rem', margin: 0 }}>Publicar y editar noticias</p>
          </Link>
        </div>
      </div>

      {/* Resumen */}
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
          <h3 style={{ color: '#154765', marginBottom: '1.5rem' }}>
            <i className="bi bi-bar-chart-fill me-2 text-primary"></i>
            Resumen General
          </h3>
          <div className="chart-placeholder" style={{
            background: '#f4f8f9',
            borderRadius: '12px'
          }}>
            <div style={{ padding: '1.5rem', textAlign: 'left' }}>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <li style={{ padding: '0.75rem 0', borderBottom: '1px solid #bfd3d9', color: '#154765', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <i className="bi bi-people-fill text-primary"></i>
                  <span><strong>{stats.totalVecinos}</strong> vecinos activos</span>
                </li>
                <li style={{ padding: '0.75rem 0', borderBottom: '1px solid #bfd3d9', color: '#154765', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <i className="bi bi-file-earmark-text text-success"></i>
                  <span><strong>{stats.certificadosEmitidos}</strong> certificados emitidos este mes</span>
                </li>
                <li style={{ padding: '0.75rem 0', borderBottom: '1px solid #bfd3d9', color: '#154765', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <i className="bi bi-clipboard-data text-warning"></i>
                  <span><strong>{stats.solicitudesPendientes + stats.solicitudesEnProceso}</strong> solicitudes activas</span>
                </li>
                <li style={{ padding: '0.75rem 0', color: '#154765', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <i className="bi bi-diagram-3 text-info"></i>
                  <span><strong>{stats.proyectosPendientes}</strong> proyectos pendientes de revisión</span>
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
          <h3 style={{ color: '#154765', marginBottom: '1.5rem' }}>
            <i className="bi bi-pin-angle-fill me-2 text-danger"></i>
            Recordatorios
          </h3>
          <div className="chart-placeholder" style={{
            background: '#f4f8f9',
            borderRadius: '12px'
          }}>
            <div style={{ padding: '1.5rem', textAlign: 'left' }}>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {stats.vecinosPendientes > 0 && (
                  <li style={{ padding: '0.75rem 0', borderBottom: '1px solid #bfd3d9', color: '#154765', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <i className="bi bi-alarm-fill text-danger"></i>
                    <span><strong>{stats.vecinosPendientes}</strong> vecinos esperando aprobación</span>
                  </li>
                )}
                {stats.solicitudesPendientes > 0 && (
                  <li style={{ padding: '0.75rem 0', borderBottom: '1px solid #bfd3d9', color: '#154765', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <i className="bi bi-clipboard-check text-warning"></i>
                    <span><strong>{stats.solicitudesPendientes}</strong> solicitudes por revisar</span>
                  </li>
                )}
                {stats.proyectosPendientes > 0 && (
                  <li style={{ padding: '0.75rem 0', borderBottom: '1px solid #bfd3d9', color: '#154765', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <i className="bi bi-diagram-3 text-warning"></i>
                    <span><strong>{stats.proyectosPendientes}</strong> proyectos por evaluar</span>
                  </li>
                )}
                {stats.reservasPendientes > 0 && (
                  <li style={{ padding: '0.75rem 0', borderBottom: '1px solid #bfd3d9', color: '#154765', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <i className="bi bi-calendar2-event text-warning"></i>
                    <span><strong>{stats.reservasPendientes}</strong> reservas por aprobar</span>
                  </li>
                )}
                {stats.actividadesPendientes > 0 && (
                  <li style={{ padding: '0.75rem 0', color: '#154765', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <i className="bi bi-bullseye text-success"></i>
                    <span><strong>{stats.actividadesPendientes}</strong> inscripciones a actividades por revisar</span>
                  </li>
                )}
                {stats.vecinosPendientes === 0 && stats.solicitudesPendientes === 0 && stats.proyectosPendientes === 0 && stats.reservasPendientes === 0 && stats.actividadesPendientes === 0 && (
                  <li style={{ padding: '0.75rem 0', color: '#34d399', textAlign: 'center' }}>
                    ✅ ¡Todo al día! No hay tareas pendientes
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
