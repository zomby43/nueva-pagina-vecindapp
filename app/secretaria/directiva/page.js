'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';

export default function SecretariaDirectivaPage() {
  const { user, userProfile } = useAuth();
  const [contactos, setContactos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [contactoEditando, setContactoEditando] = useState(null);
  const [formData, setFormData] = useState({
    cargo: '',
    nombre_completo: '',
    email: '',
    telefono: '',
    orden: 0,
    activo: true
  });

  useEffect(() => {
    if (user && userProfile?.rol === 'secretaria') {
      fetchContactos();
    }
  }, [user, userProfile]);

  const fetchContactos = async () => {
    try {
      setLoading(true);
      const supabase = createClient();

      // Primero verificar si la tabla existe intentando hacer un select
      const { data, error: selectError } = await supabase
        .from('directiva_contactos')
        .select('*')
        .order('orden', { ascending: true });

      if (selectError) {
        // Si la tabla no existe, intentar crearla
        if (selectError.code === '42P01' || selectError.message.includes('does not exist')) {
          console.log('📋 Tabla no existe, creando tabla directiva_contactos...');

          const { error: createError } = await supabase.rpc('exec_sql', {
            query: `
              CREATE TABLE IF NOT EXISTS public.directiva_contactos (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                cargo TEXT NOT NULL,
                orden INT NOT NULL DEFAULT 0,
                nombre_completo TEXT NOT NULL,
                email TEXT,
                telefono TEXT,
                activo BOOLEAN DEFAULT true,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
              );

              ALTER TABLE public.directiva_contactos ENABLE ROW LEVEL SECURITY;

              CREATE POLICY "Usuarios pueden ver contactos activos de directiva"
              ON public.directiva_contactos FOR SELECT
              TO authenticated
              USING (activo = true);

              CREATE POLICY "Secretaria y Admin pueden insertar contactos"
              ON public.directiva_contactos FOR INSERT
              TO authenticated
              WITH CHECK (
                EXISTS (
                  SELECT 1 FROM public.usuarios
                  WHERE id = auth.uid() AND rol IN ('secretaria', 'admin')
                )
              );

              CREATE POLICY "Secretaria y Admin pueden actualizar contactos"
              ON public.directiva_contactos FOR UPDATE
              TO authenticated
              USING (
                EXISTS (
                  SELECT 1 FROM public.usuarios
                  WHERE id = auth.uid() AND rol IN ('secretaria', 'admin')
                )
              );

              INSERT INTO public.directiva_contactos (cargo, orden, nombre_completo, email, telefono) VALUES
                ('Presidente/a', 1, 'Pendiente', '', ''),
                ('Secretario/a', 2, 'Pendiente', '', ''),
                ('Tesorero/a', 3, 'Pendiente', '', '');
            `
          });

          if (createError) {
            console.error('Error creando tabla:', createError);
            setError('Por favor, ejecuta el SQL add-directiva-contactos-table.sql en Supabase Dashboard');
            setLoading(false);
            return;
          }

          // Intentar obtener los datos nuevamente
          const { data: newData, error: newError } = await supabase
            .from('directiva_contactos')
            .select('*')
            .order('orden', { ascending: true });

          if (newError) throw newError;
          setContactos(newData || []);
        } else {
          throw selectError;
        }
      } else {
        setContactos(data || []);
      }
    } catch (error) {
      console.error('Error fetching contactos:', error);
      setError('Error al cargar los contactos. Por favor, ejecuta add-directiva-contactos-table.sql en Supabase.');
    } finally {
      setLoading(false);
    }
  };

  const handleAbrirModal = (contacto = null) => {
    if (contacto) {
      setContactoEditando(contacto);
      setFormData({
        cargo: contacto.cargo,
        nombre_completo: contacto.nombre_completo,
        email: contacto.email || '',
        telefono: contacto.telefono || '',
        orden: contacto.orden,
        activo: contacto.activo
      });
    } else {
      setContactoEditando(null);
      setFormData({
        cargo: '',
        nombre_completo: '',
        email: '',
        telefono: '',
        orden: contactos.length + 1,
        activo: true
      });
    }
    setMostrarModal(true);
  };

  const handleCerrarModal = () => {
    setMostrarModal(false);
    setContactoEditando(null);
    setFormData({
      cargo: '',
      nombre_completo: '',
      email: '',
      telefono: '',
      orden: 0,
      activo: true
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.cargo || !formData.nombre_completo) {
      alert('Por favor, completa los campos obligatorios');
      return;
    }

    try {
      const supabase = createClient();

      if (contactoEditando) {
        // Actualizar
        const { error } = await supabase
          .from('directiva_contactos')
          .update(formData)
          .eq('id', contactoEditando.id);

        if (error) throw error;
        alert('Contacto actualizado exitosamente');
      } else {
        // Crear
        const { error } = await supabase
          .from('directiva_contactos')
          .insert([formData]);

        if (error) throw error;
        alert('Contacto agregado exitosamente');
      }

      handleCerrarModal();
      fetchContactos();
    } catch (error) {
      console.error('Error saving contacto:', error);
      alert('Error al guardar el contacto');
    }
  };

  const handleEliminar = async (id) => {
    if (!confirm('¿Estás segura de eliminar este contacto?')) return;

    try {
      const supabase = createClient();

      const { error } = await supabase
        .from('directiva_contactos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      alert('Contacto eliminado exitosamente');
      fetchContactos();
    } catch (error) {
      console.error('Error deleting contacto:', error);
      alert('Error al eliminar el contacto');
    }
  };

  const toggleActivo = async (id, activoActual) => {
    try {
      const supabase = createClient();

      const { error } = await supabase
        .from('directiva_contactos')
        .update({ activo: !activoActual })
        .eq('id', id);

      if (error) throw error;

      fetchContactos();
    } catch (error) {
      console.error('Error toggling activo:', error);
      alert('Error al cambiar el estado');
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-danger">
          <h5>⚠️ Configuración necesaria</h5>
          <p>{error}</p>
          <p>Ejecuta el siguiente comando en SQL Editor de Supabase Dashboard:</p>
          <pre style={{ backgroundColor: '#f5f5f5', padding: '1rem', borderRadius: '4px', fontSize: '0.85rem' }}>
            {`Copia el contenido del archivo: add-directiva-contactos-table.sql`}
          </pre>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">👥 Gestión de Directiva</h2>
          <p className="text-muted mb-0">Administra los contactos de la directiva de la Junta de Vecinos</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => handleAbrirModal()}
        >
          ➕ Agregar Contacto
        </button>
      </div>

      {/* Lista de contactos */}
      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">Directiva y Contacto</h5>
        </div>
        <div className="card-body">
          {contactos.length === 0 ? (
            <div className="text-center py-5">
              <div style={{ fontSize: '3rem' }}>👥</div>
              <h5>No hay contactos registrados</h5>
              <p className="text-muted">Agrega los contactos de la directiva</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Orden</th>
                    <th>Cargo</th>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Teléfono</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {contactos.map((contacto) => (
                    <tr key={contacto.id}>
                      <td>
                        <span className="badge bg-secondary">{contacto.orden}</span>
                      </td>
                      <td>
                        <strong>{contacto.cargo}</strong>
                      </td>
                      <td>{contacto.nombre_completo}</td>
                      <td>
                        {contacto.email ? (
                          <a href={`mailto:${contacto.email}`}>{contacto.email}</a>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td>
                        {contacto.telefono || <span className="text-muted">-</span>}
                      </td>
                      <td>
                        <button
                          className={`btn btn-sm ${contacto.activo ? 'btn-success' : 'btn-secondary'}`}
                          onClick={() => toggleActivo(contacto.id, contacto.activo)}
                          style={{ minWidth: '80px' }}
                        >
                          {contacto.activo ? '✓ Activo' : '✗ Inactivo'}
                        </button>
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-primary me-2"
                          onClick={() => handleAbrirModal(contacto)}
                          title="Editar"
                        >
                          ✏️ Editar
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleEliminar(contacto.id)}
                          title="Eliminar"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal de crear/editar */}
      {mostrarModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {contactoEditando ? '✏️ Editar Contacto' : '➕ Agregar Contacto'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCerrarModal}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Cargo *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.cargo}
                      onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                      placeholder="Ej: Presidente/a, Secretario/a, Tesorero/a, Vocal"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Nombre Completo *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.nombre_completo}
                      onChange={(e) => setFormData({ ...formData, nombre_completo: e.target.value })}
                      placeholder="Nombre y apellido"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="correo@ejemplo.cl"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Teléfono</label>
                    <input
                      type="tel"
                      className="form-control"
                      value={formData.telefono}
                      onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                      placeholder="+56 9 1234 5678"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Orden de visualización</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.orden}
                      onChange={(e) => setFormData({ ...formData, orden: parseInt(e.target.value) || 0 })}
                      min="0"
                    />
                    <small className="text-muted">Orden en que aparecerá (menor primero)</small>
                  </div>

                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="activoCheck"
                      checked={formData.activo}
                      onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                    />
                    <label className="form-check-label" htmlFor="activoCheck">
                      Contacto activo (visible para vecinos)
                    </label>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleCerrarModal}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {contactoEditando ? 'Actualizar' : 'Agregar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
