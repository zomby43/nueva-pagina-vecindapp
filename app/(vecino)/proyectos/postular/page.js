'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import ProjectDocumentsUploader from '@/components/proyectos/ProjectDocumentsUploader';
import ProjectImagesUploader from '@/components/proyectos/ProjectImagesUploader';
import { uploadProjectAttachment } from '@/lib/storage/projectAttachments';

export default function PostularProyectoPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    objetivo: '',
    presupuesto: '',
    fecha_inicio_estimada: '',
    fecha_fin_estimada: '',
    num_beneficiarios: '',
    ubicacion: ''
  });
  const [documentFiles, setDocumentFiles] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validarFormulario = () => {
    if (!formData.titulo.trim()) {
      alert('Por favor ingresa el título del proyecto');
      return false;
    }
    if (!formData.descripcion.trim()) {
      alert('Por favor ingresa la descripción del proyecto');
      return false;
    }
    if (!formData.objetivo.trim()) {
      alert('Por favor ingresa el objetivo del proyecto');
      return false;
    }
    if (!formData.presupuesto || parseFloat(formData.presupuesto) <= 0) {
      alert('Por favor ingresa un presupuesto válido mayor a 0');
      return false;
    }
    if (!formData.fecha_inicio_estimada) {
      alert('Por favor selecciona la fecha de inicio estimada');
      return false;
    }
    if (!formData.fecha_fin_estimada) {
      alert('Por favor selecciona la fecha de fin estimada');
      return false;
    }
    if (new Date(formData.fecha_fin_estimada) <= new Date(formData.fecha_inicio_estimada)) {
      alert('La fecha de fin debe ser posterior a la fecha de inicio');
      return false;
    }
    if (!formData.num_beneficiarios || parseInt(formData.num_beneficiarios) <= 0) {
      alert('Por favor ingresa un número válido de beneficiarios');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validarFormulario()) return;

    try {
      setLoading(true);
      const supabase = createClient();

      const dataToSave = {
        ...formData,
        presupuesto: parseFloat(formData.presupuesto),
        num_beneficiarios: parseInt(formData.num_beneficiarios),
        ubicacion: formData.ubicacion.trim() || null,
        creador_id: user.id,
        estado: 'pendiente'
      };

      const { data, error } = await supabase
        .from('proyectos')
        .insert([dataToSave])
        .select()
        .single();

      if (error) throw error;

      let attachmentsMessage = '';

      if (data) {
        const attachmentsToInsert = [];

        try {
          for (const file of documentFiles) {
            const uploadResult = await uploadProjectAttachment(file, data.id, 'documentos');
            attachmentsToInsert.push({
              proyecto_id: data.id,
              tipo: 'documento',
              nombre_archivo: uploadResult.originalName || file.name,
              url: uploadResult.publicUrl,
              storage_path: uploadResult.storagePath,
              extension: uploadResult.extension,
              mime_type: uploadResult.mimeType,
              tamano_bytes: uploadResult.size,
              uploaded_por: user.id,
            });
          }

          for (const item of imageFiles) {
            const uploadResult = await uploadProjectAttachment(item.file, data.id, 'imagenes');
            attachmentsToInsert.push({
              proyecto_id: data.id,
              tipo: 'imagen',
              nombre_archivo: item.originalName || item.file.name,
              url: uploadResult.publicUrl,
              storage_path: uploadResult.storagePath,
              extension: uploadResult.extension,
              mime_type: uploadResult.mimeType,
              tamano_bytes: uploadResult.size,
              uploaded_por: user.id,
            });
          }

          if (attachmentsToInsert.length > 0) {
            const { error: adjuntosError } = await supabase
              .from('proyecto_adjuntos')
              .insert(attachmentsToInsert);

            if (adjuntosError) {
              console.error('Error guardando adjuntos:', adjuntosError);
              attachmentsMessage = ' Nota: Los adjuntos no pudieron guardarse.';
            }
          }
        } catch (attachmentsError) {
          console.error('Error al procesar adjuntos:', attachmentsError);
          attachmentsMessage = ' Nota: Los adjuntos no pudieron subirse.';
        }
      }

      imageFiles.forEach((item) => {
        if (item?.previewUrl) {
          URL.revokeObjectURL(item.previewUrl);
        }
      });

      setDocumentFiles([]);
      setImageFiles([]);

      alert('¡Proyecto postulado exitosamente! La secretaría lo revisará pronto.' + attachmentsMessage);
      router.push('/proyectos/mis-postulaciones');
    } catch (error) {
      console.error('Error postulando proyecto:', error);
      alert('Error al postular el proyecto: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '100%', padding: '2rem', background: '#f4f8f9', borderRadius: '16px' }}>
      <div className="mb-4">
        <h1 className="display-6 fw-bold mb-3">➕ Postular Proyecto Vecinal</h1>
        <p className="lead text-muted">Presenta tu propuesta para mejorar nuestra comunidad</p>
      </div>

      <div className="row">
        <div className="col-lg-8">
          <div className="card shadow-sm border-0">
            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                {/* Título */}
                <div className="mb-4">
                  <label htmlFor="titulo" className="form-label fw-semibold">
                    Título del Proyecto <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-lg"
                    id="titulo"
                    name="titulo"
                    value={formData.titulo}
                    onChange={handleChange}
                    placeholder="Ej: Mejoramiento Plaza Central"
                    maxLength={200}
                    required
                  />
                  <small className="text-muted">
                    {formData.titulo.length}/200 caracteres
                  </small>
                </div>

                {/* Descripción */}
                <div className="mb-4">
                  <label htmlFor="descripcion" className="form-label fw-semibold">
                    Descripción Detallada <span className="text-danger">*</span>
                  </label>
                  <textarea
                    className="form-control"
                    id="descripcion"
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleChange}
                    rows={5}
                    placeholder="Describe en detalle el proyecto: ¿Qué se quiere hacer? ¿Por qué es necesario? ¿Cómo se ejecutaría?"
                    required
                  />
                  <small className="text-muted">
                    {formData.descripcion.length} caracteres
                  </small>
                </div>

                {/* Objetivo */}
                <div className="mb-4">
                  <label htmlFor="objetivo" className="form-label fw-semibold">
                    Objetivo y Beneficios <span className="text-danger">*</span>
                  </label>
                  <textarea
                    className="form-control"
                    id="objetivo"
                    name="objetivo"
                    value={formData.objetivo}
                    onChange={handleChange}
                    rows={4}
                    placeholder="¿Qué se espera lograr con este proyecto? ¿Qué beneficios traerá a la comunidad?"
                    required
                  />
                  <small className="text-muted">
                    {formData.objetivo.length} caracteres
                  </small>
                </div>

                {/* Presupuesto y Beneficiarios */}
                <div className="row mb-4">
                  <div className="col-md-6">
                    <label htmlFor="presupuesto" className="form-label fw-semibold">
                      Presupuesto Estimado (CLP) <span className="text-danger">*</span>
                    </label>
                    <input
                      type="number"
                      className="form-control form-control-lg"
                      id="presupuesto"
                      name="presupuesto"
                      value={formData.presupuesto}
                      onChange={handleChange}
                      placeholder="0"
                      min="0"
                      step="1000"
                      required
                    />
                    <small className="text-muted">
                      Ingresa el costo aproximado del proyecto
                    </small>
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="num_beneficiarios" className="form-label fw-semibold">
                      Número de Beneficiarios <span className="text-danger">*</span>
                    </label>
                    <input
                      type="number"
                      className="form-control form-control-lg"
                      id="num_beneficiarios"
                      name="num_beneficiarios"
                      value={formData.num_beneficiarios}
                      onChange={handleChange}
                      placeholder="0"
                      min="1"
                      required
                    />
                    <small className="text-muted">
                      ¿Cuántos vecinos se beneficiarían?
                    </small>
                  </div>
                </div>

                {/* Fechas */}
                <div className="row mb-4">
                  <div className="col-md-6">
                    <label htmlFor="fecha_inicio_estimada" className="form-label fw-semibold">
                      Fecha de Inicio Estimada <span className="text-danger">*</span>
                    </label>
                    <input
                      type="date"
                      className="form-control form-control-lg"
                      id="fecha_inicio_estimada"
                      name="fecha_inicio_estimada"
                      value={formData.fecha_inicio_estimada}
                      onChange={handleChange}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="fecha_fin_estimada" className="form-label fw-semibold">
                      Fecha de Fin Estimada <span className="text-danger">*</span>
                    </label>
                    <input
                      type="date"
                      className="form-control form-control-lg"
                      id="fecha_fin_estimada"
                      name="fecha_fin_estimada"
                      value={formData.fecha_fin_estimada}
                      onChange={handleChange}
                      min={formData.fecha_inicio_estimada || new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                </div>

                {/* Ubicación */}
                <div className="mb-4">
                  <label htmlFor="ubicacion" className="form-label fw-semibold">
                    Ubicación <span className="text-muted">(Opcional)</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="ubicacion"
                    name="ubicacion"
                    value={formData.ubicacion}
                    onChange={handleChange}
                    placeholder="Ej: Plaza Central - Entre Calle Principal y Av. Los Álamos"
                    maxLength={200}
                  />
                  <small className="text-muted">
                    Dirección, sector o referencia donde se ejecutaría el proyecto
                  </small>
                </div>

                {/* Adjuntos */}
                <div className="mb-5">
                  <div className="card border-0 shadow-sm">
                    <div className="card-body p-4">
                      <h5 className="card-title mb-4">📎 Adjunta material de apoyo (opcional)</h5>
                      <p className="text-muted small mb-4">
                        Puedes subir documentos (planos, presupuestos) y una galería de imágenes para respaldar tu propuesta.
                      </p>

                      <ProjectDocumentsUploader
                        value={documentFiles}
                        onChange={setDocumentFiles}
                        disabled={loading}
                      />

                      <hr className="my-4" />

                      <ProjectImagesUploader
                        value={imageFiles}
                        onChange={setImageFiles}
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>

                {/* Botones */}
                <div className="d-flex gap-2 pt-3 border-top">
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Enviando...
                      </>
                    ) : (
                      '✅ Postular Proyecto'
                    )}
                  </button>
                  <Link href="/proyectos" className="btn btn-secondary btn-lg">
                    Cancelar
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Panel de Ayuda */}
        <div className="col-lg-4">
          <div className="card bg-light border-0 mb-4">
            <div className="card-body p-4">
              <h6 className="card-title fw-bold mb-3">💡 Consejos para tu Postulación</h6>
              <ul className="small mb-0" style={{ lineHeight: '1.8' }}>
                <li className="mb-2">
                  <strong>Sé claro y específico:</strong> Describe exactamente qué quieres hacer y por qué es importante
                </li>
                <li className="mb-2">
                  <strong>Justifica el presupuesto:</strong> Investiga costos aproximados para que tu estimación sea realista
                </li>
                <li className="mb-2">
                  <strong>Piensa en el impacto:</strong> Explica cómo beneficiará a la comunidad
                </li>
                <li className="mb-2">
                  <strong>Define fechas realistas:</strong> Considera tiempos de gestión y ejecución
                </li>
                <li>
                  <strong>Incluye la ubicación:</strong> Si el proyecto tiene un lugar específico, menciónalo
                </li>
              </ul>
            </div>
          </div>

          <div className="card border-info bg-light mb-4">
            <div className="card-body p-4">
              <h6 className="card-title fw-bold mb-3">ℹ️ Proceso de Revisión</h6>
              <ol className="small mb-0" style={{ lineHeight: '1.8' }}>
                <li className="mb-2">Tu proyecto será revisado por la secretaría</li>
                <li className="mb-2">Puede ser aprobado o rechazado según viabilidad</li>
                <li className="mb-2">Si es aprobado, pasará a ejecución según cronograma</li>
                <li>Podrás ver el estado en "Mis Postulaciones"</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
