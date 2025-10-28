'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';

export default function NuevaSolicitudPage() {
  const { user, userProfile } = useAuth();
  const [formData, setFormData] = useState({
    tipo: 'certificado_residencia',
    motivo: '',
    observaciones: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Verificar que el usuario esté autenticado
      if (!user || !userProfile) {
        throw new Error('Debes estar autenticado para crear una solicitud');
      }

      // Verificar que el usuario sea un vecino activo
      if (userProfile.rol !== 'vecino') {
        throw new Error('Solo los vecinos pueden crear solicitudes');
      }

      if (userProfile.estado !== 'activo') {
        throw new Error('Tu cuenta debe estar activa para crear solicitudes');
      }

      const supabase = createClient();

      // Crear la solicitud en la base de datos
      const { data, error: insertError } = await supabase
        .from('solicitudes')
        .insert([
          {
            usuario_id: user.id,
            tipo: formData.tipo,
            motivo: formData.motivo.trim(),
            observaciones: formData.observaciones.trim() || null,
            estado: 'pendiente'
          }
        ])
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      console.log('✅ Solicitud creada exitosamente:', data);
      setSuccess(true);

    } catch (error) {
      console.error('❌ Error al crear solicitud:', error);
      setError(error.message || 'Error al enviar la solicitud. Inténtalo nuevamente.');
    } finally {
      setLoading(false);
    }
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
          {/* Mostrar error si existe */}
          {error && (
            <div className="alert alert-danger mb-3">
              <strong>Error:</strong> {error}
            </div>
          )}

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