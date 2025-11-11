'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function AdministracionEspaciosPage() {
  const [espacios, setEspacios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [espacioEditando, setEspacioEditando] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    capacidad: '',
    ubicacion: '',
    estado: 'activo',
    permite_reserva_automatica: false,
    observaciones: ''
  });

  useEffect(() => {
    fetchEspacios();
  }, []);

  const fetchEspacios = async () => {
    try {
      setLoading(true);
      setError('');
      const supabase = createClient();

      const { data, error } = await supabase
        .from('espacios')
        .select('*')
        .order('nombre');

      if (error) throw error;
      setEspacios(data || []);
    } catch (error) {
      console.error('Error fetching espacios:', error);
      setError('Error al cargar los espacios');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const resetFormulario = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      capacidad: '',
      ubicacion: '',
      estado: 'activo',
      permite_reserva_automatica: false,
      observaciones: ''
    });
    setEspacioEditando(null);
    setMostrarFormulario(false);
  };

  const abrirFormularioEditar = (espacio) => {
    setFormData({
      nombre: espacio.nombre,
      descripcion: espacio.descripcion || '',
      capacidad: espacio.capacidad || '',
      ubicacion: espacio.ubicacion || '',
      estado: espacio.estado,
      permite_reserva_automatica: espacio.permite_reserva_automatica || false,
      observaciones: espacio.observaciones || ''
    });
    setEspacioEditando(espacio.id);
    setMostrarFormulario(true);
  };

  const validarFormulario = () => {
    if (!formData.nombre.trim()) {
      alert('El nombre del espacio es obligatorio');
      return false;
    }
    if (formData.capacidad && parseInt(formData.capacidad) <= 0) {
      alert('La capacidad debe ser mayor a 0');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validarFormulario()) return;

    try {
      const supabase = createClient();

      const dataToSave = {
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim() || null,
        capacidad: formData.capacidad ? parseInt(formData.capacidad) : null,
        ubicacion: formData.ubicacion.trim() || null,
        estado: formData.estado,
        permite_reserva_automatica: formData.permite_reserva_automatica,
        observaciones: formData.observaciones.trim() || null
      };

      if (espacioEditando) {
        // Actualizar
        const { error } = await supabase
          .from('espacios')
          .update(dataToSave)
          .eq('id', espacioEditando);

        if (error) throw error;
        alert('Espacio actualizado exitosamente');
      } else {
        // Crear
        const { error } = await supabase
          .from('espacios')
          .insert([dataToSave]);

        if (error) throw error;
        alert('Espacio creado exitosamente');
      }

      resetFormulario();
      fetchEspacios();
    } catch (error) {
      console.error('Error saving espacio:', error);
      alert('Error al guardar el espacio: ' + error.message);
    }
  };

  const cambiarEstado = async (espacioId, nuevoEstado) => {
    if (!confirm(`¿Cambiar el estado del espacio a "${nuevoEstado}"?`)) {
      return;
    }

    try {
      const supabase = createClient();

      const { error } = await supabase
        .from('espacios')
        .update({ estado: nuevoEstado })
        .eq('id', espacioId);

      if (error) throw error;

      alert('Estado actualizado exitosamente');
      fetchEspacios();
    } catch (error) {
      console.error('Error updating estado:', error);
      alert('Error al actualizar el estado: ' + error.message);
    }
  };

  const getEstadoBadge = (estado) => {
    const badges = {
      activo: 'bg-success',
      inactivo: 'bg-secondary',
      mantenimiento: 'bg-warning text-dark'
    };
    return badges[estado] || 'bg-secondary';
  };

  const getEstadoTexto = (estado) => {
    const textos = {
      activo: '✅ Activo',
      inactivo: '⚫ Inactivo',
      mantenimiento: '🔧 En Mantenimiento'
    };
    return textos[estado] || estado;
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="text-center py-5">
          <div className="spinner-border mb-3" role="status"></div>
          <p>Cargando espacios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1><i className="bi bi-gear me-2"></i>Administración de Espacios</h1>
          <p className="text-muted">Gestiona los espacios disponibles para reserva</p>
        </div>
        <button
          className="btn btn-primary btn-lg"
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
        >
          {mostrarFormulario ? '📋 Ver Lista de Espacios' : '➕ Nuevo Espacio'}
        </button>
      </div>

      {error && (
        <div className="alert alert-danger mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}

      {mostrarFormulario ? (
        /* Formulario de Creación/Edición */
        <div className="card shadow-sm border-0">
          <div className="card-body p-4">
            <h5 className="card-title mb-4">
              {espacioEditando ? '✏️ Editar Espacio' : '➕ Nuevo Espacio'}
            </h5>

            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label htmlFor="nombre" className="form-label fw-semibold">
                    Nombre del Espacio <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-lg"
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    placeholder="Ej: Sede Vecinal"
                    required
                  />
                </div>

                <div className="col-md-3">
                  <label htmlFor="capacidad" className="form-label fw-semibold">
                    Capacidad (personas)
                  </label>
                  <input
                    type="number"
                    className="form-control form-control-lg"
                    id="capacidad"
                    name="capacidad"
                    value={formData.capacidad}
                    onChange={handleInputChange}
                    min="1"
                    placeholder="Ej: 50"
                  />
                </div>

                <div className="col-md-3">
                  <label htmlFor="estado" className="form-label fw-semibold">
                    Estado
                  </label>
                  <select
                    className="form-select form-select-lg"
                    id="estado"
                    name="estado"
                    value={formData.estado}
                    onChange={handleInputChange}
                  >
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                    <option value="mantenimiento">En Mantenimiento</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label htmlFor="ubicacion" className="form-label fw-semibold">
                    Ubicación
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-lg"
                    id="ubicacion"
                    name="ubicacion"
                    value={formData.ubicacion}
                    onChange={handleInputChange}
                    placeholder="Ej: Calle Principal #123"
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold d-block mb-3">
                    Configuración
                  </label>
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="permite_reserva_automatica"
                      name="permite_reserva_automatica"
                      checked={formData.permite_reserva_automatica}
                      onChange={handleInputChange}
                    />
                    <label className="form-check-label" htmlFor="permite_reserva_automatica">
                      Aprobación automática de reservas
                    </label>
                  </div>
                  <small className="text-muted">
                    Si está activado, las reservas se aprobarán automáticamente sin revisión.
                  </small>
                </div>

                <div className="col-12">
                  <label htmlFor="descripcion" className="form-label fw-semibold">
                    Descripción
                  </label>
                  <textarea
                    className="form-control"
                    id="descripcion"
                    name="descripcion"
                    rows={3}
                    value={formData.descripcion}
                    onChange={handleInputChange}
                    placeholder="Descripción del espacio, características, equipamiento..."
                  />
                </div>

                <div className="col-12">
                  <label htmlFor="observaciones" className="form-label fw-semibold">
                    Observaciones y Reglas de Uso
                  </label>
                  <textarea
                    className="form-control"
                    id="observaciones"
                    name="observaciones"
                    rows={3}
                    value={formData.observaciones}
                    onChange={handleInputChange}
                    placeholder="Reglas de uso, horarios especiales, requisitos..."
                  />
                </div>
              </div>

              <div className="d-flex gap-2 mt-4">
                <button type="submit" className="btn btn-primary btn-lg">
                  {espacioEditando ? '💾 Actualizar Espacio' : '➕ Crear Espacio'}
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-lg"
                  onClick={resetFormulario}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        /* Lista de Espacios */
        <>
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-body p-3 text-center">
              <div className="fs-3 fw-bold text-primary">{espacios.length}</div>
              <small className="text-muted">Espacios registrados</small>
            </div>
          </div>

          {espacios.length === 0 ? (
            <div className="card shadow-sm border-0">
              <div className="card-body text-center py-5">
                <div className="empty-icon mb-3" style={{ fontSize: '3rem' }}>🏟️</div>
                <h5>No hay espacios registrados</h5>
                <p className="text-muted mb-4">Crea el primer espacio disponible para reserva</p>
                <button
                  className="btn btn-primary"
                  onClick={() => setMostrarFormulario(true)}
                >
                  ➕ Crear Primer Espacio
                </button>
              </div>
            </div>
          ) : (
            <div className="row g-4">
              {espacios.map((espacio) => (
                <div key={espacio.id} className="col-md-6 col-lg-4">
                  <div className="card shadow-sm border-0 h-100">
                    <div className="card-body p-4">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <h5 className="card-title fw-bold mb-0">{espacio.nombre}</h5>
                        <span className={`badge ${getEstadoBadge(espacio.estado)} px-2 py-1`}>
                          {getEstadoTexto(espacio.estado)}
                        </span>
                      </div>

                      {espacio.descripcion && (
                        <p className="card-text text-muted small mb-3">
                          {espacio.descripcion}
                        </p>
                      )}

                      <div className="mb-3">
                        {espacio.capacidad && (
                          <div className="mb-1">
                            <small className="text-muted">👥 Capacidad: </small>
                            <strong>{espacio.capacidad} personas</strong>
                          </div>
                        )}
                        {espacio.ubicacion && (
                          <div className="mb-1">
                            <small className="text-muted">📍 </small>
                            <small>{espacio.ubicacion}</small>
                          </div>
                        )}
                        {espacio.permite_reserva_automatica && (
                          <div className="mb-1">
                            <small className="badge bg-info text-dark">
                              ⚡ Aprobación automática
                            </small>
                          </div>
                        )}
                      </div>

                      {espacio.observaciones && (
                        <div className="alert alert-info py-2 px-3 mb-3">
                          <small className="d-block mb-1"><strong>Observaciones:</strong></small>
                          <small>{espacio.observaciones}</small>
                        </div>
                      )}

                      <div className="d-flex gap-2 mt-auto">
                        <button
                          className="btn btn-outline-primary btn-sm flex-fill"
                          onClick={() => abrirFormularioEditar(espacio)}
                        >
                          ✏️ Editar
                        </button>
                        {espacio.estado === 'activo' ? (
                          <button
                            className="btn btn-outline-warning btn-sm"
                            onClick={() => cambiarEstado(espacio.id, 'mantenimiento')}
                          >
                            🔧 Mantenimiento
                          </button>
                        ) : espacio.estado === 'mantenimiento' ? (
                          <button
                            className="btn btn-outline-success btn-sm"
                            onClick={() => cambiarEstado(espacio.id, 'activo')}
                          >
                            ✅ Activar
                          </button>
                        ) : (
                          <button
                            className="btn btn-outline-success btn-sm"
                            onClick={() => cambiarEstado(espacio.id, 'activo')}
                          >
                            ✅ Activar
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
