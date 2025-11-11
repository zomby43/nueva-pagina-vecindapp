'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import { logEdicionUsuario, createLog } from '@/lib/logs/createLog';

export default function AdminConfiguracionPage() {
  const { user, userProfile } = useAuth();
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    numero_unidad_vecinal: '',
    nombre_organizacion: '',
    comuna: '',
    region: '',
    direccion: '',
    telefono: '',
    email: '',
    sitio_web: '',
    nombre_presidente: '',
    cargo_presidente: '',
    rut_organizacion: '',
    fecha_constitucion: '',
    numero_personalidad_juridica: ''
  });

  useEffect(() => {
    if (user && userProfile?.rol === 'admin') {
      fetchConfiguracion();
    }
  }, [user, userProfile]);

  const fetchConfiguracion = async () => {
    try {
      setLoading(true);
      setError('');
      const supabase = createClient();

      const { data, error } = await supabase
        .from('configuracion_organizacion')
        .select('*')
        .limit(1)
        .single();

      if (error) {
        console.error('Error fetching config:', error);
        throw error;
      }

      if (data) {
        setConfig(data);
        setFormData({
          numero_unidad_vecinal: data.numero_unidad_vecinal || '',
          nombre_organizacion: data.nombre_organizacion || '',
          comuna: data.comuna || '',
          region: data.region || '',
          direccion: data.direccion || '',
          telefono: data.telefono || '',
          email: data.email || '',
          sitio_web: data.sitio_web || '',
          nombre_presidente: data.nombre_presidente || '',
          cargo_presidente: data.cargo_presidente || 'Presidente/a',
          rut_organizacion: data.rut_organizacion || '',
          fecha_constitucion: data.fecha_constitucion || '',
          numero_personalidad_juridica: data.numero_personalidad_juridica || ''
        });
      }
    } catch (error) {
      console.error('Error completo:', error);
      setError('Error al cargar la configuración');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setSuccess('');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const supabase = createClient();

      const { data, error } = await supabase
        .from('configuracion_organizacion')
        .update({
          ...formData,
          updated_at: new Date().toISOString()
        })
        .eq('id', config.id)
        .select()
        .single();

      if (error) throw error;

      setConfig(data);
      setSuccess('✅ Configuración actualizada correctamente');

      // Registrar log de edición de configuración
      await createLog({
        accion: 'editar',
        entidad: 'configuracion',
        entidad_id: config.id,
        detalles: {
          cambios_realizados: 'Actualización de configuración de la organización',
          timestamp: new Date().toISOString()
        }
      });

      // Scroll hacia arriba para ver el mensaje
      window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (error) {
      console.error('Error saving config:', error);
      setError('❌ Error al guardar la configuración: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h1><i className="bi bi-gear me-2"></i>Configuración del Sistema</h1>
        </div>
        <p>Cargando configuración...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1><i className="bi bi-gear me-2"></i>Configuración del Sistema</h1>
        <p className="page-subtitle">Administración de la información de la organización</p>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Información Básica */}
        <div className="content-card">
          <h2>📋 Información Básica</h2>

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="numero_unidad_vecinal">Número de Unidad Vecinal *</label>
              <input
                type="text"
                id="numero_unidad_vecinal"
                name="numero_unidad_vecinal"
                value={formData.numero_unidad_vecinal}
                onChange={handleChange}
                required
                placeholder="Ej: 25"
              />
            </div>

            <div className="form-group">
              <label htmlFor="nombre_organizacion">Nombre de la Organización *</label>
              <input
                type="text"
                id="nombre_organizacion"
                name="nombre_organizacion"
                value={formData.nombre_organizacion}
                onChange={handleChange}
                required
                placeholder="Ej: Junta de Vecinos Villa Esperanza"
              />
            </div>

            <div className="form-group">
              <label htmlFor="rut_organizacion">RUT de la Organización</label>
              <input
                type="text"
                id="rut_organizacion"
                name="rut_organizacion"
                value={formData.rut_organizacion}
                onChange={handleChange}
                placeholder="Ej: 12.345.678-9"
              />
            </div>

            <div className="form-group">
              <label htmlFor="numero_personalidad_juridica">N° Personalidad Jurídica</label>
              <input
                type="text"
                id="numero_personalidad_juridica"
                name="numero_personalidad_juridica"
                value={formData.numero_personalidad_juridica}
                onChange={handleChange}
                placeholder="Ej: 1234"
              />
            </div>

            <div className="form-group">
              <label htmlFor="fecha_constitucion">Fecha de Constitución</label>
              <input
                type="date"
                id="fecha_constitucion"
                name="fecha_constitucion"
                value={formData.fecha_constitucion}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Ubicación */}
        <div className="content-card">
          <h2>📍 Ubicación</h2>

          <div className="form-grid">
            <div className="form-group full-width">
              <label htmlFor="direccion">Dirección *</label>
              <input
                type="text"
                id="direccion"
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                required
                placeholder="Ej: Av. Principal #123"
              />
            </div>

            <div className="form-group">
              <label htmlFor="comuna">Comuna *</label>
              <input
                type="text"
                id="comuna"
                name="comuna"
                value={formData.comuna}
                onChange={handleChange}
                required
                placeholder="Ej: Santiago"
              />
            </div>

            <div className="form-group">
              <label htmlFor="region">Región *</label>
              <select
                id="region"
                name="region"
                value={formData.region}
                onChange={handleChange}
                required
              >
                <option value="">Seleccionar región...</option>
                <option value="Región Metropolitana">Región Metropolitana</option>
                <option value="Región de Valparaíso">Región de Valparaíso</option>
                <option value="Región del Biobío">Región del Biobío</option>
                <option value="Región de La Araucanía">Región de La Araucanía</option>
                <option value="Región de Los Lagos">Región de Los Lagos</option>
                <option value="Región de Arica y Parinacota">Región de Arica y Parinacota</option>
                <option value="Región de Tarapacá">Región de Tarapacá</option>
                <option value="Región de Antofagasta">Región de Antofagasta</option>
                <option value="Región de Atacama">Región de Atacama</option>
                <option value="Región de Coquimbo">Región de Coquimbo</option>
                <option value="Región del Libertador Bernardo O'Higgins">Región del Libertador Bernardo O'Higgins</option>
                <option value="Región del Maule">Región del Maule</option>
                <option value="Región de Ñuble">Región de Ñuble</option>
                <option value="Región de Los Ríos">Región de Los Ríos</option>
                <option value="Región de Aysén">Región de Aysén</option>
                <option value="Región de Magallanes">Región de Magallanes</option>
              </select>
            </div>
          </div>
        </div>

        {/* Contacto */}
        <div className="content-card">
          <h2>📞 Información de Contacto</h2>

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="telefono">Teléfono *</label>
              <input
                type="tel"
                id="telefono"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                required
                placeholder="Ej: +56 9 1234 5678"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Ej: contacto@juntavecinos.cl"
              />
            </div>

            <div className="form-group">
              <label htmlFor="sitio_web">Sitio Web</label>
              <input
                type="url"
                id="sitio_web"
                name="sitio_web"
                value={formData.sitio_web}
                onChange={handleChange}
                placeholder="Ej: https://www.juntavecinos.cl"
              />
            </div>
          </div>
        </div>

        {/* Directiva */}
        <div className="content-card">
          <h2>👥 Directiva</h2>

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="nombre_presidente">Nombre del Presidente/a</label>
              <input
                type="text"
                id="nombre_presidente"
                name="nombre_presidente"
                value={formData.nombre_presidente}
                onChange={handleChange}
                placeholder="Ej: Juan Pérez González"
              />
            </div>

            <div className="form-group">
              <label htmlFor="cargo_presidente">Cargo</label>
              <select
                id="cargo_presidente"
                name="cargo_presidente"
                value={formData.cargo_presidente}
                onChange={handleChange}
              >
                <option value="Presidente/a">Presidente/a</option>
                <option value="Vicepresidente/a">Vicepresidente/a</option>
                <option value="Secretario/a">Secretario/a</option>
                <option value="Tesorero/a">Tesorero/a</option>
              </select>
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="form-actions">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={saving}
          >
            {saving ? 'Guardando...' : '💾 Guardar Configuración'}
          </button>
        </div>
      </form>

      <style jsx>{`
        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-top: 1rem;
        }

        .full-width {
          grid-column: 1 / -1;
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          margin-top: 2rem;
        }

        .alert {
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1rem;
        }

        .alert-success {
          background-color: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }

        .alert-error {
          background-color: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }
      `}</style>
    </div>
  );
}
