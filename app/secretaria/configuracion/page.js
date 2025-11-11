'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';

export default function ConfiguracionPage() {
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
    if (user && userProfile?.rol === 'secretaria') {
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const supabase = createClient();

      // Limpiar datos vacíos para campos opcionales (convertir "" a null)
      const dataToSave = {
        ...formData,
        sitio_web: formData.sitio_web || null,
        nombre_presidente: formData.nombre_presidente || null,
        rut_organizacion: formData.rut_organizacion || null,
        fecha_constitucion: formData.fecha_constitucion || null,
        numero_personalidad_juridica: formData.numero_personalidad_juridica || null
      };

      const { error } = await supabase
        .from('configuracion_organizacion')
        .update(dataToSave)
        .eq('id', config.id);

      if (error) {
        console.error('Error updating config:', error);
        throw error;
      }

      setSuccess('Configuración guardada exitosamente');

      // Recargar configuración
      await fetchConfiguracion();

      // Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => setSuccess(''), 3000);

    } catch (error) {
      console.error('Error al guardar:', error);
      setError('Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="text-center">
            <div className="spinner-border mb-3" role="status"></div>
            <p>Cargando configuración...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1><i className="bi bi-sliders me-2"></i>Configuración de la Organización</h1>
          <p className="text-muted">Personaliza los datos de tu Junta de Vecinos</p>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-8">
          {/* Mensajes */}
          {error && (
            <div className="alert alert-danger mb-4">
              <strong>Error:</strong> {error}
            </div>
          )}

          {success && (
            <div className="alert alert-success mb-4">
              <strong>Éxito:</strong> {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Información de la Unidad Vecinal */}
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="mb-0">📍 Información de la Unidad Vecinal</h5>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label htmlFor="numero_unidad_vecinal" className="form-label">
                      Número de Unidad Vecinal <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="numero_unidad_vecinal"
                      name="numero_unidad_vecinal"
                      value={formData.numero_unidad_vecinal}
                      onChange={handleChange}
                      placeholder="Ej: 12"
                      required
                    />
                    <small className="text-muted">Solo el número (sin "UV N°")</small>
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="nombre_organizacion" className="form-label">
                      Nombre de la Organización <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="nombre_organizacion"
                      name="nombre_organizacion"
                      value={formData.nombre_organizacion}
                      onChange={handleChange}
                      placeholder="Ej: Junta de Vecinos"
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="comuna" className="form-label">
                      Comuna <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="comuna"
                      name="comuna"
                      value={formData.comuna}
                      onChange={handleChange}
                      placeholder="Ej: Santiago"
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="region" className="form-label">
                      Región <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="region"
                      name="region"
                      value={formData.region}
                      onChange={handleChange}
                      placeholder="Ej: Región Metropolitana"
                      required
                    />
                  </div>

                  <div className="col-12">
                    <label htmlFor="direccion" className="form-label">
                      Dirección de la Sede <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="direccion"
                      name="direccion"
                      value={formData.direccion}
                      onChange={handleChange}
                      placeholder="Ej: Calle Principal #123, Santiago"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Información de Contacto */}
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="mb-0">📞 Información de Contacto</h5>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label htmlFor="telefono" className="form-label">
                      Teléfono <span className="text-danger">*</span>
                    </label>
                    <input
                      type="tel"
                      className="form-control"
                      id="telefono"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                      placeholder="Ej: +56 9 1234 5678"
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="email" className="form-label">
                      Email <span className="text-danger">*</span>
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Ej: contacto@juntavecinos.cl"
                      required
                    />
                  </div>

                  <div className="col-12">
                    <label htmlFor="sitio_web" className="form-label">
                      Sitio Web
                    </label>
                    <input
                      type="url"
                      className="form-control"
                      id="sitio_web"
                      name="sitio_web"
                      value={formData.sitio_web}
                      onChange={handleChange}
                      placeholder="Ej: https://www.juntavecinos.cl"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Información de la Directiva */}
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="mb-0">👤 Directiva</h5>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label htmlFor="nombre_presidente" className="form-label">
                      Nombre del/la Presidente/a
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="nombre_presidente"
                      name="nombre_presidente"
                      value={formData.nombre_presidente}
                      onChange={handleChange}
                      placeholder="Ej: María González Pérez"
                    />
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="cargo_presidente" className="form-label">
                      Cargo
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="cargo_presidente"
                      name="cargo_presidente"
                      value={formData.cargo_presidente}
                      onChange={handleChange}
                      placeholder="Ej: Presidenta"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Información Legal */}
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="mb-0">⚖️ Información Legal</h5>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label htmlFor="rut_organizacion" className="form-label">
                      RUT de la Organización
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="rut_organizacion"
                      name="rut_organizacion"
                      value={formData.rut_organizacion}
                      onChange={handleChange}
                      placeholder="Ej: 12.345.678-9"
                    />
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="numero_personalidad_juridica" className="form-label">
                      N° de Personalidad Jurídica
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="numero_personalidad_juridica"
                      name="numero_personalidad_juridica"
                      value={formData.numero_personalidad_juridica}
                      onChange={handleChange}
                      placeholder="Ej: 12345"
                    />
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="fecha_constitucion" className="form-label">
                      Fecha de Constitución
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      id="fecha_constitucion"
                      name="fecha_constitucion"
                      value={formData.fecha_constitucion}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={fetchConfiguracion}
                disabled={saving}
              >
                Descartar Cambios
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Guardando...
                  </>
                ) : (
                  'Guardar Configuración'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Panel informativo */}
        <div className="col-lg-4">
          <div className="card bg-light">
            <div className="card-body">
              <h6 className="card-title">ℹ️ Información</h6>
              <p className="card-text small">
                Esta configuración se utiliza en:
              </p>
              <ul className="small mb-0">
                <li>Certificados de residencia</li>
                <li>Certificados de antigüedad</li>
                <li>Documentos oficiales</li>
                <li>Pie de página del sitio</li>
                <li>Emails y notificaciones</li>
              </ul>
              <hr />
              <p className="card-text small mb-0">
                <strong>Nota:</strong> Los campos marcados con <span className="text-danger">*</span> son obligatorios.
              </p>
            </div>
          </div>

          <div className="card bg-light mt-3">
            <div className="card-body">
              <h6 className="card-title">📚 ¿Qué es una Unidad Vecinal?</h6>
              <p className="card-text small">
                Las unidades vecinales son divisiones territoriales según la Ley N° 19.418.
                Cada comuna se subdivide en varias unidades vecinales numeradas (UV N°1, UV N°2, etc.).
              </p>
              <p className="card-text small mb-0">
                El número se reinicia en cada comuna, por lo que pueden existir múltiples "UV N°12" en el país.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
