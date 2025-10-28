'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import { descargarCertificado } from '@/lib/pdf/generarCertificado';

export default function SolicitudesPage() {
  const { user, userProfile } = useAuth();
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user && userProfile?.rol === 'vecino') {
      fetchSolicitudes();
    }
  }, [user, userProfile]);

  const fetchSolicitudes = async () => {
    try {
      setLoading(true);
      const supabase = createClient();

      const { data, error } = await supabase
        .from('solicitudes')
        .select(`
          id,
          tipo,
          estado,
          motivo,
          observaciones,
          fecha_solicitud,
          fecha_respuesta,
          created_at
        `)
        .eq('usuario_id', user.id)
        .order('fecha_solicitud', { ascending: false });

      if (error) {
        throw error;
      }

      setSolicitudes(data || []);
    } catch (error) {
      console.error('Error fetching solicitudes:', error);
      setError('Error al cargar las solicitudes');
    } finally {
      setLoading(false);
    }
  };

  const getEstadoBadge = (estado) => {
    switch (estado) {
      case 'completado':
        return 'bg-success';
      case 'en_proceso':
        return 'bg-warning text-dark';
      case 'rechazado':
        return 'bg-danger';
      case 'pendiente':
        return 'bg-secondary';
      default:
        return 'bg-secondary';
    }
  };

  const getEstadoTexto = (estado) => {
    switch (estado) {
      case 'completado':
        return 'Completado';
      case 'en_proceso':
        return 'En Proceso';
      case 'rechazado':
        return 'Rechazado';
      case 'pendiente':
        return 'Pendiente';
      default:
        return 'Pendiente';
    }
  };

  const getTipoTexto = (tipo) => {
    switch (tipo) {
      case 'certificado_residencia':
        return 'Certificado de Residencia';
      case 'certificado_antiguedad':
        return 'Certificado de Antigüedad';
      case 'otro':
        return 'Otro';
      default:
        return tipo;
    }
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getResumenEstadisticas = () => {
    const total = solicitudes.length;
    const completadas = solicitudes.filter(s => s.estado === 'completado').length;
    const enProceso = solicitudes.filter(s => s.estado === 'en_proceso').length;
    const pendientes = solicitudes.filter(s => s.estado === 'pendiente').length;
    const rechazadas = solicitudes.filter(s => s.estado === 'rechazado').length;

    return { total, completadas, enProceso, pendientes, rechazadas };
  };

  const stats = getResumenEstadisticas();

  if (loading) {
    return (
      <div className="page-container">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="text-center">
            <div className="spinner-border mb-3" role="status"></div>
            <p>Cargando solicitudes...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1>Mis Solicitudes</h1>
            <p className="text-muted">Gestiona tus certificados y solicitudes</p>
          </div>
          <Link href="/solicitudes/nueva" className="btn btn-primary">
            Nueva Solicitud
          </Link>
        </div>
      </div>

      <div className="solicitudes-content">
        {/* Mostrar error si existe */}
        {error && (
          <div className="alert alert-danger mb-4">
            <strong>Error:</strong> {error}
            <button 
              className="btn btn-sm btn-outline-danger ms-2"
              onClick={fetchSolicitudes}
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Resumen de solicitudes */}
        <div className="row mb-4">
          <div className="col-md-3">
            <div className="stat-card">
              <div className="stat-number">{stats.total}</div>
              <div className="stat-label">Total Solicitudes</div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="stat-card">
              <div className="stat-number text-success">{stats.completadas}</div>
              <div className="stat-label">Completadas</div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="stat-card">
              <div className="stat-number text-warning">{stats.enProceso}</div>
              <div className="stat-label">En Proceso</div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="stat-card">
              <div className="stat-number text-info">{stats.pendientes}</div>
              <div className="stat-label">Pendientes</div>
            </div>
          </div>
        </div>

        {/* Lista de solicitudes */}
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Historial de Solicitudes</h5>
            <button 
              className="btn btn-sm btn-outline-primary"
              onClick={fetchSolicitudes}
              disabled={loading}
            >
              🔄 Actualizar
            </button>
          </div>
          <div className="card-body">
            {solicitudes.length === 0 ? (
              <div className="empty-state text-center py-5">
                <div className="empty-icon mb-3" style={{ fontSize: '3rem' }}>📋</div>
                <h5>No tienes solicitudes</h5>
                <p className="text-muted">Crea tu primera solicitud de certificado</p>
                <Link href="/solicitudes/nueva" className="btn btn-primary">
                  Nueva Solicitud
                </Link>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Tipo</th>
                      <th>Motivo/Descripción</th>
                      <th>Fecha Solicitud</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {solicitudes.map((solicitud) => (
                      <tr key={solicitud.id}>
                        <td>
                          <code>#{solicitud.id.substring(0, 8)}</code>
                        </td>
                        <td>
                          <strong>{getTipoTexto(solicitud.tipo)}</strong>
                        </td>
                        <td>
                          <div>
                            <div className="fw-medium">{solicitud.motivo}</div>
                            {solicitud.observaciones && (
                              <small className="text-muted">
                                {solicitud.observaciones.length > 50 
                                  ? `${solicitud.observaciones.substring(0, 50)}...`
                                  : solicitud.observaciones
                                }
                              </small>
                            )}
                          </div>
                        </td>
                        <td>
                          <small>{formatearFecha(solicitud.fecha_solicitud)}</small>
                        </td>
                        <td>
                          <span className={`badge ${getEstadoBadge(solicitud.estado)}`}>
                            {getEstadoTexto(solicitud.estado)}
                          </span>
                        </td>
                        <td>
                          <div className="btn-group btn-group-sm">
                            <button 
                              className="btn btn-outline-primary"
                              onClick={() => {
                                // TODO: Implementar modal de detalles
                                alert(`Ver detalles de solicitud ${solicitud.id}`);
                              }}
                            >
                              Ver
                            </button>
                            {solicitud.estado === 'completado' && (
                              <button
                                className="btn btn-outline-success"
                                onClick={() => {
                                  try {
                                    descargarCertificado(solicitud, userProfile);
                                  } catch (error) {
                                    console.error('Error al generar certificado:', error);
                                    alert('Error al generar el certificado PDF');
                                  }
                                }}
                              >
                                📥 Descargar
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Información adicional */}
        <div className="row mt-4">
          <div className="col-md-6">
            <div className="info-card">
              <h6>📋 Tipos de Certificados</h6>
              <ul className="list-unstyled">
                <li>• Certificado de Residencia</li>
                <li>• Certificado de Antigüedad</li>
                <li>• Otros trámites personalizados</li>
              </ul>
            </div>
          </div>
          <div className="col-md-6">
            <div className="info-card">
              <h6>⏱️ Tiempos de Procesamiento</h6>
              <ul className="list-unstyled">
                <li>• Revisión inicial: 1-2 días hábiles</li>
                <li>• Procesamiento: 3-5 días hábiles</li>
                <li>• Entrega: Disponible en línea</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}