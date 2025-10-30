'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function EditarActividadPage() {
  const router = useRouter();
  const params = useParams();
  const [actividad, setActividad] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    categoria: 'otro',
    tipo: 'presencial',
    fecha_inicio: '',
    fecha_fin: '',
    ubicacion: '',
    cupo_maximo: 20,
    requisitos: '',
    estado: 'borrador',
    es_gratuita: true,
    costo: 0,
    edad_minima: '',
    edad_maxima: '',
    permite_lista_espera: false,
    enlace_videollamada: ''
  });

  useEffect(() => {
    if (params.id) {
      fetchActividad();
    }
  }, [params.id]);

  const fetchActividad = async () => {
    try {
      setLoading(true);
      const supabase = createClient();

      const { data, error } = await supabase
        .from('actividades')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error) throw error;

      setActividad(data);

      // Formatear fechas para datetime-local
      const fechaInicio = new Date(data.fecha_inicio);
      const fechaFin = new Date(data.fecha_fin);

      setFormData({
        titulo: data.titulo,
        descripcion: data.descripcion,
        categoria: data.categoria,
        tipo: data.tipo,
        fecha_inicio: fechaInicio.toISOString().slice(0, 16),
        fecha_fin: fechaFin.toISOString().slice(0, 16),
        ubicacion: data.ubicacion || '',
        cupo_maximo: data.cupo_maximo,
        requisitos: data.requisitos || '',
        estado: data.estado,
        es_gratuita: data.es_gratuita,
        costo: data.costo || 0,
        edad_minima: data.edad_minima || '',
        edad_maxima: data.edad_maxima || '',
        permite_lista_espera: data.permite_lista_espera,
        enlace_videollamada: data.enlace_videollamada || ''
      });
    } catch (error) {
      console.error('Error fetching actividad:', error);
      setError('Error al cargar la actividad');
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

  const validarFormulario = () => {
    if (!formData.titulo.trim()) {
      setError('El título es obligatorio');
      return false;
    }

    if (formData.titulo.length < 5) {
      setError('El título debe tener al menos 5 caracteres');
      return false;
    }

    if (!formData.descripcion.trim()) {
      setError('La descripción es obligatoria');
      return false;
    }

    if (formData.descripcion.length < 20) {
      setError('La descripción debe tener al menos 20 caracteres');
      return false;
    }

    if (!formData.fecha_inicio) {
      setError('La fecha de inicio es obligatoria');
      return false;
    }

    if (!formData.fecha_fin) {
      setError('La fecha de fin es obligatoria');
      return false;
    }

    const fechaInicio = new Date(formData.fecha_inicio);
    const fechaFin = new Date(formData.fecha_fin);

    if (fechaFin <= fechaInicio) {
      setError('La fecha de fin debe ser posterior a la fecha de inicio');
      return false;
    }

    if (!formData.cupo_maximo || formData.cupo_maximo < 1) {
      setError('El cupo máximo debe ser al menos 1');
      return false;
    }

    // Validar que no se reduzca el cupo por debajo de las inscripciones aprobadas
    const cupoOcupado = actividad.cupo_maximo - actividad.cupo_disponible;
    if (formData.cupo_maximo < cupoOcupado) {
      setError(`No puedes reducir el cupo máximo a menos de ${cupoOcupado} (inscripciones ya aprobadas)`);
      return false;
    }

    if (!formData.es_gratuita && (!formData.costo || formData.costo < 0)) {
      setError('El costo debe ser un valor positivo');
      return false;
    }

    if (formData.edad_minima && formData.edad_maxima) {
      if (parseInt(formData.edad_maxima) < parseInt(formData.edad_minima)) {
        setError('La edad máxima debe ser mayor o igual a la edad mínima');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validarFormulario()) {
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const supabase = createClient();

      // Calcular nuevo cupo disponible si cambió el cupo máximo
      const cupoOcupado = actividad.cupo_maximo - actividad.cupo_disponible;
      const nuevoCupoDisponible = parseInt(formData.cupo_maximo) - cupoOcupado;

      const dataToSave = {
        titulo: formData.titulo.trim(),
        descripcion: formData.descripcion.trim(),
        categoria: formData.categoria,
        tipo: formData.tipo,
        fecha_inicio: formData.fecha_inicio,
        fecha_fin: formData.fecha_fin,
        ubicacion: formData.ubicacion.trim() || null,
        cupo_maximo: parseInt(formData.cupo_maximo),
        cupo_disponible: nuevoCupoDisponible,
        requisitos: formData.requisitos.trim() || null,
        estado: formData.estado,
        es_gratuita: formData.es_gratuita,
        costo: formData.es_gratuita ? 0 : parseFloat(formData.costo),
        edad_minima: formData.edad_minima ? parseInt(formData.edad_minima) : null,
        edad_maxima: formData.edad_maxima ? parseInt(formData.edad_maxima) : null,
        permite_lista_espera: formData.permite_lista_espera,
        enlace_videollamada: formData.enlace_videollamada.trim() || null
      };

      const { error } = await supabase
        .from('actividades')
        .update(dataToSave)
        .eq('id', params.id);

      if (error) throw error;

      alert('Actividad actualizada exitosamente');
      router.push('/secretaria/actividades');
    } catch (error) {
      console.error('Error al actualizar actividad:', error);
      setError(error.message || 'Error al actualizar la actividad');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ width: '100%', maxWidth: '100%', padding: '2rem', background: '#f4f8f9', borderRadius: '16px' }}>
        <div className="text-center py-5">
          <div className="spinner-border mb-3" role="status"></div>
          <p>Cargando actividad...</p>
        </div>
      </div>
    );
  }

  if (!actividad) {
    return (
      <div style={{ width: '100%', maxWidth: '100%', padding: '2rem', background: '#f4f8f9', borderRadius: '16px' }}>
        <div className="alert alert-danger">
          No se encontró la actividad
        </div>
        <Link href="/secretaria/actividades" className="btn btn-primary">
          Volver a Actividades
        </Link>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', maxWidth: '100%', padding: '2rem', background: '#f4f8f9', borderRadius: '16px' }}>
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link href="/secretaria/actividades">Actividades</Link>
          </li>
          <li className="breadcrumb-item active">Editar Actividad</li>
        </ol>
      </nav>

      <div className="card border-0 shadow">
        <div className="card-body p-4">
          <h1 className="h3 fw-bold mb-4">✏️ Editar Actividad</h1>

          {error && (
            <div className="alert alert-danger mb-4">
              <strong>Error:</strong> {error}
            </div>
          )}

          {/* Info de inscripciones */}
          <div className="alert alert-info mb-4">
            <strong>ℹ️ Información:</strong> Esta actividad tiene {actividad.cupo_maximo - actividad.cupo_disponible} inscripciones aprobadas de {actividad.cupo_maximo} cupos totales.
          </div>

          <form onSubmit={handleSubmit}>
            {/* Información básica */}
            <div className="mb-4">
              <h5 className="fw-bold mb-3">📋 Información Básica</h5>

              <div className="mb-3">
                <label htmlFor="titulo" className="form-label">
                  Título de la Actividad <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  id="titulo"
                  name="titulo"
                  className="form-control"
                  value={formData.titulo}
                  onChange={handleInputChange}
                  required
                  maxLength={200}
                  disabled={submitting}
                />
                <small className="text-muted">
                  {formData.titulo.length}/200 caracteres
                </small>
              </div>

              <div className="mb-3">
                <label htmlFor="descripcion" className="form-label">
                  Descripción <span className="text-danger">*</span>
                </label>
                <textarea
                  id="descripcion"
                  name="descripcion"
                  className="form-control"
                  rows="4"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  required
                  disabled={submitting}
                ></textarea>
              </div>

              <div className="row g-3">
                <div className="col-md-6">
                  <label htmlFor="categoria" className="form-label">
                    Categoría <span className="text-danger">*</span>
                  </label>
                  <select
                    id="categoria"
                    name="categoria"
                    className="form-select"
                    value={formData.categoria}
                    onChange={handleInputChange}
                    required
                    disabled={submitting}
                  >
                    <option value="deportiva">⚽ Deportiva</option>
                    <option value="cultural">🎨 Cultural</option>
                    <option value="educativa">📚 Educativa</option>
                    <option value="social">🤝 Social</option>
                    <option value="ambiental">🌱 Ambiental</option>
                    <option value="salud">❤️ Salud</option>
                    <option value="recreativa">🎉 Recreativa</option>
                    <option value="otro">📌 Otro</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label htmlFor="tipo" className="form-label">
                    Modalidad <span className="text-danger">*</span>
                  </label>
                  <select
                    id="tipo"
                    name="tipo"
                    className="form-select"
                    value={formData.tipo}
                    onChange={handleInputChange}
                    required
                    disabled={submitting}
                  >
                    <option value="presencial">📍 Presencial</option>
                    <option value="virtual">💻 Virtual</option>
                    <option value="hibrida">🔄 Híbrida</option>
                  </select>
                </div>
              </div>
            </div>

            <hr className="my-4" />

            {/* Fechas y ubicación */}
            <div className="mb-4">
              <h5 className="fw-bold mb-3">📅 Fechas y Ubicación</h5>

              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label htmlFor="fecha_inicio" className="form-label">
                    Fecha y Hora de Inicio <span className="text-danger">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    id="fecha_inicio"
                    name="fecha_inicio"
                    className="form-control"
                    value={formData.fecha_inicio}
                    onChange={handleInputChange}
                    required
                    disabled={submitting}
                  />
                </div>

                <div className="col-md-6">
                  <label htmlFor="fecha_fin" className="form-label">
                    Fecha y Hora de Fin <span className="text-danger">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    id="fecha_fin"
                    name="fecha_fin"
                    className="form-control"
                    value={formData.fecha_fin}
                    onChange={handleInputChange}
                    required
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className="mb-3">
                <label htmlFor="ubicacion" className="form-label">
                  Ubicación
                </label>
                <input
                  type="text"
                  id="ubicacion"
                  name="ubicacion"
                  className="form-control"
                  placeholder="Ej: Sede Junta de Vecinos, Multicancha, Sala Multiuso"
                  value={formData.ubicacion}
                  onChange={handleInputChange}
                  disabled={submitting}
                />
              </div>

              {(formData.tipo === 'virtual' || formData.tipo === 'hibrida') && (
                <div className="mb-3">
                  <label htmlFor="enlace_videollamada" className="form-label">
                    💻 Enlace de Videollamada {formData.tipo === 'virtual' && <span className="text-danger">*</span>}
                  </label>
                  <input
                    type="url"
                    id="enlace_videollamada"
                    name="enlace_videollamada"
                    className="form-control"
                    placeholder="https://zoom.us/j/... o https://meet.google.com/..."
                    value={formData.enlace_videollamada}
                    onChange={handleInputChange}
                    disabled={submitting}
                    required={formData.tipo === 'virtual'}
                  />
                  <small className="text-muted">
                    Este enlace será enviado por correo a los participantes aprobados y visible en la descripción de la actividad
                  </small>
                </div>
              )}
            </div>

            <hr className="my-4" />

            {/* Cupos y requisitos */}
            <div className="mb-4">
              <h5 className="fw-bold mb-3">👥 Cupos y Requisitos</h5>

              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label htmlFor="cupo_maximo" className="form-label">
                    Cupo Máximo <span className="text-danger">*</span>
                  </label>
                  <input
                    type="number"
                    id="cupo_maximo"
                    name="cupo_maximo"
                    className="form-control"
                    min={actividad.cupo_maximo - actividad.cupo_disponible}
                    value={formData.cupo_maximo}
                    onChange={handleInputChange}
                    required
                    disabled={submitting}
                  />
                  <small className="text-muted">
                    Mínimo: {actividad.cupo_maximo - actividad.cupo_disponible} (inscripciones ya aprobadas)
                  </small>
                </div>

                <div className="col-md-6">
                  <div className="form-check mt-4 pt-2">
                    <input
                      type="checkbox"
                      id="permite_lista_espera"
                      name="permite_lista_espera"
                      className="form-check-input"
                      checked={formData.permite_lista_espera}
                      onChange={handleInputChange}
                      disabled={submitting}
                    />
                    <label htmlFor="permite_lista_espera" className="form-check-label">
                      Permitir lista de espera
                    </label>
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <label htmlFor="requisitos" className="form-label">
                  Requisitos (opcional)
                </label>
                <textarea
                  id="requisitos"
                  name="requisitos"
                  className="form-control"
                  rows="3"
                  value={formData.requisitos}
                  onChange={handleInputChange}
                  disabled={submitting}
                ></textarea>
              </div>

              <div className="row g-3">
                <div className="col-md-6">
                  <label htmlFor="edad_minima" className="form-label">
                    Edad Mínima (opcional)
                  </label>
                  <input
                    type="number"
                    id="edad_minima"
                    name="edad_minima"
                    className="form-control"
                    min="0"
                    max="120"
                    value={formData.edad_minima}
                    onChange={handleInputChange}
                    disabled={submitting}
                  />
                </div>

                <div className="col-md-6">
                  <label htmlFor="edad_maxima" className="form-label">
                    Edad Máxima (opcional)
                  </label>
                  <input
                    type="number"
                    id="edad_maxima"
                    name="edad_maxima"
                    className="form-control"
                    min="0"
                    max="120"
                    value={formData.edad_maxima}
                    onChange={handleInputChange}
                    disabled={submitting}
                  />
                </div>
              </div>
            </div>

            <hr className="my-4" />

            {/* Costo */}
            <div className="mb-4">
              <h5 className="fw-bold mb-3">💰 Costo</h5>

              <div className="form-check mb-3">
                <input
                  type="checkbox"
                  id="es_gratuita"
                  name="es_gratuita"
                  className="form-check-input"
                  checked={formData.es_gratuita}
                  onChange={handleInputChange}
                  disabled={submitting}
                />
                <label htmlFor="es_gratuita" className="form-check-label fw-semibold">
                  Actividad gratuita
                </label>
              </div>

              {!formData.es_gratuita && (
                <div className="col-md-6">
                  <label htmlFor="costo" className="form-label">
                    Costo (CLP) <span className="text-danger">*</span>
                  </label>
                  <input
                    type="number"
                    id="costo"
                    name="costo"
                    className="form-control"
                    min="0"
                    step="100"
                    value={formData.costo}
                    onChange={handleInputChange}
                    required={!formData.es_gratuita}
                    disabled={submitting}
                  />
                </div>
              )}
            </div>

            <hr className="my-4" />

            {/* Estado */}
            <div className="mb-4">
              <h5 className="fw-bold mb-3">📋 Estado de Publicación</h5>

              <div className="mb-3">
                <label htmlFor="estado" className="form-label">
                  Estado <span className="text-danger">*</span>
                </label>
                <select
                  id="estado"
                  name="estado"
                  className="form-select"
                  value={formData.estado}
                  onChange={handleInputChange}
                  required
                  disabled={submitting}
                >
                  <option value="borrador">📝 Borrador</option>
                  <option value="publicada">📢 Publicada</option>
                  <option value="en_curso">🔄 En Curso</option>
                  <option value="finalizada">✅ Finalizada</option>
                  <option value="cancelada">❌ Cancelada</option>
                </select>
              </div>
            </div>

            {/* Botones */}
            <div className="d-flex gap-3">
              <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Guardando...
                  </>
                ) : (
                  '💾 Guardar Cambios'
                )}
              </button>
              <Link href="/secretaria/actividades" className="btn btn-outline-secondary btn-lg">
                Cancelar
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
