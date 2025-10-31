'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import ImageUploader from '@/components/noticias/ImageUploader';
import { uploadNoticiaImage, deleteNoticiaImage } from '@/lib/storage/imageHelpers';

export default function EditarAvisoPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [aviso, setAviso] = useState(null);
  const [currentImageUrl, setCurrentImageUrl] = useState(null);
  const [newImage, setNewImage] = useState(null);
  const [imageRemoved, setImageRemoved] = useState(false);
  const [formData, setFormData] = useState({
    titulo: '',
    mensaje: '',
    tipo: 'informativo',
    prioridad: 'media',
    estado: 'activo',
    destacado: false,
    fecha_fin: ''
  });

  useEffect(() => {
    if (params.id) {
      fetchAviso();
    }
  }, [params.id]);

  const fetchAviso = async () => {
    try {
      setLoading(true);
      const supabase = createClient();

      const { data, error } = await supabase
        .from('avisos')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error) throw error;

      setAviso(data);
      // Guardar URL de imagen actual si existe
      setCurrentImageUrl(data.imagen_url || null);
      setFormData({
        titulo: data.titulo || '',
        mensaje: data.mensaje || '',
        tipo: data.tipo || 'informativo',
        prioridad: data.prioridad || 'media',
        estado: data.estado || 'activo',
        destacado: data.destacado || false,
        fecha_fin: data.fecha_fin ? data.fecha_fin.slice(0, 16) : ''
      });
    } catch (error) {
      console.error('Error fetching aviso:', error);
      alert('Error al cargar el aviso');
      router.push('/secretaria/avisos');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageRemove = () => {
    setImageRemoved(true);
    setCurrentImageUrl(null);
    setNewImage(null);
  };

  const handleNewImageSelect = (file) => {
    setNewImage(file);
    if (file) {
      setImageRemoved(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.titulo.trim() || !formData.mensaje.trim()) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    try {
      setSaving(true);
      const supabase = createClient();

      let imageUrl = currentImageUrl;

      // Manejar eliminación de imagen
      if (imageRemoved && currentImageUrl) {
        await deleteNoticiaImage(currentImageUrl);
        imageUrl = null;
      }

      // Manejar nueva imagen
      if (newImage) {
        // Si había imagen anterior, eliminarla
        if (currentImageUrl) {
          await deleteNoticiaImage(currentImageUrl);
        }
        // Subir nueva imagen
        try {
          imageUrl = await uploadNoticiaImage(newImage, params.id);
          setCurrentImageUrl(imageUrl);
        } catch (imageError) {
          console.error('Error al subir nueva imagen:', imageError);
          // Continuar con la actualización aunque falle la imagen
        }
      }

      const dataToSave = {
        ...formData,
        imagen_url: imageUrl,
        fecha_fin: formData.fecha_fin || null
      };

      const { error } = await supabase
        .from('avisos')
        .update(dataToSave)
        .eq('id', params.id);

      if (error) {
        console.error('Error updating aviso:', error);
        throw error;
      }

      alert('Aviso actualizado exitosamente');
      router.push('/secretaria/avisos');
    } catch (error) {
      console.error('Error al actualizar aviso:', error);
      alert('Error al actualizar el aviso: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="text-center py-5">
          <div className="spinner-border mb-3" role="status"></div>
          <p>Cargando aviso...</p>
        </div>
      </div>
    );
  }

  if (!aviso) {
    return (
      <div className="page-container">
        <div className="alert alert-danger">
          Aviso no encontrado
        </div>
        <Link href="/secretaria/avisos" className="btn btn-secondary">
          Volver
        </Link>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>✏️ Editar Aviso</h1>
          <p className="text-muted">Modifica la información del aviso</p>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-8">
          <div className="card">
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                {/* Título */}
                <div className="mb-3">
                  <label htmlFor="titulo" className="form-label">
                    Título del Aviso <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="titulo"
                    name="titulo"
                    value={formData.titulo}
                    onChange={handleChange}
                    placeholder="Ej: Corte de Agua Programado"
                    maxLength={200}
                    required
                  />
                  <small className="text-muted">
                    {formData.titulo.length}/200 caracteres
                  </small>
                </div>

                {/* Mensaje */}
                <div className="mb-3">
                  <label htmlFor="mensaje" className="form-label">
                    Mensaje <span className="text-danger">*</span>
                  </label>
                  <textarea
                    className="form-control"
                    id="mensaje"
                    name="mensaje"
                    value={formData.mensaje}
                    onChange={handleChange}
                    rows={6}
                    placeholder="Escribe el mensaje completo del aviso..."
                    required
                  />
                  <small className="text-muted">
                    {formData.mensaje.length} caracteres
                  </small>
                </div>

                {/* Tipo y Prioridad */}
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label htmlFor="tipo" className="form-label">
                      Tipo de Aviso
                    </label>
                    <select
                      className="form-select"
                      id="tipo"
                      name="tipo"
                      value={formData.tipo}
                      onChange={handleChange}
                    >
                      <option value="informativo">Informativo</option>
                      <option value="urgente">Urgente</option>
                      <option value="mantenimiento">Mantenimiento</option>
                      <option value="evento">Evento</option>
                      <option value="corte_servicio">Corte de Servicio</option>
                      <option value="seguridad">Seguridad</option>
                      <option value="otro">Otro</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="prioridad" className="form-label">
                      Prioridad
                    </label>
                    <select
                      className="form-select"
                      id="prioridad"
                      name="prioridad"
                      value={formData.prioridad}
                      onChange={handleChange}
                    >
                      <option value="baja">Baja</option>
                      <option value="media">Media</option>
                      <option value="alta">Alta</option>
                      <option value="critica">Crítica</option>
                    </select>
                  </div>
                </div>

                {/* Estado y Fecha Fin */}
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label htmlFor="estado" className="form-label">
                      Estado
                    </label>
                    <select
                      className="form-select"
                      id="estado"
                      name="estado"
                      value={formData.estado}
                      onChange={handleChange}
                    >
                      <option value="activo">Activo</option>
                      <option value="inactivo">Inactivo</option>
                      <option value="archivado">Archivado</option>
                    </select>
                    <small className="text-muted">
                      Los avisos inactivos no se muestran a los vecinos
                    </small>
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="fecha_fin" className="form-label">
                      Fecha de Finalización (opcional)
                    </label>
                    <input
                      type="datetime-local"
                      className="form-control"
                      id="fecha_fin"
                      name="fecha_fin"
                      value={formData.fecha_fin}
                      onChange={handleChange}
                    />
                    <small className="text-muted">
                      El aviso se ocultará automáticamente después de esta fecha
                    </small>
                  </div>
                </div>

                {/* Destacado */}
                <div className="mb-4">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="destacado"
                      name="destacado"
                      checked={formData.destacado}
                      onChange={handleChange}
                    />
                    <label className="form-check-label" htmlFor="destacado">
                      ⭐ Marcar como destacado
                    </label>
                    <small className="form-text d-block text-muted">
                      Los avisos destacados se muestran prominentemente en el dashboard
                    </small>
                  </div>
                </div>

                {/* Imagen del Aviso */}
                <div className="mb-4">
                  <label className="form-label">
                    🖼️ Imagen del Aviso (opcional)
                  </label>
                  <ImageUploader
                    onImageSelect={handleNewImageSelect}
                    currentImage={currentImageUrl}
                    onImageRemove={handleImageRemove}
                  />
                  <small className="text-muted d-block mt-2">
                    La imagen se mostrará en el aviso para mayor impacto visual. Se optimizará automáticamente.
                  </small>
                </div>

                {/* Botones */}
                <div className="d-flex gap-2">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Guardando...
                      </>
                    ) : (
                      '💾 Guardar Cambios'
                    )}
                  </button>
                  <Link href="/secretaria/avisos" className="btn btn-secondary">
                    Cancelar
                  </Link>
                </div>
              </form>
            </div>
          </div>

          {/* Información del aviso */}
          <div className="card mt-3">
            <div className="card-body">
              <h6 className="card-title">ℹ️ Información del Aviso</h6>
              <div className="row">
                <div className="col-md-6">
                  <small className="text-muted d-block">Creado:</small>
                  <span>{new Date(aviso.created_at).toLocaleString('es-CL')}</span>
                </div>
                <div className="col-md-6">
                  <small className="text-muted d-block">Última modificación:</small>
                  <span>{new Date(aviso.updated_at).toLocaleString('es-CL')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Panel de ayuda */}
        <div className="col-lg-4">
          <div className="card bg-light">
            <div className="card-body">
              <h6 className="card-title">💡 Consejos</h6>
              <ul className="small mb-0">
                <li className="mb-2">
                  <strong>Actualizaciones:</strong> Si modificas un aviso importante, considera cambiar el título para que los vecinos noten el cambio
                </li>
                <li className="mb-2">
                  <strong>Estado:</strong> Usa "Inactivo" para ocultar temporalmente un aviso sin eliminarlo
                </li>
                <li>
                  <strong>Archivar:</strong> Archiva avisos antiguos para mantener el tablón limpio
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
