'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function UserDashboard() {
  const [noticias, setNoticias] = useState([]);
  const [avisos, setAvisos] = useState([]);

  // Datos de ejemplo (posteriormente vendrán de la BD)
  const stats = {
    totalSolicitudes: 5,
    enProceso: 2,
    completadas: 3,
    pendientes: 0
  };

  useEffect(() => {
    fetchNoticiasDestacadas();
    fetchAvisosDestacados();
  }, []);

  const fetchNoticiasDestacadas = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('noticias')
        .select('id, titulo, resumen, categoria, fecha_publicacion')
        .eq('estado', 'publicado')
        .eq('destacado', true)
        .order('fecha_publicacion', { ascending: false })
        .limit(3);

      if (!error && data) {
        setNoticias(data);
      }
    } catch (error) {
      console.error('Error fetching noticias:', error);
    }
  };

  const fetchAvisosDestacados = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('avisos')
        .select('id, titulo, mensaje, tipo, prioridad, destacado, created_at')
        .eq('estado', 'activo')
        .or('destacado.eq.true,prioridad.eq.critica')
        .order('prioridad', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(3);

      if (!error && data) {
        setAvisos(data);
      }
    } catch (error) {
      console.error('Error fetching avisos:', error);
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return '';
    const date = new Date(fecha);
    const ahora = new Date();
    const diff = Math.floor((ahora - date) / 1000); // diferencia en segundos

    if (diff < 3600) return `Hace ${Math.floor(diff / 60)} minutos`;
    if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} horas`;
    if (diff < 604800) return `Hace ${Math.floor(diff / 86400)} días`;
    return date.toLocaleDateString('es-CL', { day: 'numeric', month: 'short' });
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

      {/* Widget de Avisos Importantes */}
      {avisos.length > 0 && (
        <div className="avisos-widget" style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '16px',
          marginBottom: '2rem',
          border: '2px solid #fbbf24'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ color: '#154765', fontSize: '1.5rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              📢 Avisos Importantes
            </h2>
            <Link href="/avisos" style={{
              color: '#439fa4',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: 600
            }}>
              Ver todos →
            </Link>
          </div>
          <div className="avisos-list" style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            {avisos.map((aviso) => {
              const getPrioridadColor = (prioridad) => {
                const colores = {
                  critica: '#dc2626',
                  alta: '#f59e0b',
                  media: '#3b82f6',
                  baja: '#6b7280'
                };
                return colores[aviso.prioridad] || '#6b7280';
              };

              const getTipoIcon = (tipo) => {
                const iconos = {
                  informativo: 'ℹ️',
                  urgente: '🚨',
                  mantenimiento: '🔧',
                  evento: '📅',
                  corte_servicio: '⚠️',
                  seguridad: '🔒',
                  otro: '📌'
                };
                return iconos[tipo] || '📌';
              };

              return (
                <div
                  key={aviso.id}
                  style={{
                    display: 'block',
                    padding: '1rem',
                    background: aviso.prioridad === 'critica' ? 'rgba(220, 38, 38, 0.05)' : '#f4f8f9',
                    borderRadius: '12px',
                    borderLeft: `4px solid ${getPrioridadColor(aviso.prioridad)}`,
                    transition: 'transform 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ fontSize: '2rem', flexShrink: 0 }}>
                      {getTipoIcon(aviso.tipo)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <h4 style={{ color: '#154765', fontSize: '1rem', margin: 0, fontWeight: 600 }}>
                          {aviso.titulo}
                        </h4>
                        {aviso.destacado && (
                          <span style={{
                            background: '#fbbf24',
                            color: '#78350f',
                            padding: '0.125rem 0.5rem',
                            borderRadius: '12px',
                            fontSize: '0.7rem',
                            fontWeight: 600
                          }}>
                            ⭐ Destacado
                          </span>
                        )}
                      </div>
                      <p style={{ color: '#439fa4', fontSize: '0.875rem', marginBottom: '0.5rem', lineHeight: '1.4' }}>
                        {aviso.mensaje.length > 120 ? `${aviso.mensaje.substring(0, 120)}...` : aviso.mensaje}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{
                          color: getPrioridadColor(aviso.prioridad),
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          textTransform: 'uppercase'
                        }}>
                          {aviso.prioridad === 'critica' ? '🔴 Crítico' :
                           aviso.prioridad === 'alta' ? '🟠 Alta' :
                           aviso.prioridad === 'media' ? '🟡 Media' : '⚪ Baja'}
                        </span>
                        <span style={{ color: '#bfd3d9', fontSize: '0.75rem' }}>
                          •
                        </span>
                        <span style={{ color: '#bfd3d9', fontSize: '0.75rem' }}>
                          {formatearFecha(aviso.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

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

      {/* Widget de Noticias Destacadas */}
      {noticias.length > 0 && (
        <div className="noticias-widget" style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '16px',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ color: '#154765', fontSize: '1.5rem', margin: 0 }}>
              ⭐ Noticias Destacadas
            </h2>
            <Link href="/noticias" style={{
              color: '#439fa4',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: 600
            }}>
              Ver todas →
            </Link>
          </div>
          <div className="noticias-list" style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            {noticias.map((noticia) => (
              <Link
                key={noticia.id}
                href={`/noticias/${noticia.id}`}
                style={{
                  display: 'block',
                  padding: '1rem',
                  background: '#f4f8f9',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  borderLeft: '4px solid #fbbf24',
                  transition: 'transform 0.2s'
                }}
              >
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ fontSize: '2rem', flexShrink: 0 }}>📰</div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ color: '#154765', fontSize: '1rem', marginBottom: '0.25rem', fontWeight: 600 }}>
                      {noticia.titulo}
                    </h4>
                    {noticia.resumen && (
                      <p style={{ color: '#439fa4', fontSize: '0.875rem', marginBottom: '0.25rem', lineHeight: '1.4' }}>
                        {noticia.resumen.length > 80 ? `${noticia.resumen.substring(0, 80)}...` : noticia.resumen}
                      </p>
                    )}
                    <span style={{ color: '#bfd3d9', fontSize: '0.75rem' }}>
                      {formatearFecha(noticia.fecha_publicacion)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
