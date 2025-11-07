'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export default function UserDashboard() {
  const { user } = useAuth();
  const [noticias, setNoticias] = useState([]);
  const [avisos, setAvisos] = useState([]);
  const [proyectos, setProyectos] = useState([]);
  const [misProyectos, setMisProyectos] = useState([]);
  const [configuracion, setConfiguracion] = useState(null);
  const [contactosDirectiva, setContactosDirectiva] = useState([]);
  const [infoLoading, setInfoLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSolicitudes: 0,
    enProceso: 0,
    completadas: 0,
    pendientes: 0
  });

  useEffect(() => {
    fetchNoticiasDestacadas();
    fetchAvisosDestacados();
    fetchProyectosActivos();
    fetchInformacionJunta();
    if (user?.id) {
      fetchMisProyectos();
      fetchEstadisticasSolicitudes();
    }
  }, [user?.id]);

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

  const fetchInformacionJunta = async () => {
    try {
      setInfoLoading(true);
      const supabase = createClient();

      const { data: configData, error: configError } = await supabase
        .from('configuracion_organizacion')
        .select('*')
        .limit(1)
        .single();

      if (!configError && configData) {
        setConfiguracion(configData);
      }

      // Obtener contactos de la directiva
      const { data: contactosData, error: contactosError } = await supabase
        .from('directiva_contactos')
        .select('*')
        .eq('activo', true)
        .order('orden', { ascending: true });

      if (!contactosError && contactosData) {
        setContactosDirectiva(contactosData);
      } else {
        console.log('No se pudieron cargar contactos de directiva:', contactosError);
        // Fallback: usar usuarios con rol secretaria/admin
        const { data: usuariosData } = await supabase
          .from('usuarios')
          .select('id, nombres, apellidos, email, telefono, rol')
          .in('rol', ['secretaria', 'admin'])
          .eq('estado', 'activo')
          .order('rol', { ascending: true })
          .limit(3);

        if (usuariosData) {
          setContactosDirectiva(usuariosData.map((u, idx) => ({
            id: u.id,
            cargo: u.rol === 'admin' ? 'Admin' : 'Secretaría',
            nombre_completo: `${u.nombres} ${u.apellidos}`,
            email: u.email,
            telefono: u.telefono,
            orden: idx + 1,
            activo: true
          })));
        }
      }
    } catch (error) {
      console.error('Error cargando información institucional:', error);
    } finally {
      setInfoLoading(false);
    }
  };

  const fetchProyectosActivos = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('proyectos')
        .select('id, titulo, descripcion, presupuesto, num_beneficiarios, estado')
        .in('estado', ['aprobado', 'en_ejecucion'])
        .order('created_at', { ascending: false })
        .limit(3);

      if (!error && data) {
        setProyectos(data);
      }
    } catch (error) {
      console.error('Error fetching proyectos:', error);
    }
  };

  const fetchMisProyectos = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('proyectos')
        .select('id, titulo, estado')
        .eq('creador_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);

      if (!error && data) {
        setMisProyectos(data);
      }
    } catch (error) {
      console.error('Error fetching mis proyectos:', error);
    }
  };

  const fetchEstadisticasSolicitudes = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('solicitudes')
        .select('id, estado')
        .eq('usuario_id', user.id);

      if (error) {
        console.error('Error al obtener estadísticas de solicitudes:', error);
        return;
      }

      if (data) {
        const total = data.length;
        const pendientes = data.filter(s => s.estado === 'pendiente').length;
        const enProceso = data.filter(s => s.estado === 'en_revision' || s.estado === 'aprobada').length;
        const completadas = data.filter(s => s.estado === 'completado').length; // Corregido: 'completado' en vez de 'completada'

        console.log('Estadísticas de solicitudes:', {
          total,
          pendientes,
          enProceso,
          completadas,
          estados: data.map(s => s.estado)
        });

        setStats({
          totalSolicitudes: total,
          enProceso: enProceso,
          completadas: completadas,
          pendientes: pendientes
        });
      }
    } catch (error) {
      console.error('Error al calcular estadísticas:', error);
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

  const formatearPresupuesto = (monto) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(monto);
  };

  const formatearFechaLarga = (fecha) => {
    if (!fecha) return 'No especificado';
    try {
      return new Date(fecha).toLocaleDateString('es-CL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return fecha;
    }
  };

  const getEstadoBadge = (estado) => {
    const badges = {
      pendiente: { bg: '#fbbf24', text: '#78350f', label: 'Pendiente' },
      aprobado: { bg: '#34d399', text: '#064e3b', label: 'Aprobado' },
      rechazado: { bg: '#fb7185', text: '#881337', label: 'Rechazado' },
      en_ejecucion: { bg: '#0dcaf0', text: '#055160', label: 'En Ejecución' },
      completado: { bg: '#6b7280', text: 'white', label: 'Completado' }
    };
    return badges[estado] || badges.pendiente;
  };

  const prioridadLabels = {
    critica: 'Crítico',
    alta: 'Alta',
    media: 'Media',
    baja: 'Baja'
  };

  const prioridadIcons = {
    critica: 'bi-exclamation-octagon-fill',
    alta: 'bi-exclamation-triangle-fill',
    media: 'bi-exclamation-circle-fill',
    baja: 'bi-dot'
  };

  const getPrioridadLabel = (prioridad) => prioridadLabels[prioridad] || prioridadLabels.baja;

  const getPrioridadIcon = (prioridad) => prioridadIcons[prioridad] || prioridadIcons.baja;

  return (
    <div className="dashboard-container vecino-dashboard-container" style={{
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

      {/* Información de la Junta */}
      <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
        <div className="card-body p-4">
          <div className="d-flex flex-column flex-lg-row justify-content-between gap-4">
            <div className="flex-grow-1">
              <h2 className="h4 fw-bold mb-3" style={{ color: '#154765' }}><i className="bi bi-houses"></i> Información de tu Junta</h2>
              {infoLoading ? (
                <p className="text-muted mb-0">Cargando información institucional...</p>
              ) : configuracion ? (
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="bg-light rounded-3 p-3 h-100">
                      <h3 className="h6 text-uppercase text-muted fw-bold mb-2">Datos institucionales</h3>
                      <ul className="list-unstyled mb-0" style={{ lineHeight: 1.7 }}>
                        <li><strong>Nombre:</strong> {configuracion.nombre_organizacion}</li>
                        <li><strong>Unidad Vecinal:</strong> {configuracion.numero_unidad_vecinal || 'No registrado'}</li>
                        <li><strong>RUT:</strong> {configuracion.rut_organizacion || 'No registrado'}</li>
                        <li><strong>Personalidad Jurídica:</strong> {configuracion.numero_personalidad_juridica || 'No registrada'}</li>
                        <li><strong>Fecha constitución:</strong> {formatearFechaLarga(configuracion.fecha_constitucion)}</li>
                      </ul>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="bg-light rounded-3 p-3 h-100">
                      <h3 className="h6 text-uppercase text-muted fw-bold mb-2">Contacto</h3>
                      <ul className="list-unstyled mb-0" style={{ lineHeight: 1.7 }}>
                        <li><strong>Dirección:</strong> {configuracion.direccion || 'No registrada'}</li>
                        <li><strong>Comuna:</strong> {configuracion.comuna || 'No registrada'}, {configuracion.region || ''}</li>
                        <li><strong>Teléfono:</strong> {configuracion.telefono || 'No registrado'}</li>
                        <li><strong>Email:</strong> {configuracion.email || 'No registrado'}</li>
                        {configuracion.sitio_web && (
                          <li><strong>Sitio web:</strong> <a href={configuracion.sitio_web} target="_blank" rel="noreferrer">{configuracion.sitio_web}</a></li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-muted mb-0">Aún no se ha configurado la información institucional.</p>
              )}
            </div>

            <div className="flex-grow-1" style={{ maxWidth: '380px' }}>
              <div className="bg-white border rounded-3 p-3 h-100" style={{ borderColor: '#bfd3d9' }}>
                <h3 className="h6 text-uppercase text-muted fw-bold mb-2">Directiva y contacto</h3>
                {contactosDirectiva.length === 0 ? (
                  <p className="text-muted mb-0">No hay integrantes de la directiva registrados.</p>
                ) : (
                  <ul className="list-unstyled mb-0" style={{ lineHeight: 1.7 }}>
                    {contactosDirectiva.map((contacto) => (
                      <li key={contacto.id} className="mb-3 pb-2" style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <div className="d-flex flex-column gap-1">
                          <div>
                            <strong style={{ color: '#154765' }}>{contacto.nombre_completo}</strong>
                          </div>
                          <div>
                            <span className="badge" style={{
                              backgroundColor: '#439fa4',
                              fontSize: '0.75rem',
                              fontWeight: 500
                            }}>
                              {contacto.cargo}
                            </span>
                          </div>
                          {contacto.email && (
                            <div className="text-muted small d-flex align-items-center gap-1">
                              <i className="bi bi-envelope"></i>
                              <a href={`mailto:${contacto.email}`} style={{ color: '#6b7280', textDecoration: 'none' }}>
                                {contacto.email}
                              </a>
                            </div>
                          )}
                          {contacto.telefono && (
                            <div className="text-muted small d-flex align-items-center gap-1">
                              <i className="bi bi-telephone"></i>
                              <span style={{ color: '#6b7280' }}>
                                {contacto.telefono}
                              </span>
                            </div>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}

                {configuracion?.nombre_presidente && (
                  <div className="mt-3 p-3 bg-light rounded">
                    <strong>Presidencia:</strong>
                    <div className="small text-muted">
                      {configuracion.nombre_presidente} ({configuracion.cargo_presidente || 'Presidencia'})
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
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
          <div className="stat-icon" style={{
            fontSize: '1.5rem',
            flexShrink: 0,
            width: '3.25rem',
            height: '3.25rem',
            borderRadius: '50%',
            background: 'rgba(67, 159, 164, 0.12)',
            color: '#2d7a7f',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <i className="bi bi-clipboard-data"></i>
          </div>
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
          <div className="stat-icon" style={{
            fontSize: '1.5rem',
            flexShrink: 0,
            width: '3.25rem',
            height: '3.25rem',
            borderRadius: '50%',
            background: 'rgba(251, 191, 36, 0.15)',
            color: '#c27803',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <i className="bi bi-hourglass-split"></i>
          </div>
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
          <div className="stat-icon" style={{
            fontSize: '1.5rem',
            flexShrink: 0,
            width: '3.25rem',
            height: '3.25rem',
            borderRadius: '50%',
            background: 'rgba(52, 211, 153, 0.15)',
            color: '#0b8a66',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <i className="bi bi-check2-circle"></i>
          </div>
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
          <div className="stat-icon" style={{
            fontSize: '1.5rem',
            flexShrink: 0,
            width: '3.25rem',
            height: '3.25rem',
            borderRadius: '50%',
            background: 'rgba(251, 113, 133, 0.15)',
            color: '#cc2f52',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <i className="bi bi-clock-history"></i>
          </div>
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
              <i className="bi bi-megaphone"></i> Avisos Importantes
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
                  informativo: 'bi-info-circle',
                  urgente: 'bi-exclamation-triangle',
                  mantenimiento: 'bi-tools',
                  evento: 'bi-calendar-event',
                  corte_servicio: 'bi-cone-striped',
                  seguridad: 'bi-shield-lock',
                  otro: 'bi-pin-angle'
                };
                const iconClass = iconos[tipo] || 'bi-pin-angle';
                return (
                  <div
                    style={{
                      fontSize: '1.5rem',
                      background: '#fff',
                      color: getPrioridadColor(aviso.prioridad),
                      width: '3rem',
                      height: '3rem',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <i className={`bi ${iconClass}`}></i>
                  </div>
                );
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
                            fontWeight: 600,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem'
                          }}>
                            <i className="bi bi-star-fill"></i>
                            Destacado
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
                          textTransform: 'uppercase',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem'
                        }}>
                          <i className={`bi ${getPrioridadIcon(aviso.prioridad)}`}></i>
                          {getPrioridadLabel(aviso.prioridad)}
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

      {/* Widget de Proyectos Vecinales */}
      {(proyectos.length > 0 || misProyectos.length > 0) && (
        <div className="proyectos-widget" style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '16px',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ color: '#154765', fontSize: '1.5rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <i className="bi bi-building-gear"></i> Proyectos Vecinales
            </h2>
            <Link href="/proyectos" style={{
              color: '#439fa4',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: 600
            }}>
              Ver todos →
            </Link>
          </div>

          {/* Mis Proyectos */}
          {misProyectos.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ color: '#439fa4', fontSize: '1.125rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <i className="bi bi-clipboard-check"></i> Mis Postulaciones
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {misProyectos.map((proyecto) => {
                  const badge = getEstadoBadge(proyecto.estado);
                  return (
                    <Link
                      key={proyecto.id}
                      href={`/proyectos/${proyecto.id}`}
                      style={{
                        display: 'block',
                        padding: '1rem',
                        background: '#f4f8f9',
                        borderRadius: '12px',
                        textDecoration: 'none',
                        borderLeft: `4px solid ${badge.bg}`,
                        transition: 'transform 0.2s'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h4 style={{ color: '#154765', fontSize: '1rem', margin: 0, fontWeight: 600, flex: 1 }}>
                          {proyecto.titulo}
                        </h4>
                        <span style={{
                          background: badge.bg,
                          color: badge.text,
                          padding: '0.25rem 0.75rem',
                          borderRadius: '12px',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          flexShrink: 0,
                          marginLeft: '1rem'
                        }}>
                          {badge.label}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
              <div style={{ marginTop: '1rem' }}>
                <Link href="/proyectos/mis-postulaciones" style={{
                  color: '#439fa4',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  fontWeight: 600
                }}>
                  Ver todas mis postulaciones →
                </Link>
              </div>
            </div>
          )}

          {/* Proyectos Activos de la Comunidad */}
          {proyectos.length > 0 && (
            <div>
              <h3 style={{ color: '#439fa4', fontSize: '1.125rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <i className="bi bi-diagram-3"></i> Proyectos Activos
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {proyectos.map((proyecto) => {
                  const badge = getEstadoBadge(proyecto.estado);
                  return (
                    <Link
                      key={proyecto.id}
                      href={`/proyectos/${proyecto.id}`}
                      style={{
                        display: 'block',
                        padding: '1rem',
                        background: '#f4f8f9',
                        borderRadius: '12px',
                        textDecoration: 'none',
                        borderLeft: '4px solid #439fa4',
                        transition: 'transform 0.2s'
                      }}
                    >
                      <div style={{ marginBottom: '0.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                          <h4 style={{ color: '#154765', fontSize: '1rem', margin: 0, fontWeight: 600, flex: 1 }}>
                            {proyecto.titulo}
                          </h4>
                          <span style={{
                            background: badge.bg,
                            color: badge.text,
                            padding: '0.25rem 0.75rem',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            flexShrink: 0,
                            marginLeft: '1rem'
                          }}>
                            {badge.label}
                          </span>
                        </div>
                        <p style={{ color: '#439fa4', fontSize: '0.875rem', marginBottom: '0.5rem', lineHeight: '1.4' }}>
                          {proyecto.descripcion.length > 100 ? `${proyecto.descripcion.substring(0, 100)}...` : proyecto.descripcion}
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: '#bfd3d9' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                            <i className="bi bi-cash-stack"></i>
                            {formatearPresupuesto(proyecto.presupuesto)}
                          </span>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                            <i className="bi bi-people-fill"></i>
                            {proyecto.num_beneficiarios} beneficiarios
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Botón para postular proyecto */}
          <div style={{
            marginTop: '1.5rem',
            padding: '1rem',
            background: 'linear-gradient(135deg, #439fa4 0%, #2d7a7f 100%)',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <Link href="/proyectos/postular" style={{
              color: 'white',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '1rem'
            }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                <i className="bi bi-plus-circle"></i>
                Postular Nuevo Proyecto Vecinal
              </span>
            </Link>
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
            <div className="activity-icon" style={{
              fontSize: '2rem',
              flexShrink: 0,
              color: '#439fa4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <i className="bi bi-journal-text"></i>
            </div>
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
            <div className="activity-icon" style={{
              fontSize: '2rem',
              flexShrink: 0,
              color: '#34d399',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <i className="bi bi-check-circle-fill"></i>
            </div>
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
            <div className="activity-icon" style={{
              fontSize: '2rem',
              flexShrink: 0,
              color: '#439fa4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <i className="bi bi-clipboard2-check"></i>
            </div>
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
            <div className="action-icon" style={{
              fontSize: '3rem',
              marginBottom: '1rem',
              color: '#439fa4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <i className="bi bi-plus-circle"></i>
            </div>
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
            <div className="action-icon" style={{
              fontSize: '3rem',
              marginBottom: '1rem',
              color: '#439fa4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <i className="bi bi-clipboard-data"></i>
            </div>
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
            <div className="action-icon" style={{
              fontSize: '3rem',
              marginBottom: '1rem',
              color: '#439fa4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <i className="bi bi-person-badge"></i>
            </div>
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
            <h2 style={{ color: '#154765', fontSize: '1.5rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <i className="bi bi-star-fill"></i> Noticias Destacadas
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
                  <div style={{
                    fontSize: '2rem',
                    flexShrink: 0,
                    color: '#439fa4',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <i className="bi bi-newspaper"></i>
                  </div>
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
