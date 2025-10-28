'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import ImageUploader from '@/components/noticias/ImageUploader';
import { uploadNoticiaImage } from '@/lib/storage/imageHelpers';

export default function NuevaNoticiaPage() {
  const router = useRouter();
  const { user, userProfile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);

  const [formData, setFormData] = useState({
    titulo: '',
    resumen: '',
    contenido: '',
    categoria: 'general',
    destacado: false,
    estado: 'borrador'
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

    if (!formData.titulo.trim() || !formData.contenido.trim()) {
      setError('El título y el contenido son obligatorios');
      return;
    }

    try {
      setSaving(true);
      setError('');

      const supabase = createClient();

      // Preparar datos base
      const dataToSave = {
        ...formData,
        autor_id: user.id,
        // Si se publica directamente, agregar fecha de publicación
        fecha_publicacion: formData.estado === 'publicado' ? new Date().toISOString() : null
      };

      // Crear la noticia primero para obtener el ID
      const { data, error } = await supabase
        .from('noticias')
        .insert([dataToSave])
        .select()
        .single();

      if (error) {
        console.error('Error creating noticia:', error);
        throw error;
      }

      // Si hay imagen seleccionada, subirla y actualizar la noticia
      if (selectedImage && data) {
        try {
          const imageUrl = await uploadNoticiaImage(selectedImage, data.id);

          // Actualizar la noticia con la URL de la imagen
          const { error: updateError } = await supabase
            .from('noticias')
            .update({ imagen_url: imageUrl })
            .eq('id', data.id);

          if (updateError) {
            console.error('Error al actualizar imagen_url:', updateError);
            // No fallar si la imagen no se pudo guardar, la noticia ya está creada
          }
        } catch (imageError) {
          console.error('Error al subir imagen:', imageError);
          // No fallar si la imagen no se pudo subir, la noticia ya está creada
        }
      }

      alert(`Noticia ${formData.estado === 'publicado' ? 'publicada' : 'guardada como borrador'} exitosamente`);
      router.push('/secretaria/noticias');

    } catch (error) {
      console.error('Error al guardar noticia:', error);
      setError('Error al guardar la noticia');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Nueva Noticia</h1>
        <p className="text-muted">Crear una nueva noticia o comunicado</p>
      </div>

      <div className="row">
        <div className="col-lg-8">
          {error && (
            <div className="alert alert-danger mb-4">
              <strong>Error:</strong> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="mb-0">Información de la Noticia</h5>
              </div>
              <div className="card-body">
                {/* Imagen de Portada */}
                <div className="mb-4">
                  <label className="form-label">
                    Imagen de Portada (opcional)
                  </label>
                  <ImageUploader
                    onImageSelect={setSelectedImage}
                    currentImage={null}
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="titulo" className="form-label">
                    Título <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="titulo"
                    name="titulo"
                    value={formData.titulo}
                    onChange={handleChange}
                    placeholder="Ej: Próxima Reunión de Junta de Vecinos"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="resumen" className="form-label">
                    Resumen (opcional)
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="resumen"
                    name="resumen"
                    value={formData.resumen}
                    onChange={handleChange}
                    placeholder="Breve resumen de la noticia (se mostrará en el listado)"
                    maxLength="200"
                  />
                  <small className="text-muted">{formData.resumen.length}/200 caracteres</small>
                </div>

                <div className="mb-3">
                  <label htmlFor="contenido" className="form-label">
                    Contenido <span className="text-danger">*</span>
                  </label>
                  <textarea
                    className="form-control"
                    id="contenido"
                    name="contenido"
                    value={formData.contenido}
                    onChange={handleChange}
                    rows="10"
                    placeholder="Escribe el contenido completo de la noticia aquí..."
                    required
                  ></textarea>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="categoria" className="form-label">
                      Categoría
                    </label>
                    <select
                      className="form-select"
                      id="categoria"
                      name="categoria"
                      value={formData.categoria}
                      onChange={handleChange}
                    >
                      <option value="general">General</option>
                      <option value="eventos">Eventos</option>
                      <option value="obras">Obras</option>
                      <option value="seguridad">Seguridad</option>
                      <option value="medio_ambiente">Medio Ambiente</option>
                      <option value="cultura">Cultura</option>
                      <option value="deportes">Deportes</option>
                      <option value="otro">Otro</option>
                    </select>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="estado" className="form-label">
                      Estado de Publicación
                    </label>
                    <select
                      className="form-select"
                      id="estado"
                      name="estado"
                      value={formData.estado}
                      onChange={handleChange}
                    >
                      <option value="borrador">Guardar como Borrador</option>
                      <option value="publicado">Publicar Ahora</option>
                    </select>
                  </div>
                </div>

                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="destacado"
                    name="destacado"
                    checked={formData.destacado}
                    onChange={handleChange}
                  />
                  <label className="form-check-label" htmlFor="destacado">
                    Marcar como noticia destacada
                  </label>
                  <small className="d-block text-muted">
                    Las noticias destacadas aparecen primero en el feed
                  </small>
                </div>
              </div>
            </div>

            <div className="d-flex justify-content-between">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => router.back()}
                disabled={saving}
              >
                Cancelar
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
                ) : formData.estado === 'publicado' ? (
                  '📢 Publicar Noticia'
                ) : (
                  '💾 Guardar Borrador'
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="col-lg-4">
          <div className="card bg-light">
            <div className="card-body">
              <h6 className="card-title">💡 Consejos</h6>
              <ul className="small mb-0">
                <li>Usa un título claro y descriptivo</li>
                <li>El resumen ayuda a captar la atención</li>
                <li>Escribe el contenido de forma clara y concisa</li>
                <li>Usa las categorías para organizar las noticias</li>
                <li>Puedes guardar como borrador y publicar después</li>
              </ul>
            </div>
          </div>

          <div className="card bg-light mt-3">
            <div className="card-body">
              <h6 className="card-title">📝 Ejemplo de Estructura</h6>
              <p className="small mb-2"><strong>Título:</strong> Próxima Reunión de Vecinos</p>
              <p className="small mb-2"><strong>Resumen:</strong> Les recordamos la reunión mensual de este sábado.</p>
              <p className="small mb-0"><strong>Contenido:</strong> Estimados vecinos, les recordamos que este sábado 15 de febrero a las 10:00 AM...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
