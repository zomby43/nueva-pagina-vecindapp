'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const initialStats = {
  totalUsuarios: 0,
  usuariosActivos: 0,
  usuariosPendientes: 0,
  usuariosSecretaria: 0,
  usuariosAdmin: 0,
  totalSolicitudes: 0,
  solicitudesPendientes: 0,
  solicitudesEnProceso: 0,
  solicitudesCompletadas: 0,
  solicitudesRechazadas: 0,
  totalProyectos: 0,
  totalReservas: 0,
  totalActividades: 0
};

const formatNumber = (value) =>
  new Intl.NumberFormat('es-CL', { notation: 'compact' }).format(value ?? 0);

export default function ReportesPage() {
  const { user } = useAuth();
  const supabase = useMemo(() => createClient(), []);
  const [stats, setStats] = useState(initialStats);
  const [topSolicitudes, setTopSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      fetchStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError('');

      const [
        usuariosTotal,
        usuariosActivos,
        usuariosPendientes,
        usuariosSecretaria,
        usuariosAdmin,
        solicitudesTotal,
        solicitudesPendientes,
        solicitudesProceso,
        solicitudesCompletadas,
        solicitudesRechazadas,
        proyectosTotal,
        reservasTotal,
        actividadesTotal
      ] = await Promise.all([
        supabase.from('usuarios').select('*', { count: 'exact', head: true }),
        supabase.from('usuarios').select('*', { count: 'exact', head: true }).eq('estado', 'activo'),
        supabase.from('usuarios').select('*', { count: 'exact', head: true }).eq('estado', 'pendiente_aprobacion'),
        supabase.from('usuarios').select('*', { count: 'exact', head: true }).eq('rol', 'secretaria'),
        supabase.from('usuarios').select('*', { count: 'exact', head: true }).eq('rol', 'admin'),
        supabase.from('solicitudes').select('*', { count: 'exact', head: true }),
        supabase.from('solicitudes').select('*', { count: 'exact', head: true }).eq('estado', 'pendiente'),
        supabase.from('solicitudes').select('*', { count: 'exact', head: true }).eq('estado', 'en_proceso'),
        supabase.from('solicitudes').select('*', { count: 'exact', head: true }).eq('estado', 'completado'),
        supabase.from('solicitudes').select('*', { count: 'exact', head: true }).eq('estado', 'rechazado'),
        supabase.from('proyectos').select('*', { count: 'exact', head: true }),
        supabase.from('reservas').select('*', { count: 'exact', head: true }),
        supabase.from('actividades').select('*', { count: 'exact', head: true })
      ]);

      setStats({
        totalUsuarios: usuariosTotal.count || 0,
        usuariosActivos: usuariosActivos.count || 0,
        usuariosPendientes: usuariosPendientes.count || 0,
        usuariosSecretaria: usuariosSecretaria.count || 0,
        usuariosAdmin: usuariosAdmin.count || 0,
        totalSolicitudes: solicitudesTotal.count || 0,
        solicitudesPendientes: solicitudesPendientes.count || 0,
        solicitudesEnProceso: solicitudesProceso.count || 0,
        solicitudesCompletadas: solicitudesCompletadas.count || 0,
        solicitudesRechazadas: solicitudesRechazadas.count || 0,
        totalProyectos: proyectosTotal.count || 0,
        totalReservas: reservasTotal.count || 0,
        totalActividades: actividadesTotal.count || 0
      });

      const { data: recientes } = await supabase
        .from('solicitudes')
        .select('id, tipo, estado, fecha_solicitud, usuarios!inner(nombres, apellidos)')
        .order('fecha_solicitud', { ascending: false })
        .limit(6);

      setTopSolicitudes(recientes || []);
    } catch (fetchError) {
      console.error('Error cargando estadísticas de reportes:', fetchError);
      setError(fetchError.message || 'No fue posible obtener las estadísticas');
    } finally {
      setLoading(false);
    }
  };

  const formatFecha = (value) => {
    if (!value) return '—';
    try {
      return new Date(value).toLocaleDateString('es-CL', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return value;
    }
  };

  return (
    <div className="page-container" style={{ background: '#f4f8f9' }}>
      <div className="page-header">
        <div className="page-header-content">
          <div>
            <h1><i className="bi bi-graph-up me-2"></i>Estadísticas Generales</h1>
            <p className="text-muted mb-0">Resumen rápido del estado actual de la plataforma</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger d-flex justify-content-between align-items-center">
          <span>{error}</span>
          <button onClick={fetchStats} className="btn btn-sm btn-outline-danger">
            Reintentar
          </button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary mb-3" role="status"></div>
          <p>Calculando estadísticas...</p>
        </div>
      ) : (
        <>
          <section className="mb-4">
            <h2 className="h5 text-muted text-uppercase fw-semibold mb-3">Usuarios</h2>
            <div className="row g-3">
              <div className="col-sm-6 col-lg-3">
                <div className="p-3 rounded-3 bg-white shadow-sm h-100">
                  <div className="small text-muted mb-1">Total registrados</div>
                  <div className="h4 mb-0">{formatNumber(stats.totalUsuarios)}</div>
                </div>
              </div>
              <div className="col-sm-6 col-lg-3">
                <div className="p-3 rounded-3 bg-white shadow-sm h-100">
                  <div className="small text-muted mb-1">Activos</div>
                  <div className="h4 mb-0 text-success">{formatNumber(stats.usuariosActivos)}</div>
                </div>
              </div>
              <div className="col-sm-6 col-lg-3">
                <div className="p-3 rounded-3 bg-white shadow-sm h-100">
                  <div className="small text-muted mb-1">Pendientes de revisión</div>
                  <div className="h4 mb-0 text-warning">{formatNumber(stats.usuariosPendientes)}</div>
                </div>
              </div>
              <div className="col-sm-6 col-lg-3">
                <div className="p-3 rounded-3 bg-white shadow-sm h-100">
                  <div className="small text-muted mb-1">Equipo gestor (secretaría + admin)</div>
                  <div className="h4 mb-0">{formatNumber(stats.usuariosSecretaria + stats.usuariosAdmin)}</div>
                  <div className="small text-muted">
                    {stats.usuariosSecretaria} secretaria(s) · {stats.usuariosAdmin} admin(s)
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-4">
            <h2 className="h5 text-muted text-uppercase fw-semibold mb-3">Solicitudes</h2>
            <div className="row g-3">
              <div className="col-sm-6 col-lg-3">
                <div className="p-3 rounded-3 bg-white shadow-sm h-100">
                  <div className="small text-muted mb-1">Total recibidas</div>
                  <div className="h4 mb-0">{formatNumber(stats.totalSolicitudes)}</div>
                </div>
              </div>
              <div className="col-sm-6 col-lg-3">
                <div className="p-3 rounded-3 bg-white shadow-sm h-100">
                  <div className="small text-muted mb-1">Pendientes</div>
                  <div className="h4 mb-0 text-secondary">{formatNumber(stats.solicitudesPendientes)}</div>
                </div>
              </div>
              <div className="col-sm-6 col-lg-3">
                <div className="p-3 rounded-3 bg-white shadow-sm h-100">
                  <div className="small text-muted mb-1">En proceso</div>
                  <div className="h4 mb-0 text-info">{formatNumber(stats.solicitudesEnProceso)}</div>
                </div>
              </div>
              <div className="col-sm-6 col-lg-3">
                <div className="p-3 rounded-3 bg-white shadow-sm h-100">
                  <div className="small text-muted mb-1">Resueltas</div>
                  <div className="h4 mb-0 text-success">{formatNumber(stats.solicitudesCompletadas)}</div>
                  <div className="small text-muted">
                    {formatNumber(stats.solicitudesRechazadas)} rechazadas
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-4">
            <h2 className="h5 text-muted text-uppercase fw-semibold mb-3">Servicios activos</h2>
            <div className="row g-3">
              <div className="col-sm-4">
                <div className="p-3 rounded-3 bg-white shadow-sm text-center h-100">
                  <i className="bi bi-building text-primary" style={{ fontSize: '2rem' }}></i>
                  <div className="h4 mt-2 mb-0">{formatNumber(stats.totalProyectos)}</div>
                  <div className="small text-muted">Proyectos vecinales</div>
                </div>
              </div>
              <div className="col-sm-4">
                <div className="p-3 rounded-3 bg-white shadow-sm text-center h-100">
                  <i className="bi bi-calendar-event text-success" style={{ fontSize: '2rem' }}></i>
                  <div className="h4 mt-2 mb-0">{formatNumber(stats.totalActividades)}</div>
                  <div className="small text-muted">Actividades programadas</div>
                </div>
              </div>
              <div className="col-sm-4">
                <div className="p-3 rounded-3 bg-white shadow-sm text-center h-100">
                  <i className="bi bi-house-door text-warning" style={{ fontSize: '2rem' }}></i>
                  <div className="h4 mt-2 mb-0">{formatNumber(stats.totalReservas)}</div>
                  <div className="small text-muted">Reservas de espacios</div>
                </div>
              </div>
            </div>
          </section>

          <section className="card border-0 shadow-sm">
            <div className="card-body">
              <h2 className="h5 text-muted text-uppercase fw-semibold mb-3">Últimas solicitudes registradas</h2>
              {topSolicitudes.length === 0 ? (
                <p className="text-muted mb-0">No hay solicitudes recientes.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table align-middle">
                    <thead>
                      <tr>
                        <th scope="col">Solicitud</th>
                        <th scope="col">Tipo</th>
                        <th scope="col">Estado</th>
                        <th scope="col">Vecino</th>
                        <th scope="col">Fecha</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topSolicitudes.map((solicitud) => (
                        <tr key={solicitud.id}>
                          <td><code>{solicitud.id.slice(0, 8).toUpperCase()}</code></td>
                          <td className="text-capitalize">{solicitud.tipo.replace('_', ' ')}</td>
                          <td>
                            <span className={`badge bg-${ESTADO_SOLICITUD_BADGE[solicitud.estado] || 'secondary'}`}>
                              {solicitud.estado.replace('_', ' ')}
                            </span>
                          </td>
                          <td>{`${solicitud.usuarios?.nombres || ''} ${solicitud.usuarios?.apellidos || ''}`.trim() || '—'}</td>
                          <td>{formatFecha(solicitud.fecha_solicitud)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

const ESTADO_SOLICITUD_BADGE = {
  pendiente: 'secondary',
  en_proceso: 'info',
  completado: 'success',
  rechazado: 'danger'
};
