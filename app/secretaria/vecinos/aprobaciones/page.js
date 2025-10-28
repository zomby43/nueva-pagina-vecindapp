'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import { enviarCorreoAprobacionRegistro } from '@/lib/emails/sendEmail';

export default function AprobacionesPage() {
  const { user, userProfile } = useAuth();
  const [vecinosPendientes, setVecinosPendientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [vecinoSeleccionado, setVecinoSeleccionado] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);

  useEffect(() => {
    if (user && userProfile?.rol === 'secretaria') {
      fetchVecinosPendientes();
    }
  }, [user, userProfile]);

  const fetchVecinosPendientes = async () => {
    try {
      setLoading(true);
      setError('');
      const supabase = createClient();

      console.log('🔍 Cargando vecinos pendientes de aprobación...');

      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('estado', 'pendiente_aprobacion')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error de Supabase:', error);
        throw error;
      }

      console.log('✅ Vecinos pendientes cargados:', data?.length || 0);
      setVecinosPendientes(data || []);
    } catch (error) {
      console.error('❌ Error completo:', error);
      setError(`Error al cargar los vecinos pendientes: ${error.message || error.toString()}`);
    } finally {
      setLoading(false);
    }
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const aprobarVecino = async (vecinoId) => {
    if (!confirm('¿Estás segura de aprobar este vecino?')) return;

    try {
      const supabase = createClient();
      
      // Obtener datos del vecino antes de aprobar
      const vecinoAprobar = vecinosPendientes.find(v => v.id === vecinoId);
      
      if (!vecinoAprobar) {
        alert('No se encontró el vecino');
        return;
      }

      // Aprobar vecino en la base de datos
      const { error } = await supabase
        .from('usuarios')
        .update({ estado: 'activo' })
        .eq('id', vecinoId);

      if (error) throw error;

      // Enviar correo de aprobación
      try {
        await enviarCorreoAprobacionRegistro(
          vecinoAprobar.email,
          `${vecinoAprobar.nombres} ${vecinoAprobar.apellidos}`
        );
        console.log('✅ Correo de aprobación enviado a:', vecinoAprobar.email);
      } catch (emailError) {
        console.error('⚠️ Error al enviar correo (el vecino fue aprobado):', emailError);
        // No interrumpimos el flujo si falla el email
      }

      // Actualizar la lista local
      setVecinosPendientes(prev => prev.filter(v => v.id !== vecinoId));

      alert('Vecino aprobado exitosamente. Se ha enviado un correo de confirmación.');
    } catch (error) {
      console.error('Error aprobando vecino:', error);
      alert('Error al aprobar vecino');
    }
  };

  const rechazarVecino = async (vecinoId) => {
    if (!confirm('¿Estás segura de rechazar este vecino?')) return;

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('usuarios')
        .update({ estado: 'rechazado' })
        .eq('id', vecinoId);

      if (error) throw error;

      // Actualizar la lista local
      setVecinosPendientes(prev => prev.filter(v => v.id !== vecinoId));

      alert('Vecino rechazado');
    } catch (error) {
      console.error('Error rechazando vecino:', error);
      alert('Error al rechazar vecino');
    }
  };

  // Filtrar por búsqueda
  const vecinosFiltrados = vecinosPendientes.filter(vecino => {
    const terminoBusqueda = busqueda.toLowerCase();
    return (
      vecino.nombres?.toLowerCase().includes(terminoBusqueda) ||
      vecino.apellidos?.toLowerCase().includes(terminoBusqueda) ||
      vecino.rut?.toLowerCase().includes(terminoBusqueda) ||
      vecino.email?.toLowerCase().includes(terminoBusqueda) ||
      vecino.direccion?.toLowerCase().includes(terminoBusqueda)
    );
  });

  if (loading) {
    return (
      <div className="page-container">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="text-center">
            <div className="spinner-border mb-3" role="status"></div>
            <p>Cargando vecinos pendientes...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1>⏰ Aprobación de Vecinos</h1>
            <p className="text-muted">Revisa y aprueba las solicitudes de inscripción de nuevos vecinos</p>
          </div>
          <button
            className="btn btn-outline-primary"
            onClick={fetchVecinosPendientes}
            disabled={loading}
          >
            🔄 Actualizar
          </button>
        </div>
      </div>

      <div className="solicitudes-content">
        {/* Mostrar error si existe */}
        {error && (
          <div className="alert alert-danger mb-4">
            <strong>Error:</strong> {error}
            <button
              className="btn btn-sm btn-outline-danger ms-2"
              onClick={fetchVecinosPendientes}
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Resumen */}
        <div className="card mb-4" style={{ background: '#f0f9fa', border: '1px solid #439fa4' }}>
          <div className="card-body text-center">
            <h3 className="mb-0" style={{ color: '#154765', fontSize: '2.5rem', fontWeight: 'bold' }}>
              {vecinosPendientes.length}
            </h3>
            <p className="mb-0" style={{ color: '#439fa4', fontWeight: 600 }}>
              {vecinosPendientes.length === 1 ? 'Vecino pendiente de aprobación' : 'Vecinos pendientes de aprobación'}
            </p>
          </div>
        </div>

        {/* Búsqueda */}
        {vecinosPendientes.length > 0 && (
          <div className="card mb-4">
            <div className="card-body">
              <div className="row">
                <div className="col-md-8">
                  <label htmlFor="busqueda" className="form-label">Buscar vecino:</label>
                  <input
                    type="text"
                    id="busqueda"
                    className="form-control"
                    placeholder="Nombre, RUT, email, dirección..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                  />
                </div>
                <div className="col-md-4 d-flex align-items-end">
                  <button
                    className="btn btn-secondary w-100"
                    onClick={() => setBusqueda('')}
                  >
                    Limpiar Búsqueda
                  </button>
                </div>
              </div>
              {busqueda && (
                <div className="text-end mt-2">
                  <span className="text-muted">
                    Mostrando {vecinosFiltrados.length} de {vecinosPendientes.length} vecinos
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Lista de vecinos pendientes */}
        <div className="card">
          <div className="card-header" style={{ background: '#439fa4', color: 'white' }}>
            <h5 className="mb-0">📋 Vecinos Pendientes de Aprobación</h5>
          </div>
          <div className="card-body">
            {vecinosFiltrados.length === 0 ? (
              <div className="empty-state text-center py-5">
                <div className="empty-icon mb-3" style={{ fontSize: '3rem' }}>
                  {busqueda ? '🔍' : '✅'}
                </div>
                <h5>{busqueda ? 'No se encontraron resultados' : 'No hay vecinos pendientes'}</h5>
                <p className="text-muted">
                  {busqueda
                    ? 'No se encontraron vecinos pendientes con los criterios de búsqueda'
                    : '¡Excelente! Todas las solicitudes han sido procesadas'
                  }
                </p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Nombre Completo</th>
                      <th>RUT</th>
                      <th>Email</th>
                      <th>Dirección</th>
                      <th>Teléfono</th>
                      <th>Fecha de Registro</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vecinosFiltrados.map((vecino) => (
                      <tr key={vecino.id}>
                        <td>
                          <div className="fw-medium">
                            {vecino.nombres} {vecino.apellidos}
                          </div>
                        </td>
                        <td>
                          <code>{vecino.rut}</code>
                        </td>
                        <td>
                          <small>{vecino.email}</small>
                        </td>
                        <td>
                          <small>{vecino.direccion}</small>
                        </td>
                        <td>
                          <small>{vecino.telefono}</small>
                        </td>
                        <td>
                          <small>{formatearFecha(vecino.created_at)}</small>
                        </td>
                        <td>
                          <div className="btn-group btn-group-sm">
                            <button
                              className="btn btn-outline-primary"
                              onClick={() => {
                                setVecinoSeleccionado(vecino);
                                setMostrarModal(true);
                              }}
                              title="Ver detalles"
                            >
                              👁️ Ver
                            </button>
                            <button
                              className="btn btn-outline-success"
                              onClick={() => aprobarVecino(vecino.id)}
                              title="Aprobar vecino"
                            >
                              ✅ Aprobar
                            </button>
                            <button
                              className="btn btn-outline-danger"
                              onClick={() => rechazarVecino(vecino.id)}
                              title="Rechazar vecino"
                            >
                              ❌ Rechazar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Detalles */}
      {mostrarModal && vecinoSeleccionado && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setMostrarModal(false)}>
          <div className="modal-dialog modal-lg modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  Detalles del Vecino Pendiente
                </h5>
                <button type="button" className="btn-close" onClick={() => setMostrarModal(false)}></button>
              </div>
              <div className="modal-body">
                {/* Encabezado */}
                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h4 className="mb-0">
                      {vecinoSeleccionado.nombres} {vecinoSeleccionado.apellidos}
                    </h4>
                    <span className="badge bg-warning text-dark fs-6">
                      ⏰ Pendiente de Aprobación
                    </span>
                  </div>
                  <hr />
                </div>

                {/* Información Personal */}
                <div className="mb-4">
                  <h6 className="mb-3">👤 Información Personal</h6>
                  <div className="row">
                    <div className="col-md-6">
                      <p className="mb-2">
                        <strong>Nombres:</strong><br />
                        <span className="text-muted">{vecinoSeleccionado.nombres}</span>
                      </p>
                      <p className="mb-2">
                        <strong>Apellidos:</strong><br />
                        <span className="text-muted">{vecinoSeleccionado.apellidos}</span>
                      </p>
                      <p className="mb-2">
                        <strong>RUT:</strong><br />
                        <code>{vecinoSeleccionado.rut}</code>
                      </p>
                    </div>
                    <div className="col-md-6">
                      <p className="mb-2">
                        <strong>Email:</strong><br />
                        <span className="text-muted">{vecinoSeleccionado.email}</span>
                      </p>
                      <p className="mb-2">
                        <strong>Teléfono:</strong><br />
                        <span className="text-muted">{vecinoSeleccionado.telefono}</span>
                      </p>
                      <p className="mb-2">
                        <strong>Dirección:</strong><br />
                        <span className="text-muted">{vecinoSeleccionado.direccion}</span>
                      </p>
                    </div>
                  </div>
                  <hr />
                </div>

                {/* Fechas */}
                <div className="mb-4">
                  <h6 className="mb-3">📅 Información de Registro</h6>
                  <div className="row">
                    <div className="col-md-6">
                      <p className="mb-2">
                        <strong>Fecha de Registro:</strong><br />
                        <span className="text-muted">{formatearFecha(vecinoSeleccionado.created_at)}</span>
                      </p>
                    </div>
                    <div className="col-md-6">
                      <p className="mb-2">
                        <strong>Última Actualización:</strong><br />
                        <span className="text-muted">{formatearFecha(vecinoSeleccionado.updated_at)}</span>
                      </p>
                    </div>
                  </div>
                  <hr />
                </div>

                {/* Comprobante */}
                {vecinoSeleccionado.comprobante_url && (
                  <div className="mb-3">
                    <h6 className="mb-3">📄 Comprobante de Residencia</h6>
                    <p className="mb-2">
                      <a href={vecinoSeleccionado.comprobante_url} target="_blank" rel="noopener noreferrer" className="btn btn-outline-primary btn-sm">
                        📥 Ver Comprobante
                      </a>
                    </p>
                  </div>
                )}

                {/* ID del Sistema */}
                <div className="mb-3">
                  <h6 className="mb-3">ℹ️ Información del Sistema</h6>
                  <p className="mb-2">
                    <strong>ID de Usuario:</strong><br />
                    <code>{vecinoSeleccionado.id}</code>
                  </p>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-success"
                  onClick={() => {
                    aprobarVecino(vecinoSeleccionado.id);
                    setMostrarModal(false);
                  }}
                >
                  ✅ Aprobar Vecino
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => {
                    rechazarVecino(vecinoSeleccionado.id);
                    setMostrarModal(false);
                  }}
                >
                  ❌ Rechazar Vecino
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setMostrarModal(false)}>
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .page-container {
          padding: 2rem;
          max-width: 1400px;
          margin: 0 auto;
        }

        .page-header {
          margin-bottom: 2rem;
        }

        .page-header h1 {
          color: #154765;
          font-size: 2rem;
          font-weight: bold;
          margin-bottom: 0.5rem;
        }

        .stat-card {
          padding: 1.5rem;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .stat-number {
          font-size: 2rem;
          font-weight: bold;
          color: #154765;
        }

        .stat-label {
          color: #439fa4;
          font-weight: 600;
          margin-top: 0.5rem;
        }

        .empty-state {
          color: #6c757d;
        }

        .empty-icon {
          opacity: 0.5;
        }

        .table {
          margin-bottom: 0;
        }

        .table thead {
          background: #f8f9fa;
        }

        .btn-group-sm .btn {
          font-size: 0.875rem;
          padding: 0.25rem 0.5rem;
        }

        .modal.show {
          display: block;
        }
      `}</style>
    </div>
  );
}
