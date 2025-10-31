'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function ProyectoDetallePage() {
  const params = useParams();
  const router = useRouter();
  const [proyecto, setProyecto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (params.id) {
      fetchProyecto();
    }
  }, [params.id]);

  const fetchProyecto = async () => {
    try {
      setLoading(true);
      setError('');
      const supabase = createClient();

      const { data, error } = await supabase
        .from('proyectos')
        .select(`
          *,
          creador:creador_id (
            nombres,
            apellidos,
            email
          ),
          aprobador:aprobador_id (
            nombres,
            apellidos
          ),
          adjuntos:proyecto_adjuntos (
            id,
            tipo,
            nombre_archivo,
            url,
            extension,
            mime_type,
            tamano_bytes,
            created_at
          )
        `)
        .eq('id', params.id)
        .order('created_at', { ascending: false, foreignTable: 'proyecto_adjuntos' })
        .single();

      if (error) throw error;
      setProyecto(data);
    } catch (error) {
      console.error('Error fetching proyecto:', error);
      setError('Error al cargar el proyecto');
    } finally {
      setLoading(false);
    }
  };

  const formatearPresupuesto = (monto) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(monto);
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatearFechaHora = (fecha) => {
    return new Date(fecha).toLocaleString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEstadoBadge = (estado) => {
    const badges = {
      pendiente: 'bg-warning text-dark',
      aprobado: 'bg-success',
      rechazado: 'bg-danger',
      en_ejecucion: 'bg-info',
      completado: 'bg-secondary'
    };
    return badges[estado] || 'bg-secondary';
  };

  const getEstadoTexto = (estado) => {
    const textos = {
      pendiente: 'Pendiente de Revisión',
      aprobado: 'Aprobado',
      rechazado: 'Rechazado',
      en_ejecucion: 'En Ejecución',
      completado: 'Completado'
    };
    return textos[estado] || estado;
  };

  const getEstadoIcon = (estado) => {
    const iconos = {
      pendiente: '⏳',
      aprobado: '✅',
      rechazado: '❌',
      en_ejecucion: '🚧',
      completado: '🎉'
    };
    return iconos[estado] || '📋';
  };

  if (loading) {
    return (
      <div style={{ width: '100%', maxWidth: '100%', padding: '2rem', background: '#f4f8f9', borderRadius: '16px' }}>
        <div className="text-center py-5">
          <div className="spinner-border mb-3" role="status"></div>
          <p>Cargando proyecto...</p>
        </div>
      </div>
    );
  }

  if (error || !proyecto) {
    return (
      <div style={{ width: '100%', maxWidth: '100%', padding: '2rem', background: '#f4f8f9', borderRadius: '16px' }}>
        <div className="alert alert-danger mb-4">
          <strong>Error:</strong> {error || 'Proyecto no encontrado'}
        </div>
        <Link href="/proyectos" className="btn btn-secondary">
          ← Volver a Proyectos
        </Link>
      </div>
    );
  }

  const imagenes = proyecto?.adjuntos?.filter(adj => adj.tipo === 'imagen') || [];
  const documentos = proyecto?.adjuntos?.filter(adj => adj.tipo === 'documento') || [];

  return (
    <div style={{ width: '100%', maxWidth: '100%', padding: '2rem', background: '#f4f8f9', borderRadius: '16px' }}>
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link href="/proyectos" style={{ textDecoration: 'none' }}>Proyectos</Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            {proyecto.titulo}
          </li>
        </ol>
      </nav>

      {/* Header */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-start mb-3">
            <div>
              <h1 className="display-6 fw-bold mb-3">{proyecto.titulo}</h1>
              <span className={`badge ${getEstadoBadge(proyecto.estado)} px-3 py-2 fs-6`}>
                {getEstadoIcon(proyecto.estado)} {getEstadoTexto(proyecto.estado)}
              </span>
            </div>
            <div className="text-end">
              <div className="fs-3 fw-bold text-primary">
                {formatearPresupuesto(proyecto.presupuesto)}
              </div>
              <small className="text-muted">Presupuesto Estimado</small>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Columna Principal */}
        <div className="col-lg-8">
          {/* Descripción */}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-body p-4">
              <h4 className="card-title mb-3">📝 Descripción del Proyecto</h4>
              <p style={{ whiteSpace: 'pre-line', lineHeight: '1.8' }}>
                {proyecto.descripcion}
              </p>
            </div>
          </div>

          {/* Objetivo */}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-body p-4">
              <h4 className="card-title mb-3">🎯 Objetivo y Beneficios</h4>
              <p style={{ whiteSpace: 'pre-line', lineHeight: '1.8' }}>
                {proyecto.objetivo}
              </p>
            </div>
          </div>

          {/* Imágenes */}
          {imagenes.length > 0 && (
            <div className="card shadow-sm border-0 mb-4">
              <div className="card-body p-4">
                <h4 className="card-title mb-4">🖼️ Galería de Imágenes</h4>
                <div className="row g-3">
                  {imagenes.map((imagen) => (
                    <div key={imagen.id} className="col-12 col-md-6">
                      <a
                        href={imagen.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="d-block"
                        style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #e9ecef' }}
                      >
                        <img
                          src={imagen.url}
                          alt={imagen.nombre_archivo}
                          style={{ width: '100%', height: '250px', objectFit: 'cover' }}
                        />
                      </a>
                      <div className="small text-muted mt-2">
                        {imagen.nombre_archivo}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Documentos */}
          {documentos.length > 0 && (
            <div className="card shadow-sm border-0 mb-4">
              <div className="card-body p-4">
                <h4 className="card-title mb-3">📄 Documentos Adjuntos</h4>
                <ul className="list-group list-group-flush">
                  {documentos.map((doc) => (
                    <li key={doc.id} className="list-group-item d-flex justify-content-between align-items-start gap-3">
                      <div>
                        <strong>{doc.nombre_archivo}</strong>
                        <div className="text-muted small">
                          {doc.extension?.toUpperCase() || 'Archivo'} · {doc.tamano_bytes ? `${(doc.tamano_bytes / 1024 / 1024).toFixed(2)} MB` : 'Tamaño no disponible'} · Subido el {formatearFechaHora(doc.created_at)}
                        </div>
                      </div>
                      <a
                        href={doc.url}
                        className="btn btn-outline-primary btn-sm"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Descargar
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Motivo de Rechazo (si aplica) */}
          {proyecto.estado === 'rechazado' && proyecto.motivo_rechazo && (
            <div className="card shadow-sm border-danger mb-4">
              <div className="card-body p-4">
                <h4 className="card-title text-danger mb-3">❌ Motivo de Rechazo</h4>
                <p style={{ whiteSpace: 'pre-line', lineHeight: '1.8' }}>
                  {proyecto.motivo_rechazo}
                </p>
              </div>
            </div>
          )}

          {/* Timeline de Estados */}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-body p-4">
              <h4 className="card-title mb-4">📅 Línea de Tiempo</h4>
              <div className="timeline" style={{ position: 'relative', paddingLeft: '2rem' }}>
                <div style={{
                  position: 'absolute',
                  left: '0.5rem',
                  top: 0,
                  bottom: 0,
                  width: '2px',
                  background: '#bfd3d9'
                }}></div>

                {/* Postulación */}
                <div className="timeline-item mb-4" style={{ position: 'relative' }}>
                  <div style={{
                    position: 'absolute',
                    left: '-1.75rem',
                    top: '0.25rem',
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: '#439fa4',
                    border: '3px solid white'
                  }}></div>
                  <div>
                    <strong>📋 Proyecto Postulado</strong>
                    <p className="mb-0 text-muted small">
                      {formatearFechaHora(proyecto.created_at)}
                    </p>
                  </div>
                </div>

                {/* Aprobación/Rechazo */}
                {(proyecto.estado === 'aprobado' || proyecto.estado === 'en_ejecucion' || proyecto.estado === 'completado') && proyecto.fecha_aprobacion && (
                  <div className="timeline-item mb-4" style={{ position: 'relative' }}>
                    <div style={{
                      position: 'absolute',
                      left: '-1.75rem',
                      top: '0.25rem',
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: '#34d399',
                      border: '3px solid white'
                    }}></div>
                    <div>
                      <strong>✅ Proyecto Aprobado</strong>
                      <p className="mb-0 text-muted small">
                        {formatearFechaHora(proyecto.fecha_aprobacion)}
                      </p>
                      {proyecto.aprobador && (
                        <p className="mb-0 text-muted small">
                          Por: {proyecto.aprobador.nombres} {proyecto.aprobador.apellidos}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {proyecto.estado === 'rechazado' && (
                  <div className="timeline-item mb-4" style={{ position: 'relative' }}>
                    <div style={{
                      position: 'absolute',
                      left: '-1.75rem',
                      top: '0.25rem',
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: '#fb7185',
                      border: '3px solid white'
                    }}></div>
                    <div>
                      <strong>❌ Proyecto Rechazado</strong>
                      <p className="mb-0 text-muted small">
                        {formatearFechaHora(proyecto.updated_at)}
                      </p>
                    </div>
                  </div>
                )}

                {/* En Ejecución */}
                {(proyecto.estado === 'en_ejecucion' || proyecto.estado === 'completado') && (
                  <div className="timeline-item mb-4" style={{ position: 'relative' }}>
                    <div style={{
                      position: 'absolute',
                      left: '-1.75rem',
                      top: '0.25rem',
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: '#0dcaf0',
                      border: '3px solid white'
                    }}></div>
                    <div>
                      <strong>🚧 Proyecto en Ejecución</strong>
                      <p className="mb-0 text-muted small">
                        {formatearFecha(proyecto.fecha_inicio_estimada)} - {formatearFecha(proyecto.fecha_fin_estimada)}
                      </p>
                    </div>
                  </div>
                )}

                {/* Completado */}
                {proyecto.estado === 'completado' && proyecto.fecha_completado && (
                  <div className="timeline-item mb-4" style={{ position: 'relative' }}>
                    <div style={{
                      position: 'absolute',
                      left: '-1.75rem',
                      top: '0.25rem',
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: '#6b7280',
                      border: '3px solid white'
                    }}></div>
                    <div>
                      <strong>🎉 Proyecto Completado</strong>
                      <p className="mb-0 text-muted small">
                        {formatearFechaHora(proyecto.fecha_completado)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Columna Lateral */}
        <div className="col-lg-4">
          {/* Información del Proyecto */}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-body p-4">
              <h5 className="card-title mb-4">ℹ️ Información del Proyecto</h5>

              <div className="mb-3">
                <small className="text-muted d-block mb-1">Beneficiarios</small>
                <strong className="fs-5">👥 {proyecto.num_beneficiarios} vecinos</strong>
              </div>

              {proyecto.ubicacion && (
                <div className="mb-3">
                  <small className="text-muted d-block mb-1">Ubicación</small>
                  <strong>📍 {proyecto.ubicacion}</strong>
                </div>
              )}

              <div className="mb-3">
                <small className="text-muted d-block mb-1">Fecha de Inicio</small>
                <strong>📅 {formatearFecha(proyecto.fecha_inicio_estimada)}</strong>
              </div>

              <div className="mb-3">
                <small className="text-muted d-block mb-1">Fecha de Término</small>
                <strong>📅 {formatearFecha(proyecto.fecha_fin_estimada)}</strong>
              </div>

              <div className="mb-3">
                <small className="text-muted d-block mb-1">Duración Estimada</small>
                <strong>
                  {Math.ceil((new Date(proyecto.fecha_fin_estimada) - new Date(proyecto.fecha_inicio_estimada)) / (1000 * 60 * 60 * 24))} días
                </strong>
              </div>
            </div>
          </div>

          {/* Información del Creador */}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-body p-4">
              <h5 className="card-title mb-3">👤 Postulado Por</h5>
              {proyecto.creador ? (
                <>
                  <p className="mb-1">
                    <strong>{proyecto.creador.nombres} {proyecto.creador.apellidos}</strong>
                  </p>
                  <p className="mb-0 text-muted small">{proyecto.creador.email}</p>
                  <p className="mb-0 text-muted small">
                    {formatearFecha(proyecto.created_at)}
                  </p>
                </>
              ) : (
                <p className="text-muted mb-0">Información no disponible</p>
              )}
            </div>
          </div>

          {/* Botón Volver */}
          <Link href="/proyectos" className="btn btn-outline-secondary w-100">
            ← Volver a Proyectos
          </Link>
        </div>
      </div>
    </div>
  );
}
