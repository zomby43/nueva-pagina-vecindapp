'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function AdminSolicitudesPage() {
  const [filtroEstado, setFiltroEstado] = useState('');

  // Datos de ejemplo
  const solicitudes = [
    { id: 'SOL-001234', usuario: 'Juan González', rut: '12.345.678-9', tipo: 'Certificado', estado: 'Pendiente', fecha: '2025-09-20' },
    { id: 'SOL-001233', usuario: 'María López', rut: '98.765.432-1', tipo: 'Certificado', estado: 'En Proceso', fecha: '2025-09-19' },
    { id: 'SOL-001232', usuario: 'Carlos Ruiz', rut: '11.222.333-4', tipo: 'Certificado', estado: 'Pendiente', fecha: '2025-09-19' },
    { id: 'SOL-001231', usuario: 'Ana Torres', rut: '22.333.444-5', tipo: 'Certificado', estado: 'Completada', fecha: '2025-09-18' },
    { id: 'SOL-001230', usuario: 'Pedro Soto', rut: '33.444.555-6', tipo: 'Certificado', estado: 'Completada', fecha: '2025-09-17' },
  ];

  const solicitudesFiltradas = filtroEstado
    ? solicitudes.filter(s => s.estado.toLowerCase() === filtroEstado.toLowerCase())
    : solicitudes;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Gestionar Solicitudes</h1>
          <p className="page-subtitle">Administra todas las solicitudes del sistema</p>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="filters-bar">
        <select
          className="filter-select"
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
        >
          <option value="">Todos los estados</option>
          <option value="Pendiente">Pendiente</option>
          <option value="En Proceso">En Proceso</option>
          <option value="Completada">Completada</option>
          <option value="Rechazada">Rechazada</option>
        </select>

        <input
          type="search"
          className="search-input"
          placeholder="Buscar por ID, usuario o RUT..."
        />

        <button className="btn btn-primary">
          🔍 Buscar
        </button>
      </div>

      {/* Estadísticas rápidas */}
      <div className="quick-stats">
        <div className="quick-stat">
          <span className="quick-stat-label">Total:</span>
          <span className="quick-stat-value">{solicitudes.length}</span>
        </div>
        <div className="quick-stat pending">
          <span className="quick-stat-label">Pendientes:</span>
          <span className="quick-stat-value">
            {solicitudes.filter(s => s.estado === 'Pendiente').length}
          </span>
        </div>
        <div className="quick-stat in-progress">
          <span className="quick-stat-label">En Proceso:</span>
          <span className="quick-stat-value">
            {solicitudes.filter(s => s.estado === 'En Proceso').length}
          </span>
        </div>
        <div className="quick-stat completed">
          <span className="quick-stat-label">Completadas:</span>
          <span className="quick-stat-value">
            {solicitudes.filter(s => s.estado === 'Completada').length}
          </span>
        </div>
      </div>

      {/* Tabla de solicitudes */}
      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID Solicitud</th>
              <th>Usuario</th>
              <th>RUT</th>
              <th>Tipo</th>
              <th>Estado</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {solicitudesFiltradas.map(solicitud => (
              <tr key={solicitud.id}>
                <td><code>{solicitud.id}</code></td>
                <td>{solicitud.usuario}</td>
                <td>{solicitud.rut}</td>
                <td>{solicitud.tipo}</td>
                <td>
                  <span className={`status-badge badge-${solicitud.estado.toLowerCase().replace(' ', '-')}`}>
                    {solicitud.estado}
                  </span>
                </td>
                <td>{solicitud.fecha}</td>
                <td>
                  <div className="table-actions">
                    <Link
                      href={`/admin/solicitudes/${solicitud.id}`}
                      className="btn btn-secondary btn-sm"
                    >
                      Ver
                    </Link>
                    {solicitud.estado === 'Pendiente' && (
                      <button className="btn btn-primary btn-sm">
                        Procesar
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="pagination">
        <button className="btn btn-secondary btn-sm" disabled>
          ← Anterior
        </button>
        <span className="pagination-info">Página 1 de 1</span>
        <button className="btn btn-secondary btn-sm" disabled>
          Siguiente →
        </button>
      </div>
    </div>
  );
}
