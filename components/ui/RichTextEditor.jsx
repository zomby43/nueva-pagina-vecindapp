'use client';

import { useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';
import { compressImage } from '@/lib/storage/imageHelpers';
import { createClient } from '@/lib/supabase/client';

// Importar ReactQuill dinámicamente (solo en el cliente)
const ReactQuillNoSSR = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => <div className="p-3 text-center text-muted">Cargando editor...</div>
});

/**
 * Editor de texto enriquecido con soporte para imágenes
 *
 * Features:
 * - Formateo de texto (negrita, cursiva, subrayado, tachado)
 * - Títulos (H1, H2, H3)
 * - Listas (ordenadas y no ordenadas)
 * - Enlaces
 * - Inserción de imágenes optimizadas
 * - Compresión automática de imágenes
 * - Upload a Supabase Storage
 * - Alineación de texto
 * - Colores de texto
 *
 * @param {string} value - Contenido HTML del editor
 * @param {function} onChange - Callback cuando cambia el contenido
 * @param {string} placeholder - Texto placeholder
 * @param {number} minHeight - Altura mínima del editor (default: 300px)
 */
export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Escribe el contenido aquí...',
  minHeight = 300
}) {
  // No necesitamos ref porque usamos this.quill en el handler

  // Handler para subir imágenes - usando this del toolbar
  const imageHandler = function() {
    console.log('🖼️ [RichTextEditor] imageHandler iniciado');
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');

    // Guardar referencia al editor desde el contexto de Quill
    const quillEditor = this.quill;

    input.onchange = async () => {
      const file = input.files[0];
      console.log('📁 [RichTextEditor] Archivo seleccionado:', file?.name, file?.size, file?.type);

      if (!file) {
        console.log('❌ [RichTextEditor] No se seleccionó archivo');
        return;
      }

      // Validar tamaño (máx 5MB)
      if (file.size > 5 * 1024 * 1024) {
        console.log('❌ [RichTextEditor] Archivo muy grande:', file.size);
        alert('La imagen es demasiado grande. Tamaño máximo: 5MB');
        return;
      }

      // Validar tipo
      if (!file.type.startsWith('image/')) {
        console.log('❌ [RichTextEditor] Tipo de archivo inválido:', file.type);
        alert('Solo se permiten archivos de imagen');
        return;
      }

      try {
        console.log('✅ [RichTextEditor] Validaciones pasadas, iniciando subida...');

        // Usar la referencia guardada del editor
        if (!quillEditor) {
          console.log('❌ [RichTextEditor] No se pudo obtener el editor Quill');
          return;
        }

        const range = quillEditor.getSelection(true);
        console.log('📍 [RichTextEditor] Posición del cursor:', range);

        quillEditor.insertText(range.index, 'Subiendo imagen... ⏳');
        quillEditor.setSelection(range.index + 21);

        console.log('🔄 [RichTextEditor] Comprimiendo imagen...');
        // Comprimir imagen
        const compressedFile = await compressImage(file);
        console.log('✅ [RichTextEditor] Imagen comprimida:', compressedFile.size);

        // Subir a Supabase
        console.log('☁️ [RichTextEditor] Subiendo a Supabase...');
        const supabase = createClient();
        const fileName = `noticia-content-${Date.now()}.webp`;
        const filePath = `portadas/${fileName}`;

        console.log('📂 [RichTextEditor] Ruta de subida:', filePath);

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('noticias-imagenes')
          .upload(filePath, compressedFile, {
            contentType: 'image/webp',
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error('❌ [RichTextEditor] Error al subir imagen:', uploadError);
          throw uploadError;
        }

        console.log('✅ [RichTextEditor] Imagen subida exitosamente:', uploadData);

        // Obtener URL pública
        const { data: { publicUrl } } = supabase.storage
          .from('noticias-imagenes')
          .getPublicUrl(filePath);

        console.log('🔗 [RichTextEditor] URL pública obtenida:', publicUrl);

        // Eliminar texto de carga y insertar imagen
        console.log('🖼️ [RichTextEditor] Insertando imagen en el editor...');
        quillEditor.deleteText(range.index, 21);
        quillEditor.insertEmbed(range.index, 'image', publicUrl);
        quillEditor.setSelection(range.index + 1);

        console.log('✅ [RichTextEditor] Imagen insertada exitosamente!');

      } catch (error) {
        console.error('Error al procesar imagen:', error);
        alert('Error al subir la imagen. Por favor, intenta de nuevo.');

        // Limpiar texto de carga si hay error
        const quill = quillRef.current?.getEditor();
        if (quill) {
          const currentText = quill.getText();
          if (currentText.includes('Subiendo imagen... ⏳')) {
            const index = currentText.indexOf('Subiendo imagen... ⏳');
            quill.deleteText(index, 21);
          }
        }
      }
    };

    input.click();
  };

  // Configuración de módulos de Quill
  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'align': [] }],
        [{ 'color': [] }, { 'background': [] }],
        ['link', 'image'],
        ['clean']
      ],
      handlers: {
        image: imageHandler
      }
    },
    clipboard: {
      matchVisual: false
    }
  }), []);

  // Formatos permitidos
  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'align',
    'color', 'background',
    'link', 'image'
  ];

  return (
    <div className="rich-text-editor-wrapper">
      <ReactQuillNoSSR
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        style={{
          minHeight: `${minHeight}px`,
          borderRadius: '8px'
        }}
      />

      <style jsx global>{`
        .rich-text-editor-wrapper {
          margin-bottom: 1rem;
        }

        .rich-text-editor-wrapper .quill {
          background: white;
          border-radius: 8px;
          border: 1px solid #d1d5db;
        }

        .rich-text-editor-wrapper .ql-toolbar {
          border-radius: 8px 8px 0 0;
          border-bottom: 1px solid #d1d5db;
          background: #f9fafb;
        }

        .rich-text-editor-wrapper .ql-container {
          border-radius: 0 0 8px 8px;
          font-size: 16px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
        }

        .rich-text-editor-wrapper .ql-editor {
          min-height: ${minHeight}px;
          max-height: 600px;
          overflow-y: auto;
        }

        .rich-text-editor-wrapper .ql-editor p {
          margin-bottom: 1rem;
          line-height: 1.8;
        }

        .rich-text-editor-wrapper .ql-editor img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 1rem 0;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .rich-text-editor-wrapper .ql-editor h1 {
          font-size: 2em;
          font-weight: 700;
          margin-top: 1.5rem;
          margin-bottom: 1rem;
          color: #154765;
        }

        .rich-text-editor-wrapper .ql-editor h2 {
          font-size: 1.5em;
          font-weight: 600;
          margin-top: 1.25rem;
          margin-bottom: 0.75rem;
          color: #154765;
        }

        .rich-text-editor-wrapper .ql-editor h3 {
          font-size: 1.25em;
          font-weight: 600;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
          color: #154765;
        }

        .rich-text-editor-wrapper .ql-editor ul,
        .rich-text-editor-wrapper .ql-editor ol {
          padding-left: 1.5rem;
          margin-bottom: 1rem;
        }

        .rich-text-editor-wrapper .ql-editor li {
          margin-bottom: 0.5rem;
        }

        .rich-text-editor-wrapper .ql-editor a {
          color: #2563eb;
          text-decoration: underline;
        }

        .rich-text-editor-wrapper .ql-editor a:hover {
          color: #1d4ed8;
        }

        /* Estilos de la toolbar */
        .rich-text-editor-wrapper .ql-toolbar button:hover,
        .rich-text-editor-wrapper .ql-toolbar button:focus,
        .rich-text-editor-wrapper .ql-toolbar button.ql-active {
          color: #154765;
        }

        .rich-text-editor-wrapper .ql-toolbar button:hover .ql-stroke,
        .rich-text-editor-wrapper .ql-toolbar button:focus .ql-stroke,
        .rich-text-editor-wrapper .ql-toolbar button.ql-active .ql-stroke {
          stroke: #154765;
        }

        .rich-text-editor-wrapper .ql-toolbar button:hover .ql-fill,
        .rich-text-editor-wrapper .ql-toolbar button:focus .ql-fill,
        .rich-text-editor-wrapper .ql-toolbar button.ql-active .ql-fill {
          fill: #154765;
        }

        /* Placeholder */
        .rich-text-editor-wrapper .ql-editor.ql-blank::before {
          color: #9ca3af;
          font-style: italic;
        }
      `}</style>
    </div>
  );
}
