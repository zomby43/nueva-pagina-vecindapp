'use client';

import { useState, useRef } from 'react';
import { compressImage, validateImageFile } from '@/lib/storage/imageHelpers';

/**
 * Componente para subir y previsualizar imágenes de noticias
 * Incluye compresión automática y validación
 */
export default function ImageUploader({ onImageSelect, currentImage = null, onImageRemove = null }) {
  const [preview, setPreview] = useState(currentImage);
  const [isCompressing, setIsCompressing] = useState(false);
  const [error, setError] = useState(null);
  const [compressionInfo, setCompressionInfo] = useState(null);
  const fileInputRef = useRef(null);

  /**
   * Maneja la selección de archivo
   */
  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Limpiar errores previos
    setError(null);
    setCompressionInfo(null);

    // Validar archivo
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    try {
      setIsCompressing(true);

      // Crear preview del archivo original
      const originalPreview = URL.createObjectURL(file);
      setPreview(originalPreview);

      // Comprimir imagen
      const originalSize = (file.size / 1024 / 1024).toFixed(2);
      const compressedFile = await compressImage(file);
      const compressedSize = (compressedFile.size / 1024 / 1024).toFixed(2);
      const reduction = ((1 - compressedFile.size / file.size) * 100).toFixed(1);

      // Guardar info de compresión
      setCompressionInfo({
        originalSize,
        compressedSize,
        reduction,
      });

      // Notificar al componente padre
      if (onImageSelect) {
        onImageSelect(compressedFile);
      }

      setIsCompressing(false);
    } catch (err) {
      console.error('Error al procesar imagen:', err);
      setError('Error al procesar la imagen. Intenta con otra imagen.');
      setPreview(null);
      setIsCompressing(false);
    }
  };

  /**
   * Elimina la imagen seleccionada
   */
  const handleRemoveImage = () => {
    setPreview(null);
    setError(null);
    setCompressionInfo(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onImageRemove) {
      onImageRemove();
    }
    if (onImageSelect) {
      onImageSelect(null);
    }
  };

  /**
   * Abre el selector de archivos
   */
  const handleClickUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="image-uploader">
      {/* Input oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {/* Preview de imagen */}
      {preview ? (
        <div className="image-preview-container">
          <div className="image-preview">
            <img src={preview} alt="Preview" />
          </div>

          {/* Información de compresión */}
          {compressionInfo && (
            <div className="alert alert-success mt-2 mb-0">
              <small>
                <strong>Imagen optimizada:</strong> {compressionInfo.originalSize}MB → {compressionInfo.compressedSize}MB
                ({compressionInfo.reduction}% de reducción)
              </small>
            </div>
          )}

          {/* Botones de acción */}
          <div className="d-flex gap-2 mt-3">
            <button
              type="button"
              className="btn btn-outline-primary btn-sm"
              onClick={handleClickUpload}
              disabled={isCompressing}
            >
              Cambiar imagen
            </button>
            <button
              type="button"
              className="btn btn-outline-danger btn-sm"
              onClick={handleRemoveImage}
              disabled={isCompressing}
            >
              Eliminar imagen
            </button>
          </div>
        </div>
      ) : (
        // Botón para seleccionar imagen
        <div className="upload-placeholder">
          <button
            type="button"
            className="btn btn-outline-primary"
            onClick={handleClickUpload}
            disabled={isCompressing}
          >
            {isCompressing ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Comprimiendo...
              </>
            ) : (
              <>
                <i className="bi bi-image me-2"></i>
                Seleccionar imagen de portada
              </>
            )}
          </button>
          <p className="text-muted small mt-2 mb-0">
            JPG, PNG o WebP. Máximo 5MB. La imagen será optimizada automáticamente.
          </p>
        </div>
      )}

      {/* Mensaje de error */}
      {error && (
        <div className="alert alert-danger mt-3 mb-0">
          {error}
        </div>
      )}

      <style jsx>{`
        .image-uploader {
          margin-bottom: 1rem;
        }

        .image-preview-container {
          width: 100%;
        }

        .image-preview {
          width: 100%;
          max-width: 600px;
          aspect-ratio: 16 / 9;
          border-radius: 8px;
          overflow: hidden;
          background-color: #f5f5f5;
          border: 2px solid #dee2e6;
        }

        .image-preview img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .upload-placeholder {
          text-align: center;
          padding: 2rem;
          border: 2px dashed #dee2e6;
          border-radius: 8px;
          background-color: #f8f9fa;
        }

        .upload-placeholder:hover {
          border-color: #0d6efd;
          background-color: #f0f7ff;
        }

        @media (max-width: 768px) {
          .upload-placeholder {
            padding: 1.5rem 1rem;
          }

          .image-preview {
            max-width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
