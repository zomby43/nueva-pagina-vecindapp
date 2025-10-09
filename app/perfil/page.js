'use client';

import { useState } from 'react';

export default function PerfilPage() {
  const [userData, setUserData] = useState({
    nombres: 'Juan Carlos',
    apellidos: 'Pérez González',
    rut: '12.345.678-9',
    email: 'juan.perez@email.com',
    telefono: '+56 9 1234 5678',
    direccion: 'Av. Providencia 1234, Dpto 56, Providencia'
  });

  const [editMode, setEditMode] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setEditMode(false);
    alert('Perfil actualizado correctamente');
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Mi Perfil</h1>
        <p className="text-muted">Gestiona tu información personal</p>
      </div>

      <div className="profile-content">
        <div className="row">
          <div className="col-lg-8">
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Información Personal</h5>
                <button 
                  type="button" 
                  className={`btn ${editMode ? 'btn-secondary' : 'btn-primary'} btn-sm`}
                  onClick={() => setEditMode(!editMode)}
                >
                  {editMode ? 'Cancelar' : 'Editar'}
                </button>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label htmlFor="nombres" className="form-label">Nombres</label>
                      <input
                        type="text"
                        className="form-control"
                        id="nombres"
                        name="nombres"
                        value={userData.nombres}
                        onChange={handleChange}
                        disabled={!editMode}
                      />
                    </div>
                    
                    <div className="col-md-6">
                      <label htmlFor="apellidos" className="form-label">Apellidos</label>
                      <input
                        type="text"
                        className="form-control"
                        id="apellidos"
                        name="apellidos"
                        value={userData.apellidos}
                        onChange={handleChange}
                        disabled={!editMode}
                      />
                    </div>
                    
                    <div className="col-md-6">
                      <label htmlFor="rut" className="form-label">RUT</label>
                      <input
                        type="text"
                        className="form-control"
                        id="rut"
                        name="rut"
                        value={userData.rut}
                        disabled={true}
                      />
                      <small className="text-muted">El RUT no se puede modificar</small>
                    </div>
                    
                    <div className="col-md-6">
                      <label htmlFor="telefono" className="form-label">Teléfono</label>
                      <input
                        type="tel"
                        className="form-control"
                        id="telefono"
                        name="telefono"
                        value={userData.telefono}
                        onChange={handleChange}
                        disabled={!editMode}
                      />
                    </div>
                    
                    <div className="col-12">
                      <label htmlFor="email" className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-control"
                        id="email"
                        name="email"
                        value={userData.email}
                        onChange={handleChange}
                        disabled={!editMode}
                      />
                    </div>
                    
                    <div className="col-12">
                      <label htmlFor="direccion" className="form-label">Dirección</label>
                      <textarea
                        className="form-control"
                        id="direccion"
                        name="direccion"
                        rows="3"
                        value={userData.direccion}
                        onChange={handleChange}
                        disabled={!editMode}
                      />
                    </div>
                  </div>
                  
                  {editMode && (
                    <div className="d-flex gap-2 mt-3">
                      <button type="submit" className="btn btn-success">
                        Guardar Cambios
                      </button>
                      <button 
                        type="button" 
                        className="btn btn-secondary"
                        onClick={() => setEditMode(false)}
                      >
                        Cancelar
                      </button>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
          
          <div className="col-lg-4">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Estado de la Cuenta</h5>
              </div>
              <div className="card-body">
                <div className="status-item">
                  <span className="status-label">Estado:</span>
                  <span className="badge bg-success">Aprobado</span>
                </div>
                <div className="status-item">
                  <span className="status-label">Miembro desde:</span>
                  <span>Enero 2024</span>
                </div>
                <div className="status-item">
                  <span className="status-label">Solicitudes:</span>
                  <span>3 completadas</span>
                </div>
              </div>
            </div>
            
            <div className="card mt-3">
              <div className="card-header">
                <h5 className="mb-0">Acciones</h5>
              </div>
              <div className="card-body">
                <button className="btn btn-outline-primary w-100 mb-2">
                  Cambiar Contraseña
                </button>
                <button className="btn btn-outline-secondary w-100 mb-2">
                  Descargar Datos
                </button>
                <button className="btn btn-outline-danger w-100">
                  Eliminar Cuenta
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}