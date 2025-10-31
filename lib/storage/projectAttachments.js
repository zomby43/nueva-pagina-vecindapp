import { createClient } from '@/lib/supabase/client';

const BUCKET = 'proyectos-adjuntos';

const slugify = (value) => {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
};

export async function uploadProjectAttachment(file, projectId, category = 'documentos') {
  if (!file || !projectId) {
    throw new Error('Archivo o proyecto inválido');
  }

  const supabase = createClient();
  const timestamp = Date.now();
  const baseCategory = category === 'imagenes' ? 'imagenes' : 'documentos';
  const originalName = file.name || 'archivo';
  const originalExtension = originalName.includes('.')
    ? originalName.split('.').pop().toLowerCase()
    : '';
  const fileExt = originalExtension || (file.type?.startsWith('image/') ? 'webp' : 'bin');
  const baseName = originalName.replace(/\.[^.]+$/, '');
  const safeBaseName = slugify(baseName) || `archivo-${timestamp}`;
  const finalFileName = `${safeBaseName}-${timestamp}.${fileExt}`;
  const storagePath = `${baseCategory}/${projectId}/${finalFileName}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || undefined,
    });

  if (error) {
    console.error('Error al subir adjunto de proyecto:', error);
    throw error;
  }

  const { data: { publicUrl } } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(storagePath);

  return {
    publicUrl,
    storagePath,
    fileName: finalFileName,
    extension: fileExt,
    mimeType: file.type || null,
    size: file.size ?? null,
    originalName,
  };
}

export async function deleteProjectAttachment(storagePath) {
  if (!storagePath) return false;

  const supabase = createClient();
  const { error } = await supabase.storage
    .from(BUCKET)
    .remove([storagePath]);

  if (error) {
    console.error('Error al eliminar adjunto de proyecto:', error);
    throw error;
  }

  return true;
}
