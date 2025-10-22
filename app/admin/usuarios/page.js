'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function AdminUsuariosPage() {
  const [busqueda, setBusqueda] = useState('');

  // Datos de ejemplo
  const usuarios = [
    { id: 1, rut: '12.345.678-9', nombre: 'Juan González', email: 'juan@email.com', telefono: '+56 9 1234 5678', solicitudes: 3, fechaRegistro: '2025-01-15', estado: 'Activo' },
    { id: 2, rut: '98.765.432-1', nombre: 'María López', email: 'maria@email.com', telefono: '+56 9 8765 4321', solicitudes: 5, fechaRegistro: '2025-02-20', estado: 'Activo' },
    { id: 3, rut: '11.222.333-4', nombre: 'Carlos Ruiz', email: 'carlos@email.com', telefono: '+56 9 1111 2222', solicitudes: 2, fechaRegistro: '2025-03-10', estado: 'Activo' },
    { id: 4, rut: '22.333.444-5', nombre: 'Ana Torres', email: 'ana@email.com', telefono: '+56 9 3333 4444', solicitudes: 7, fechaRegistro: '2025-01-05', estado: 'Activo' },
    { id: 5, rut: '33.444.555-6', nombre: 'Pedro Soto', email: 'pedro@email.com', telefono: '+56 9 5555 6666', solicitudes: 1, fechaRegistro: '2025-04-01', estado: 'Inactivo' },
  ];

  const usuariosFiltrados = busqueda
    ? usuarios.filter(u =>
        u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        u.rut.includes(busqueda) ||
        u.email.toLowerCase().includes(busqueda.toLowerCase())
      )
    : usuarios;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Gestionar Usuarios</h1>
          <p className="page-subtitle">Administra los usuarios registrados en el sistema</p>
        </div>
      </div>

      {/* Búsqueda */}
      <div className="filters-bar">
        <input
          type="search"
          className="search-input"
          placeholder="Buscar por nombre, RUT o email..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />

        <select className="filter-select">
          <option value="">Todos los estados</option>
          <option value="activo">Activo</option>
          <option value="inactivo">Inactivo</option>
        </select>

        <button className="btn btn-primary">
          📊 Exportar Lista
        </button>
      </div>

      {/* Estadísticas rápidas */}
      <div className="quick-stats">
        <div className="quick-stat">
          <span className="quick-stat-label">Total Usuarios:</span>
          <span className="quick-stat-value">{usuarios.length}</span>
        </div>
        <div className="quick-stat active">
          <span className="quick-stat-label">Activos:</span>
          <span className="quick-stat-value">
            {usuarios.filter(u => u.estado === 'Activo').length}
          </span>
        </div>
        <div className="quick-stat inactive">
          <span className="quick-stat-label">Inactivos:</span>
          <span className="quick-stat-value">
            {usuarios.filter(u => u.estado === 'Inactivo').length}
          </span>
        </div>
        <div className="quick-stat">
          <span className="quick-stat-label">Nuevos este mes:</span>
          <span className="quick-stat-value">12</span>
        </div>
      </div>

      {/* Tabla de usuarios */}
      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>RUT</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Solicitudes</th>
              <th>Registro</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuariosFiltrados.map(usuario => (
              <tr key={usuario.id}>
                <td><code>{usuario.rut}</code></td>
                <td>{usuario.nombre}</td>
                <td><a href={`mailto:${usuario.email}`}>{usuario.email}</a></td>
                <td>{usuario.telefono}</td>
                <td>
                  <span className="badge-count">{usuario.solicitudes}</span>
                </td>
                <td>{usuario.fechaRegistro}</td>
                <td>
                  <span className={`status-badge badge-${usuario.estado.toLowerCase()}`}>
                    {usuario.estado}
                  </span>
                </td>
                <td>
                  <div className="table-actions">
                    <Link
                      href={`/admin/usuarios/${usuario.rut}`}
                      className="btn btn-secondary btn-sm"
                    >
                      Ver
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mensaje si no hay resultados */}
      {usuariosFiltrados.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h3>No se encontraron usuarios</h3>
          <p>Intenta con otros términos de búsqueda</p>
        </div>
      )}

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
