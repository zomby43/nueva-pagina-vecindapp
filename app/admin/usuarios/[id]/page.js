'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

export default function AdminUsuarioDetallePage() {
  const params = useParams();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);

  // Datos de ejemplo
  const [usuario, setUsuario] = useState({
    rut: params.id,
    nombres: 'Juan Carlos',
    apellidos: 'González Martínez',
    email: 'juan.gonzalez@email.com',
    telefono: '+56 9 8765 4321',
    direccion: 'Av. Las Condes 1234, Departamento 501',
    estado: 'Activo',
    fechaRegistro: '15 de Enero, 2025',
    verificado: true
  });

  const solicitudes = [
    { id: 'SOL-001234', tipo: 'Certificado', estado: 'En Proceso', fecha: '2025-09-20' },
    { id: 'SOL-001220', tipo: 'Certificado', estado: 'Completada', fecha: '2025-09-10' },
    { id: 'SOL-001205', tipo: 'Certificado', estado: 'Completada', fecha: '2025-09-01' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUsuario(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    console.log('Guardar usuario:', usuario);
    // TODO: Implementar actualización
    alert('Usuario actualizado exitosamente');
    setIsEditing(false);
  };

  const handleToggleEstado = () => {
    const nuevoEstado = usuario.estado === 'Activo' ? 'Inactivo' : 'Activo';
    setUsuario(prev => ({ ...prev, estado: nuevoEstado }));
    alert(`Usuario marcado como ${nuevoEstado}`);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Detalle de Usuario</h1>
          <p className="page-subtitle">{usuario.rut}</p>
        </div>
        <button onClick={() => router.back()} className="btn btn-secondary">
          ← Volver
        </button>
      </div>

      <div className="admin-detail-grid">
        {/* Información Personal */}
        <div className="detail-card">
          <div className="detail-header">
            <h2>👤 Información Personal</h2>
            <div className="header-actions">
              {!isEditing && (
                <button onClick={() => setIsEditing(true)} className="btn btn-secondary btn-sm">
                  ✏️ Editar
                </button>
              )}
            </div>
          </div>

          {isEditing ? (
            <div className="edit-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Nombres</label>
                  <input
                    type="text"
                    name="nombres"
                    value={usuario.nombres}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Apellidos</label>
                  <input
                    type="text"
                    name="apellidos"
                    value={usuario.apellidos}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={usuario.email}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Teléfono</label>
                <input
                  type="tel"
                  name="telefono"
                  value={usuario.telefono}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Dirección</label>
                <input
                  type="text"
                  name="direccion"
                  value={usuario.direccion}
                  onChange={handleChange}
                />
              </div>

              <div className="form-actions">
                <button onClick={handleSave} className="btn btn-primary">
                  Guardar Cambios
                </button>
                <button onClick={() => setIsEditing(false)} className="btn btn-secondary">
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div className="detail-grid">
              <div className="detail-item">
                <label>Nombre Completo:</label>
                <span>{usuario.nombres} {usuario.apellidos}</span>
              </div>
              <div className="detail-item">
                <label>RUT:</label>
                <span><code>{usuario.rut}</code></span>
              </div>
              <div className="detail-item">
                <label>Email:</label>
                <span><a href={`mailto:${usuario.email}`}>{usuario.email}</a></span>
              </div>
              <div className="detail-item">
                <label>Teléfono:</label>
                <span><a href={`tel:${usuario.telefono}`}>{usuario.telefono}</a></span>
              </div>
              <div className="detail-item full-width">
                <label>Dirección:</label>
                <span>{usuario.direccion}</span>
              </div>
            </div>
          )}
        </div>

        {/* Estado y Verificación */}
        <div className="detail-card">
          <h2>⚙️ Estado de la Cuenta</h2>
          <div className="detail-grid">
            <div className="detail-item">
              <label>Estado:</label>
              <span className={`status-badge badge-${usuario.estado.toLowerCase()}`}>
                {usuario.estado}
              </span>
            </div>
            <div className="detail-item">
              <label>Verificado:</label>
              <span>{usuario.verificado ? '✅ Sí' : '❌ No'}</span>
            </div>
            <div className="detail-item full-width">
              <label>Fecha de Registro:</label>
              <span>{usuario.fechaRegistro}</span>
            </div>
          </div>

          <div className="card-actions">
            <button onClick={handleToggleEstado} className="btn btn-secondary">
              {usuario.estado === 'Activo' ? 'Desactivar Usuario' : 'Activar Usuario'}
            </button>
          </div>
        </div>
      </div>

      {/* Solicitudes del Usuario */}
      <div className="detail-card">
        <h2>📋 Historial de Solicitudes</h2>
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tipo</th>
                <th>Estado</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {solicitudes.map(solicitud => (
                <tr key={solicitud.id}>
                  <td><code>{solicitud.id}</code></td>
                  <td>{solicitud.tipo}</td>
                  <td>
                    <span className={`status-badge badge-${solicitud.estado.toLowerCase().replace(' ', '-')}`}>
                      {solicitud.estado}
                    </span>
                  </td>
                  <td>{solicitud.fecha}</td>
                  <td>
                    <a href={`/admin/solicitudes/${solicitud.id}`} className="btn-link">
                      Ver
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {solicitudes.length === 0 && (
          <div className="empty-state-small">
            <p>Este usuario no tiene solicitudes registradas</p>
          </div>
        )}
      </div>

      {/* Acciones Administrativas */}
      <div className="detail-card danger-zone">
        <h2>⚠️ Zona de Peligro</h2>
        <p>Estas acciones son irreversibles y deben usarse con precaución.</p>
        <div className="danger-actions">
          <button className="btn btn-danger">
            Eliminar Usuario
          </button>
          <button className="btn btn-secondary">
            Reiniciar Contraseña
          </button>
        </div>
      </div>
    </div>
  );
}
