'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function GestionarCategorias() {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    tipo: 'ingreso',
    color: '#0d6efd',
    descripcion: '',
    activo: true,
  });
  const [saving, setSaving] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  useEffect(() => {
    fetchCategorias();
  }, []);

  const fetchCategorias = async () => {
    try {
      setLoading(true);
      const supabase = createClient();

      const { data, error } = await supabase
        .from('categorias_transaccion')
        .select('*')
        .order('tipo', { ascending: true })
        .order('nombre', { ascending: true });

      if (error) throw error;

      setCategorias(data || []);
    } catch (error) {
      console.error('Error cargando categorías:', error);
      setMensaje({ tipo: 'error', texto: 'Error al cargar las categorías' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const supabase = createClient();

      if (editingCategoria) {
        // Actualizar categoría existente
        const { error } = await supabase
          .from('categorias_transaccion')
          .update({
            nombre: formData.nombre,
            tipo: formData.tipo,
            color: formData.color,
            descripcion: formData.descripcion || null,
            activo: formData.activo,
          })
          .eq('id', editingCategoria.id);

        if (error) throw error;

        setMensaje({ tipo: 'success', texto: 'Categoría actualizada exitosamente' });
      } else {
        // Crear nueva categoría
        const { error } = await supabase
          .from('categorias_transaccion')
          .insert([
            {
              nombre: formData.nombre,
              tipo: formData.tipo,
              color: formData.color,
              descripcion: formData.descripcion || null,
              activo: formData.activo,
            },
          ]);

        if (error) throw error;

        setMensaje({ tipo: 'success', texto: 'Categoría creada exitosamente' });
      }

      // Recargar categorías
      await fetchCategorias();

      // Cerrar modal y resetear formulario
      setShowModal(false);
      setEditingCategoria(null);
      setFormData({
        nombre: '',
        tipo: 'ingreso',
        color: '#0d6efd',
        descripcion: '',
        activo: true,
      });
    } catch (error) {
      console.error('Error guardando categoría:', error);
      setMensaje({ tipo: 'error', texto: 'Error al guardar la categoría' });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (categoria) => {
    setEditingCategoria(categoria);
    setFormData({
      nombre: categoria.nombre,
      tipo: categoria.tipo,
      color: categoria.color,
      descripcion: categoria.descripcion || '',
      activo: categoria.activo,
    });
    setShowModal(true);
  };

  const handleToggleActivo = async (categoria) => {
    try {
      const supabase = createClient();

      const { error } = await supabase
        .from('categorias_transaccion')
        .update({ activo: !categoria.activo })
        .eq('id', categoria.id);

      if (error) throw error;

      setMensaje({
        tipo: 'success',
        texto: `Categoría ${!categoria.activo ? 'activada' : 'desactivada'} exitosamente`,
      });

      await fetchCategorias();
    } catch (error) {
      console.error('Error actualizando categoría:', error);
      setMensaje({ tipo: 'error', texto: 'Error al actualizar la categoría' });
    }
  };

  const handleDelete = async (categoria) => {
    if (!confirm(`¿Estás seguro de eliminar la categoría "${categoria.nombre}"?`)) {
      return;
    }

    try {
      const supabase = createClient();

      // Verificar si hay transacciones asociadas
      const { data: transacciones, error: checkError } = await supabase
        .from('transacciones_financieras')
        .select('id')
        .eq('categoria_id', categoria.id)
        .limit(1);

      if (checkError) throw checkError;

      if (transacciones && transacciones.length > 0) {
        setMensaje({
          tipo: 'error',
          texto: 'No se puede eliminar la categoría porque tiene transacciones asociadas. Considere desactivarla en su lugar.',
        });
        return;
      }

      // Eliminar categoría
      const { error } = await supabase
        .from('categorias_transaccion')
        .delete()
        .eq('id', categoria.id);

      if (error) throw error;

      setMensaje({ tipo: 'success', texto: 'Categoría eliminada exitosamente' });
      await fetchCategorias();
    } catch (error) {
      console.error('Error eliminando categoría:', error);
      setMensaje({ tipo: 'error', texto: 'Error al eliminar la categoría' });
    }
  };

  const categoriasIngresos = categorias.filter((c) => c.tipo === 'ingreso');
  const categoriasEgresos = categorias.filter((c) => c.tipo === 'egreso');

  if (loading) {
    return (
      <div className="page-container">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-3 text-muted">Cargando categorías...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-2">
              <li className="breadcrumb-item">
                <Link href="/secretaria/finanzas">Finanzas</Link>
              </li>
              <li className="breadcrumb-item active">Gestionar Categorías</li>
            </ol>
          </nav>
          <h1 className="h3 mb-1">
            <i className="bi bi-tags me-2"></i>
            Gestionar Categorías
          </h1>
          <p className="text-muted mb-0">
            Administra las categorías para clasificar ingresos y egresos
          </p>
        </div>
        <div>
          <button
            onClick={() => {
              setEditingCategoria(null);
              setFormData({
                nombre: '',
                tipo: 'ingreso',
                color: '#0d6efd',
                descripcion: '',
                activo: true,
              });
              setShowModal(true);
            }}
            className="btn btn-primary"
          >
            <i className="bi bi-plus-circle me-2"></i>
            Nueva Categoría
          </button>
        </div>
      </div>

      {/* Mensajes */}
      {mensaje && (
        <div
          className={`alert alert-${mensaje.tipo === 'success' ? 'success' : 'danger'} alert-dismissible fade show`}
          role="alert"
        >
          {mensaje.texto}
          <button
            type="button"
            className="btn-close"
            onClick={() => setMensaje(null)}
          ></button>
        </div>
      )}

      {/* Categorías de Ingresos */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header bg-success bg-opacity-10 border-bottom py-3">
          <h5 className="mb-0 text-success">
            <i className="bi bi-arrow-down-circle me-2"></i>
            Categorías de Ingresos ({categoriasIngresos.length})
          </h5>
        </div>
        <div className="card-body p-0">
          {categoriasIngresos.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-inbox text-muted" style={{ fontSize: '3rem' }}></i>
              <p className="text-muted mt-3">No hay categorías de ingresos</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: '40px' }}></th>
                    <th>Nombre</th>
                    <th>Descripción</th>
                    <th style={{ width: '100px' }}>Estado</th>
                    <th style={{ width: '120px' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {categoriasIngresos.map((categoria) => (
                    <tr key={categoria.id}>
                      <td>
                        <div
                          style={{
                            width: '30px',
                            height: '30px',
                            backgroundColor: categoria.color,
                            borderRadius: '50%',
                          }}
                        ></div>
                      </td>
                      <td>
                        <span className="fw-medium">{categoria.nombre}</span>
                      </td>
                      <td>
                        <span className="text-muted">{categoria.descripcion || '-'}</span>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            categoria.activo ? 'bg-success' : 'bg-secondary'
                          }`}
                        >
                          {categoria.activo ? 'Activa' : 'Inactiva'}
                        </span>
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <button
                            onClick={() => handleEdit(categoria)}
                            className="btn btn-outline-primary"
                            title="Editar"
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button
                            onClick={() => handleToggleActivo(categoria)}
                            className="btn btn-outline-secondary"
                            title={categoria.activo ? 'Desactivar' : 'Activar'}
                          >
                            <i className={`bi bi-${categoria.activo ? 'eye-slash' : 'eye'}`}></i>
                          </button>
                          <button
                            onClick={() => handleDelete(categoria)}
                            className="btn btn-outline-danger"
                            title="Eliminar"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
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

      {/* Categorías de Egresos */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-danger bg-opacity-10 border-bottom py-3">
          <h5 className="mb-0 text-danger">
            <i className="bi bi-arrow-up-circle me-2"></i>
            Categorías de Egresos ({categoriasEgresos.length})
          </h5>
        </div>
        <div className="card-body p-0">
          {categoriasEgresos.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-inbox text-muted" style={{ fontSize: '3rem' }}></i>
              <p className="text-muted mt-3">No hay categorías de egresos</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: '40px' }}></th>
                    <th>Nombre</th>
                    <th>Descripción</th>
                    <th style={{ width: '100px' }}>Estado</th>
                    <th style={{ width: '120px' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {categoriasEgresos.map((categoria) => (
                    <tr key={categoria.id}>
                      <td>
                        <div
                          style={{
                            width: '30px',
                            height: '30px',
                            backgroundColor: categoria.color,
                            borderRadius: '50%',
                          }}
                        ></div>
                      </td>
                      <td>
                        <span className="fw-medium">{categoria.nombre}</span>
                      </td>
                      <td>
                        <span className="text-muted">{categoria.descripcion || '-'}</span>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            categoria.activo ? 'bg-success' : 'bg-secondary'
                          }`}
                        >
                          {categoria.activo ? 'Activa' : 'Inactiva'}
                        </span>
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <button
                            onClick={() => handleEdit(categoria)}
                            className="btn btn-outline-primary"
                            title="Editar"
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button
                            onClick={() => handleToggleActivo(categoria)}
                            className="btn btn-outline-secondary"
                            title={categoria.activo ? 'Desactivar' : 'Activar'}
                          >
                            <i className={`bi bi-${categoria.activo ? 'eye-slash' : 'eye'}`}></i>
                          </button>
                          <button
                            onClick={() => handleDelete(categoria)}
                            className="btn btn-outline-danger"
                            title="Eliminar"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
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

      {/* Modal para crear/editar categoría */}
      {showModal && (
        <>
          <div className="modal fade show d-block" tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    {editingCategoria ? 'Editar Categoría' : 'Nueva Categoría'}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowModal(false)}
                  ></button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label">
                        Nombre <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.nombre}
                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                        required
                        maxLength={100}
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">
                        Tipo <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-select"
                        value={formData.tipo}
                        onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                        required
                      >
                        <option value="ingreso">Ingreso</option>
                        <option value="egreso">Egreso</option>
                      </select>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">
                        Color <span className="text-danger">*</span>
                      </label>
                      <div className="d-flex align-items-center gap-2">
                        <input
                          type="color"
                          className="form-control form-control-color"
                          value={formData.color}
                          onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                          required
                        />
                        <input
                          type="text"
                          className="form-control"
                          value={formData.color}
                          onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                          placeholder="#0d6efd"
                          maxLength={7}
                        />
                      </div>
                      <small className="text-muted">
                        Este color se usará para identificar la categoría en reportes
                      </small>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Descripción</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        value={formData.descripcion}
                        onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                        maxLength={255}
                      ></textarea>
                    </div>

                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="activo"
                        checked={formData.activo}
                        onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                      />
                      <label className="form-check-label" htmlFor="activo">
                        Categoría activa
                      </label>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowModal(false)}
                      disabled={saving}
                    >
                      Cancelar
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                      {saving ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Guardando...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-circle me-2"></i>
                          {editingCategoria ? 'Actualizar' : 'Crear'}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      )}
    </div>
  );
}
