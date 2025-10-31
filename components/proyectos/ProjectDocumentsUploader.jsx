'use client';

import { useMemo, useRef } from 'react';

const ACCEPTED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/zip',
  'application/x-zip-compressed',
  'text/plain'
];

const MAX_SIZE_MB = 15;

export default function ProjectDocumentsUploader({
  value = [],
  onChange,
  disabled = false,
}) {
  const fileInputRef = useRef(null);

  const totalSize = useMemo(
    () => value.reduce((acc, file) => acc + (file.size || 0), 0),
    [value]
  );

  const handleSelect = (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    const filtered = [];
    for (const file of files) {
      const sizeMB = file.size / 1024 / 1024;
      if (sizeMB > MAX_SIZE_MB) {
        alert(`"${file.name}" supera el máximo de ${MAX_SIZE_MB}MB`);
        continue;
      }
      if (!ACCEPTED_TYPES.includes(file.type)) {
        alert(`"${file.name}" no es un tipo de archivo permitido`);
        continue;
      }
      filtered.push(file);
    }

    if (filtered.length && onChange) {
      onChange([...value, ...filtered]);
    }

    // reset input
    event.target.value = '';
  };

  const handleRemove = (index) => {
    const updated = value.filter((_, i) => i !== index);
    onChange?.(updated);
  };

  const triggerFileDialog = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  return (
    <div className="project-documents-uploader">
      <label className="form-label fw-semibold">
        📎 Documentos del Proyecto (PDF, Word, Excel) <span className="text-muted">(opcional)</span>
      </label>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.txt"
        onChange={handleSelect}
        disabled={disabled}
        style={{ display: 'none' }}
      />
      <button
        type="button"
        className="btn btn-outline-primary"
        onClick={triggerFileDialog}
        disabled={disabled}
      >
        Seleccionar documentos
      </button>
      <small className="text-muted d-block mt-2">
        Hasta {MAX_SIZE_MB}MB por archivo. Tipos permitidos: PDF, DOCX, XLSX, PPTX, ZIP.
      </small>

      {value.length > 0 && (
        <div className="card mt-3">
          <div className="card-body">
            <h6 className="card-title mb-3">Documentos seleccionados</h6>
            <ul className="list-group list-group-flush">
              {value.map((file, index) => (
                <li key={`${file.name}-${index}`} className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <strong>{file.name}</strong>
                    <div className="text-muted small">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => handleRemove(index)}
                    disabled={disabled}
                  >
                    Quitar
                  </button>
                </li>
              ))}
            </ul>
            <div className="text-muted small mt-3">
              Total seleccionado: {(totalSize / 1024 / 1024).toFixed(2)} MB
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
