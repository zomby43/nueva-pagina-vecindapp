'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import ImageUploader from '@/components/noticias/ImageUploader';
import { uploadNoticiaImage } from '@/lib/storage/imageHelpers';

export default function NuevoAvisoPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [formData, setFormData] = useState({
    titulo: '',
    mensaje: '',
    tipo: 'informativo',
    prioridad: 'media',
    estado: 'activo',
    destacado: false,
    fecha_fin: ''
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.titulo.trim() || !formData.mensaje.trim()) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    try {
      setLoading(true);
      const supabase = createClient();

      const dataToSave = {
        ...formData,
        autor_id: user.id,
        fecha_fin: formData.fecha_fin || null
      };

      // Crear el aviso primero para obtener el ID
      const { data, error } = await supabase
        .from('avisos')
        .insert([dataToSave])
        .select()
        .single();

      if (error) {
        console.error('Error creating aviso:', error);
        throw error;
      }

      // Si hay imagen seleccionada, subirla y actualizar el aviso
      console.log('🖼️ Verificando imagen seleccionada:', {
        hasImage: !!selectedImage,
        hasData: !!data,
        avisoId: data?.id,
        imageType: selectedImage?.type,
        imageSize: selectedImage?.size
      });

      if (selectedImage && data) {
        console.log('✅ Hay imagen y aviso creado. Procediendo a subir imagen...');
        try {
          // Usar 'portadas' como carpeta (bucket: noticias-imagenes)
          console.log('📤 Llamando uploadNoticiaImage...');
          const imageUrl = await uploadNoticiaImage(selectedImage, data.id, 'portadas');
          console.log('✅ Imagen subida, URL recibida:', imageUrl);

          // Actualizar el aviso con la URL de la imagen
          console.log('💾 Actualizando aviso con URL de imagen...');
          const { error: updateError } = await supabase
            .from('avisos')
            .update({ imagen_url: imageUrl })
            .eq('id', data.id);

          if (updateError) {
            console.error('❌ Error al actualizar imagen_url:', updateError);
            // No fallar si la imagen no se pudo guardar, el aviso ya está creado
          } else {
            console.log('✅ Aviso actualizado con imagen_url correctamente');
          }
        } catch (imageError) {
          console.error('❌ ERROR AL SUBIR IMAGEN:', imageError);
          console.error('❌ Mensaje:', imageError.message);
          console.error('❌ Stack:', imageError.stack);
          // No fallar si la imagen no se pudo subir, el aviso ya está creado
        }
      } else {
        console.log('ℹ️ No hay imagen seleccionada o no se creó el aviso');
      }

      // Si se publicó como activo, enviar notificaciones a través del API
      console.log('🔍 DEBUG AVISOS - formData.estado:', formData.estado);
      console.log('🔍 DEBUG AVISOS - data exists:', !!data);
      console.log('🔍 DEBUG AVISOS - data.id:', data?.id);

      if (formData.estado === 'activo' && data) {
        try {
          console.log('📧 Enviando notificaciones de aviso vía API...');

          const notifResponse = await fetch('/api/avisos/publicar', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              avisoId: data.id
            }),
          });

          const notifResult = await notifResponse.json();

          if (!notifResponse.ok) {
            throw new Error(notifResult.error || 'Error enviando notificaciones');
          }

          console.log('✅ Notificaciones de aviso enviadas exitosamente');
          console.log('✅ Resultado:', notifResult);
        } catch (emailError) {
          console.error('⚠️ Error enviando notificaciones de aviso:', emailError);
          console.error('⚠️ Detalles del error:', emailError.message);
          alert(`El aviso se creó, pero hubo un problema enviando las notificaciones: ${emailError.message}`);
        }
      } else {
        console.log('ℹ️ No se envían notificaciones de aviso porque:', {
          estado_es_activo: formData.estado === 'activo',
          data_existe: !!data
        });
      }

      alert('Aviso creado exitosamente');
      router.push('/secretaria/avisos');
    } catch (error) {
      console.error('Error al crear el aviso:', error);
      alert('Error al crear el aviso: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>➕ Crear Nuevo Aviso</h1>
          <p className="text-muted">Publica un aviso importante para los vecinos</p>
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

                {/* Estado y Destacado */}
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label htmlFor="estado" className="form-label">
                      Estado Inicial
                    </label>
                    <select
                      className="form-select"
                      id="estado"
                      name="estado"
                      value={formData.estado}
                      onChange={handleChange}
                    >
                      <option value="activo">Activo</option>
                      <option value="inactivo">Inactivo (borrador)</option>
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
                    onImageSelect={setSelectedImage}
                    currentImage={null}
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
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Creando...
                      </>
                    ) : (
                      '✅ Crear Aviso'
                    )}
                  </button>
                  <Link href="/secretaria/avisos" className="btn btn-secondary">
                    Cancelar
                  </Link>
                </div>
              </form>
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
                  <strong>Título claro:</strong> Usa un título descriptivo y conciso
                </li>
                <li className="mb-2">
                  <strong>Mensaje completo:</strong> Incluye todos los detalles importantes (fechas, horarios, contactos)
                </li>
                <li className="mb-2">
                  <strong>Tipo adecuado:</strong> Selecciona el tipo correcto para que los vecinos identifiquen rápidamente el aviso
                </li>
                <li className="mb-2">
                  <strong>Prioridad:</strong> Usa "Crítica" solo para emergencias o avisos muy urgentes
                </li>
                <li>
                  <strong>Destacados:</strong> No abuses de los avisos destacados, úsalos solo para lo más importante
                </li>
              </ul>
            </div>
          </div>

          <div className="card mt-3">
            <div className="card-body">
              <h6 className="card-title">📋 Tipos de Aviso</h6>
              <ul className="small mb-0">
                <li><span className="badge bg-info">Informativo</span> - Información general</li>
                <li><span className="badge bg-danger">Urgente</span> - Requiere atención inmediata</li>
                <li><span className="badge bg-warning text-dark">Mantenimiento</span> - Trabajos programados</li>
                <li><span className="badge bg-success">Evento</span> - Actividades y eventos</li>
                <li><span className="badge bg-warning text-dark">Corte de Servicio</span> - Interrupción de servicios</li>
                <li><span className="badge bg-danger">Seguridad</span> - Temas de seguridad</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
