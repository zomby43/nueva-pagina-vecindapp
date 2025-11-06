'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import ImageUploader from '@/components/noticias/ImageUploader';
import { uploadNoticiaImage, deleteNoticiaImage } from '@/lib/storage/imageHelpers';
import * as emailHelpers from '@/lib/emails/sendEmail';

// Importar RichTextEditor dinámicamente para evitar problemas de SSR
const RichTextEditor = dynamic(() => import('@/components/ui/RichTextEditor'), {
  ssr: false,
  loading: () => <div className="p-3 text-center">Cargando editor...</div>
});

export default function EditarNoticiaPage() {
  const params = useParams();
  const router = useRouter();
  const { user, userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [currentImageUrl, setCurrentImageUrl] = useState(null);
  const [newImage, setNewImage] = useState(null);
  const [imageRemoved, setImageRemoved] = useState(false);

  const [formData, setFormData] = useState({
    titulo: '',
    resumen: '',
    contenido: '',
    categoria: 'general',
    destacado: false,
    estado: 'borrador'
  });

  const [estadoOriginal, setEstadoOriginal] = useState('borrador'); // Para detectar si cambió de borrador a publicado

  useEffect(() => {
    if (params.id && user && userProfile?.rol === 'secretaria') {
      fetchNoticia();
    }
  }, [params.id, user, userProfile]);

  const fetchNoticia = async () => {
    try {
      setLoading(true);
      setError('');
      const supabase = createClient();

      const { data, error } = await supabase
        .from('noticias')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error) {
        console.error('Error fetching noticia:', error);
        throw error;
      }

      if (!data) {
        setError('Noticia no encontrada');
        return;
      }

      setFormData({
        titulo: data.titulo || '',
        resumen: data.resumen || '',
        contenido: data.contenido || '',
        categoria: data.categoria || 'general',
        destacado: data.destacado || false,
        estado: data.estado || 'borrador'
      });

      // Guardar estado original para detectar cambios
      setEstadoOriginal(data.estado || 'borrador');

      // Guardar URL de imagen actual si existe
      setCurrentImageUrl(data.imagen_url || null);

    } catch (error) {
      console.error('Error completo:', error);
      setError('Error al cargar la noticia');
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
        } catch (imageError) {
          console.error('Error al subir nueva imagen:', imageError);
          // Continuar con la actualización aunque falle la imagen
        }
      }

      const dataToSave = {
        ...formData,
        imagen_url: imageUrl,
        // Si se cambia de borrador a publicado, agregar fecha de publicación
        fecha_publicacion: formData.estado === 'publicado' ? new Date().toISOString() : null
      };

      const { error } = await supabase
        .from('noticias')
        .update(dataToSave)
        .eq('id', params.id);

      if (error) {
        console.error('Error updating noticia:', error);
        throw error;
      }

      // Si cambió de borrador a publicado, enviar correos
      if (estadoOriginal !== 'publicado' && formData.estado === 'publicado') {
        try {
          console.log('📧 Helpers de email disponibles:', Object.keys(emailHelpers));
          const enviarCorreoNuevaNoticiaFn =
            emailHelpers.enviarCorreoNuevaNoticia ||
            emailHelpers.default?.enviarCorreoNuevaNoticia;

          if (typeof enviarCorreoNuevaNoticiaFn !== 'function') {
            throw new Error('Helper enviarCorreoNuevaNoticia no disponible. Exportaciones actuales: ' + JSON.stringify(Object.keys(emailHelpers)));
          }
          console.log('📧 Enviando notificaciones por correo...');
          await enviarCorreoNuevaNoticiaFn(
            formData.titulo,
            formData.resumen || '',
            formData.categoria,
            params.id
          );
          console.log('✅ Correos enviados exitosamente');
        } catch (emailError) {
          console.error('⚠️ Error enviando correos:', emailError);
          // No fallar la operación principal si los correos fallan
        }
      }

      alert('Noticia actualizada exitosamente');
      router.push('/secretaria/noticias');

    } catch (error) {
      console.error('Error al actualizar noticia:', error);
      setError('Error al actualizar la noticia');
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
            <p>Cargando noticia...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !formData.titulo) {
    return (
      <div className="page-container">
        <div className="alert alert-danger">
          <h5>Error</h5>
          <p>{error}</p>
          <button onClick={() => router.back()} className="btn btn-primary mt-2">
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Editar Noticia</h1>
        <p className="text-muted">Modificar la noticia existente</p>
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
                    onImageSelect={setNewImage}
                    currentImage={currentImageUrl}
                    onImageRemove={handleImageRemove}
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
                  <label className="form-label">
                    Contenido <span className="text-danger">*</span>
                  </label>
                  <p className="text-muted small mb-2">
                    Usa el editor para dar formato al texto e insertar imágenes dentro del contenido.
                  </p>
                  <RichTextEditor
                    value={formData.contenido}
                    onChange={(content) => setFormData(prev => ({ ...prev, contenido: content }))}
                    placeholder="Escribe el contenido completo de la noticia aquí... Puedes insertar imágenes haciendo click en el ícono de imagen 🖼️"
                    minHeight={350}
                  />
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
                      <option value="borrador">Borrador</option>
                      <option value="publicado">Publicado</option>
                      <option value="archivado">Archivado</option>
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
                ) : (
                  '💾 Guardar Cambios'
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
                <li>Revisa la ortografía antes de publicar</li>
                <li>Actualiza el resumen si cambias el contenido</li>
                <li>Usa categorías apropiadas</li>
                <li>Puedes cambiar entre borrador y publicado</li>
                <li>Las noticias destacadas llaman más la atención</li>
              </ul>
            </div>
          </div>

          <div className="card bg-light mt-3">
            <div className="card-body">
              <h6 className="card-title">ℹ️ Estados</h6>
              <ul className="small mb-0">
                <li><strong>Borrador:</strong> Solo visible para ti</li>
                <li><strong>Publicado:</strong> Visible para todos los vecinos</li>
                <li><strong>Archivado:</strong> Oculto del feed principal</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
