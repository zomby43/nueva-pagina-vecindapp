'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

export default function AdminSolicitudDetallePage() {
  const params = useParams();
  const router = useRouter();
  const [nuevoEstado, setNuevoEstado] = useState('');
  const [comentario, setComentario] = useState('');

  // Datos de ejemplo
  const solicitud = {
    id: params.id,
    usuario: {
      nombres: 'Juan Carlos',
      apellidos: 'González Martínez',
      rut: '12.345.678-9',
      email: 'juan.gonzalez@email.com',
      telefono: '+56 9 8765 4321',
      direccion: 'Av. Las Condes 1234, Departamento 501'
    },
    tipo: 'Certificado de Residencia',
    estado: 'Pendiente',
    fechaSolicitud: '20 de Septiembre, 2025',
    descripcion: 'Solicito certificado de residencia para trámites bancarios.',
    documentos: [
      { nombre: 'comprobante_residencia.pdf', fecha: '20/09/2025', tipo: 'PDF' }
    ],
    historial: [
      { fecha: '20/09/2025 10:30', accion: 'Solicitud Creada', usuario: 'Sistema', nota: 'Solicitud registrada automáticamente' }
    ]
  };

  const handleCambiarEstado = (e) => {
    e.preventDefault();
    console.log('Cambiar estado a:', nuevoEstado, 'Comentario:', comentario);
    // TODO: Implementar cambio de estado
    alert(`Estado actualizado a: ${nuevoEstado}`);
    setNuevoEstado('');
    setComentario('');
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Gestionar Solicitud</h1>
          <p className="page-subtitle">{solicitud.id}</p>
        </div>
        <button onClick={() => router.back()} className="btn btn-secondary">
          ← Volver
        </button>
      </div>

      <div className="admin-detail-grid">
        {/* Información del Usuario */}
        <div className="detail-card">
          <h2>👤 Información del Usuario</h2>
          <div className="detail-grid">
            <div className="detail-item">
              <label>Nombre Completo:</label>
              <span>{solicitud.usuario.nombres} {solicitud.usuario.apellidos}</span>
            </div>
            <div className="detail-item">
              <label>RUT:</label>
              <span>{solicitud.usuario.rut}</span>
            </div>
            <div className="detail-item">
              <label>Email:</label>
              <span><a href={`mailto:${solicitud.usuario.email}`}>{solicitud.usuario.email}</a></span>
            </div>
            <div className="detail-item">
              <label>Teléfono:</label>
              <span><a href={`tel:${solicitud.usuario.telefono}`}>{solicitud.usuario.telefono}</a></span>
            </div>
            <div className="detail-item full-width">
              <label>Dirección:</label>
              <span>{solicitud.usuario.direccion}</span>
            </div>
          </div>
          <div className="card-actions">
            <a href={`/admin/usuarios/${solicitud.usuario.rut}`} className="btn btn-secondary btn-sm">
              Ver Perfil Completo
            </a>
          </div>
        </div>

        {/* Información de la Solicitud */}
        <div className="detail-card">
          <h2>📋 Detalles de la Solicitud</h2>
          <div className="detail-grid">
            <div className="detail-item">
              <label>Número:</label>
              <span><code>{solicitud.id}</code></span>
            </div>
            <div className="detail-item">
              <label>Estado Actual:</label>
              <span className={`status-badge badge-${solicitud.estado.toLowerCase()}`}>
                {solicitud.estado}
              </span>
            </div>
            <div className="detail-item">
              <label>Tipo:</label>
              <span>{solicitud.tipo}</span>
            </div>
            <div className="detail-item">
              <label>Fecha:</label>
              <span>{solicitud.fechaSolicitud}</span>
            </div>
            <div className="detail-item full-width">
              <label>Descripción:</label>
              <span>{solicitud.descripcion}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Documentos Adjuntos */}
      {solicitud.documentos.length > 0 && (
        <div className="detail-card">
          <h2>📎 Documentos Adjuntos</h2>
          <div className="documents-list">
            {solicitud.documentos.map((doc, index) => (
              <div key={index} className="document-item">
                <div className="document-icon">📄</div>
                <div className="document-info">
                  <h4>{doc.nombre}</h4>
                  <p>Tipo: {doc.tipo} | Subido: {doc.fecha}</p>
                </div>
                <button className="btn btn-secondary btn-sm">
                  📥 Descargar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cambiar Estado */}
      <div className="detail-card action-card">
        <h2>⚙️ Acciones Administrativas</h2>
        <form onSubmit={handleCambiarEstado} className="admin-action-form">
          <div className="form-group">
            <label htmlFor="nuevoEstado">Cambiar Estado *</label>
            <select
              id="nuevoEstado"
              value={nuevoEstado}
              onChange={(e) => setNuevoEstado(e.target.value)}
              required
            >
              <option value="">-- Seleccionar Estado --</option>
              <option value="En Revisión">En Revisión</option>
              <option value="En Proceso">En Proceso</option>
              <option value="Completada">Completada</option>
              <option value="Rechazada">Rechazada</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="comentario">Comentario / Nota *</label>
            <textarea
              id="comentario"
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              rows="4"
              placeholder="Describe la acción realizada o razón del cambio..."
              required
            />
          </div>

          <button type="submit" className="btn btn-primary">
            Actualizar Estado
          </button>
        </form>
      </div>

      {/* Historial de Acciones */}
      <div className="detail-card">
        <h2>📈 Historial de Acciones</h2>
        <div className="admin-timeline">
          {solicitud.historial.map((item, index) => (
            <div key={index} className="admin-timeline-item">
              <div className="timeline-marker"></div>
              <div className="timeline-content">
                <div className="timeline-header">
                  <span className="timeline-date">{item.fecha}</span>
                  <span className="timeline-user">{item.usuario}</span>
                </div>
                <h4>{item.accion}</h4>
                <p>{item.nota}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
