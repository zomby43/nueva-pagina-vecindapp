'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function NuevaSolicitudPage() {
  const [formData, setFormData] = useState({
    tipo: 'certificado_residencia',
    motivo: '',
    observaciones: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulamos el envío
    setTimeout(() => {
      setSuccess(true);
      setLoading(false);
    }, 2000);
  };

  if (success) {
    return (
      <div className="dashboard-container">
        <div className="alert alert-success">
          <h4 className="alert-heading">¡Solicitud enviada exitosamente!</h4>
          <p>Tu solicitud ha sido recibida y está siendo procesada.</p>
          <p className="mb-0">Recibirás una notificación cuando haya actualizaciones.</p>
          <div className="mt-3">
            <Link href="/solicitudes" className="btn btn-primary">
              Ver Mis Solicitudes
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Nueva Solicitud</h1>
        <p className="dashboard-subtitle">Completa el formulario para crear una nueva solicitud</p>
      </div>

      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="tipo" className="form-label">Tipo de Solicitud *</label>
              <select
                className="form-select"
                id="tipo"
                name="tipo"
                value={formData.tipo}
                onChange={handleChange}
                required
              >
                <option value="certificado_residencia">Certificado de Residencia</option>
                <option value="certificado_antiguedad">Certificado de Antigüedad</option>
                <option value="otro">Otro</option>
              </select>
            </div>

            <div className="mb-3">
              <label htmlFor="motivo" className="form-label">Motivo de la Solicitud *</label>
              <input
                type="text"
                className="form-control"
                id="motivo"
                name="motivo"
                value={formData.motivo}
                onChange={handleChange}
                placeholder="Ej: Para trámites bancarios, inscripción universidad, etc."
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="observaciones" className="form-label">Observaciones</label>
              <textarea
                className="form-control"
                id="observaciones"
                name="observaciones"
                rows="3"
                value={formData.observaciones}
                onChange={handleChange}
                placeholder="Información adicional o comentarios..."
              ></textarea>
            </div>

            <div className="d-flex gap-3">
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Enviando...
                  </>
                ) : (
                  'Enviar Solicitud'
                )}
              </button>
              <Link href="/solicitudes" className="btn btn-secondary">
                Cancelar
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}