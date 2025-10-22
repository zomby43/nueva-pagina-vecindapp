'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function SolicitudesPage() {
  const [solicitudes] = useState([
    {
      id: 1,
      tipo: 'Certificado de Residencia',
      fecha: '2024-10-01',
      estado: 'completado',
      descripcion: 'Certificado para trámites bancarios'
    },
    {
      id: 2,
      tipo: 'Certificado de Residencia',
      fecha: '2024-09-15',
      estado: 'en_proceso',
      descripcion: 'Certificado para inscripción universidad'
    },
    {
      id: 3,
      tipo: 'Certificado de Residencia',
      fecha: '2024-08-20',
      estado: 'completado',
      descripcion: 'Certificado para seguro de salud'
    }
  ]);

  const getEstadoBadge = (estado) => {
    switch (estado) {
      case 'completado':
        return 'bg-success';
      case 'en_proceso':
        return 'bg-warning';
      case 'rechazado':
        return 'bg-danger';
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
      default:
        return 'Pendiente';
    }
  };

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
        {/* Resumen de solicitudes */}
        <div className="row mb-4">
          <div className="col-md-3">
            <div className="stat-card">
              <div className="stat-number">3</div>
              <div className="stat-label">Total Solicitudes</div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="stat-card">
              <div className="stat-number text-success">2</div>
              <div className="stat-label">Completadas</div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="stat-card">
              <div className="stat-number text-warning">1</div>
              <div className="stat-label">En Proceso</div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="stat-card">
              <div className="stat-number text-danger">0</div>
              <div className="stat-label">Rechazadas</div>
            </div>
          </div>
        </div>

        {/* Lista de solicitudes */}
        <div className="card">
          <div className="card-header">
            <h5 className="mb-0">Historial de Solicitudes</h5>
          </div>
          <div className="card-body">
            {solicitudes.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📋</div>
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
                      <th>Descripción</th>
                      <th>Fecha</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {solicitudes.map((solicitud) => (
                      <tr key={solicitud.id}>
                        <td>#{solicitud.id.toString().padStart(4, '0')}</td>
                        <td>{solicitud.tipo}</td>
                        <td>{solicitud.descripcion}</td>
                        <td>{new Date(solicitud.fecha).toLocaleDateString('es-CL')}</td>
                        <td>
                          <span className={`badge ${getEstadoBadge(solicitud.estado)}`}>
                            {getEstadoTexto(solicitud.estado)}
                          </span>
                        </td>
                        <td>
                          <div className="btn-group btn-group-sm">
                            <Link 
                              href={`/solicitudes/${solicitud.id}`} 
                              className="btn btn-outline-primary"
                            >
                              Ver
                            </Link>
                            {solicitud.estado === 'completado' && (
                              <button className="btn btn-outline-success">
                                Descargar
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
                <li>• Certificado de Domicilio</li>
                <li>• Certificado de Vecindad</li>
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