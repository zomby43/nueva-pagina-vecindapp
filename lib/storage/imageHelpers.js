import imageCompression from 'browser-image-compression';
import { createClient } from '@/lib/supabase/client';

/**
 * Opciones de compresión para imágenes de noticias
 */
const compressionOptions = {
  maxSizeMB: 0.3, // Tamaño máximo después de compresión: 300KB
  maxWidthOrHeight: 800, // Dimensión máxima (mantiene aspect ratio)
  useWebWorker: true,
  fileType: 'image/webp', // Convertir a WebP para mejor compresión
  initialQuality: 0.8, // Calidad del 80%
};

/**
 * Comprime una imagen usando browser-image-compression
 * @param {File} file - Archivo de imagen original
 * @returns {Promise<File>} - Archivo comprimido
 */
export async function compressImage(file) {
  try {
    console.log('Tamaño original:', (file.size / 1024 / 1024).toFixed(2), 'MB');

    const compressedFile = await imageCompression(file, compressionOptions);

    console.log('Tamaño comprimido:', (compressedFile.size / 1024 / 1024).toFixed(2), 'MB');
    console.log('Reducción:', ((1 - compressedFile.size / file.size) * 100).toFixed(1), '%');

    return compressedFile;
  } catch (error) {
    console.error('Error al comprimir imagen:', error);
    throw new Error('No se pudo comprimir la imagen');
  }
}

/**
 * Sube una imagen de noticia a Supabase Storage
 * @param {File} file - Archivo de imagen (ya comprimido)
 * @param {string} noticiaId - ID de la noticia o aviso
 * @param {string} folder - Carpeta donde guardar (por defecto 'portadas')
 * @returns {Promise<string>} - URL pública de la imagen
 */
export async function uploadNoticiaImage(file, noticiaId, folder = 'portadas') {
  const supabase = createClient();

  try {
    // Generar nombre único para el archivo
    const timestamp = Date.now();
    const fileExt = 'webp'; // Siempre WebP después de compresión
    const fileName = `${noticiaId}_${timestamp}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    console.log('Subiendo imagen a:', filePath);

    // Subir archivo a Supabase Storage
    const { data, error } = await supabase.storage
      .from('noticias-imagenes')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Error al subir imagen:', error);
      throw error;
    }

    console.log('Imagen subida exitosamente:', data);

    // Obtener URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('noticias-imagenes')
      .getPublicUrl(filePath);

    console.log('URL pública generada:', publicUrl);

    return publicUrl;
  } catch (error) {
    console.error('Error en uploadNoticiaImage:', error);
    throw new Error('No se pudo subir la imagen: ' + error.message);
  }
}

/**
 * Elimina una imagen de noticia de Supabase Storage
 * @param {string} imageUrl - URL completa de la imagen
 * @returns {Promise<boolean>} - True si se eliminó correctamente
 */
export async function deleteNoticiaImage(imageUrl) {
  if (!imageUrl) return false;

  const supabase = createClient();

  try {
    // Extraer el path del archivo de la URL
    // URL formato: https://xxxxx.supabase.co/storage/v1/object/public/noticias-imagenes/portadas/file.webp
    const urlParts = imageUrl.split('/noticias-imagenes/');
    if (urlParts.length !== 2) {
      console.error('URL de imagen inválida:', imageUrl);
      return false;
    }

    const filePath = urlParts[1];

    // Eliminar archivo de Storage
    const { error } = await supabase.storage
      .from('noticias-imagenes')
      .remove([filePath]);

    if (error) {
      console.error('Error al eliminar imagen:', error);
      return false;
    }

    console.log('Imagen eliminada:', filePath);
    return true;
  } catch (error) {
    console.error('Error en deleteNoticiaImage:', error);
    return false;
  }
}

/**
 * Obtiene la URL pública de una imagen en Storage
 * @param {string} path - Path del archivo en el bucket
 * @returns {string} - URL pública
 */
export function getPublicUrl(path) {
  const supabase = createClient();

  const { data: { publicUrl } } = supabase.storage
    .from('noticias-imagenes')
    .getPublicUrl(path);

  return publicUrl;
}

/**
 * Valida que un archivo sea una imagen válida
 * @param {File} file - Archivo a validar
 * @returns {Object} - {valid: boolean, error: string}
 */
export function validateImageFile(file) {
  // Validar tipo de archivo
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Tipo de archivo no válido. Solo se permiten JPG, PNG y WebP.',
    };
  }

  // Validar tamaño (máximo 5MB original)
  const maxSizeMB = 5;
  const fileSizeMB = file.size / 1024 / 1024;
  if (fileSizeMB > maxSizeMB) {
    return {
      valid: false,
      error: `El archivo es demasiado grande (${fileSizeMB.toFixed(1)}MB). Máximo ${maxSizeMB}MB.`,
    };
  }

  return { valid: true, error: null };
}
