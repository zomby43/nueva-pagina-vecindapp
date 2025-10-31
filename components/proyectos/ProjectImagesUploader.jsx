'use client';

import { useState, useEffect, useRef } from 'react';
import { compressImage, validateImageFile } from '@/lib/storage/imageHelpers';

export default function ProjectImagesUploader({
  value = [],
  onChange,
  disabled = false,
}) {
  const [processing, setProcessing] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    return () => {
      value.forEach((item) => {
        if (item?.previewUrl) {
          URL.revokeObjectURL(item.previewUrl);
        }
      });
    };
  }, []);

  const handleSelect = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    setProcessing(true);

    const processed = [];
    for (const file of files) {
      const validation = validateImageFile(file);
      if (!validation.valid) {
        alert(validation.error);
        continue;
      }

      try {
        const compressed = await compressImage(file);
        const finalFile = new File(
          [compressed],
          `${file.name.replace(/\.[^.]+$/, '')}.webp`,
          { type: 'image/webp' }
        );
        const previewUrl = URL.createObjectURL(finalFile);

        processed.push({
          file: finalFile,
          previewUrl,
          originalName: file.name,
          originalSize: file.size,
          size: finalFile.size,
        });
      } catch (error) {
        console.error('Error comprimiendo imagen:', error);
        alert('No se pudo procesar la imagen seleccionada');
      }
    }

    if (processed.length && onChange) {
      onChange([...value, ...processed]);
    }

    setProcessing(false);
    event.target.value = '';
  };

  const handleRemove = (index) => {
    const item = value[index];
    if (item?.previewUrl) {
      URL.revokeObjectURL(item.previewUrl);
    }
    const updated = value.filter((_, i) => i !== index);
    onChange?.(updated);
  };

  const triggerFileDialog = () => {
    if (disabled || processing) return;
    fileInputRef.current?.click();
  };

  return (
    <div className="project-images-uploader">
      <label className="form-label fw-semibold">
        🖼️ Galería de Imágenes <span className="text-muted">(opcional)</span>
      </label>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/png,image/jpeg,image/jpg,image/webp"
        onChange={handleSelect}
        disabled={disabled || processing}
        style={{ display: 'none' }}
      />
      <button
        type="button"
        className="btn btn-outline-primary"
        onClick={triggerFileDialog}
        disabled={disabled || processing}
      >
        {processing ? (
          <>
            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            Procesando...
          </>
        ) : (
          'Seleccionar imágenes'
        )}
      </button>
      <small className="text-muted d-block mt-2">
        Máximo 5MB por imagen antes de optimizar. Se convertirán a WebP automáticamente.
      </small>

      {processing && (
        <div className="alert alert-info mt-3 mb-0">
          <div className="d-flex align-items-center gap-2">
            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            <span>Optimizando imágenes seleccionadas...</span>
          </div>
        </div>
      )}

      {value.length > 0 && (
        <div className="card mt-3">
          <div className="card-body">
            <h6 className="card-title mb-3">Imágenes seleccionadas ({value.length})</h6>
            <div className="row g-3">
              {value.map((item, index) => (
                <div key={`${item.originalName}-${index}`} className="col-12 col-md-6 col-lg-4">
                  <div className="border rounded h-100 d-flex flex-column overflow-hidden">
                    <div style={{ aspectRatio: '16 / 10', backgroundColor: '#f5f5f5' }}>
                      <img
                        src={item.previewUrl}
                        alt={item.originalName}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                    <div className="p-3 d-flex flex-column gap-2">
                      <div className="small fw-semibold text-truncate" title={item.originalName}>
                        {item.originalName}
                      </div>
                      <div className="small text-muted">
                        {((item.originalSize || 0) / 1024 / 1024).toFixed(2)}MB → {(item.size / 1024 / 1024).toFixed(2)}MB
                      </div>
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm mt-auto"
                        onClick={() => handleRemove(index)}
                        disabled={disabled}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
