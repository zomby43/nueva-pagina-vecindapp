'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function DetalleTransaccionPage() {
  const params = useParams();
  const router = useRouter();
  const [transaccion, setTransaccion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (params.id) {
      fetchTransaccion();
    }
  }, [params.id]);

  const fetchTransaccion = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(`/api/finanzas/transacciones/${params.id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al cargar la transacción');
      }

      setTransaccion(data.transaccion);
    } catch (error) {
      console.error('Error fetching transaccion:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async () => {
    if (!confirm('¿Estás seguro de eliminar esta transacción? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      const response = await fetch(`/api/finanzas/transacciones/${params.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al eliminar la transacción');
      }

      alert('Transacción eliminada exitosamente');
      router.push('/secretaria/finanzas/transacciones');
    } catch (error) {
      console.error('Error eliminando transacción:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '$0';
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (fecha) => {
    if (!fecha) return '';
    return new Date(fecha).toLocaleDateString('es-CL', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatDateTime = (fecha) => {
    if (!fecha) return '';
    return new Date(fecha).toLocaleString('es-CL', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-3 text-muted">Cargando detalles de la transacción...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="alert alert-danger">
          <h5>Error</h5>
          <p className="mb-0">{error}</p>
        </div>
        <Link href="/secretaria/finanzas/transacciones" className="btn btn-secondary">
          <i className="bi bi-arrow-left me-2"></i>
          Volver a Transacciones
        </Link>
      </div>
    );
  }

  if (!transaccion) {
    return (
      <div className="page-container">
        <div className="alert alert-warning">
          <h5>Transacción no encontrada</h5>
          <p className="mb-0">No se encontró la transacción solicitada.</p>
        </div>
        <Link href="/secretaria/finanzas/transacciones" className="btn btn-secondary">
          <i className="bi bi-arrow-left me-2"></i>
          Volver a Transacciones
        </Link>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-1">
            <i className="bi bi-receipt me-2"></i>
            Detalle de Transacción
          </h1>
          <p className="text-muted mb-0">
            Información completa de la transacción
          </p>
        </div>
        <div className="d-flex gap-2">
          <Link
            href={`/secretaria/finanzas/transacciones/${params.id}/editar`}
            className="btn btn-primary"
          >
            <i className="bi bi-pencil me-2"></i>
            Editar
          </Link>
          <button
            onClick={handleEliminar}
            className="btn btn-danger"
          >
            <i className="bi bi-trash me-2"></i>
            Eliminar
          </button>
        </div>
      </div>

      {/* Información Principal */}
      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-white border-bottom py-3">
              <h5 className="mb-0">
                <i className="bi bi-info-circle me-2"></i>
                Información de la Transacción
              </h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="text-muted small mb-1">Tipo de Transacción</label>
                  <div>
                    {transaccion.tipo === 'ingreso' ? (
                      <span className="badge bg-success fs-6">
                        <i className="bi bi-arrow-down-circle me-1"></i>
                        Ingreso
                      </span>
                    ) : (
                      <span className="badge bg-danger fs-6">
                        <i className="bi bi-arrow-up-circle me-1"></i>
                        Egreso
                      </span>
                    )}
                  </div>
                </div>

                <div className="col-md-6">
                  <label className="text-muted small mb-1">Monto</label>
                  <div className={`fs-4 fw-bold ${
                    transaccion.tipo === 'ingreso' ? 'text-success' : 'text-danger'
                  }`}>
                    {transaccion.tipo === 'ingreso' ? '+' : '-'}
                    {formatCurrency(transaccion.monto)}
                  </div>
                </div>

                <div className="col-12">
                  <label className="text-muted small mb-1">Descripción</label>
                  <p className="mb-0 fw-medium">{transaccion.descripcion}</p>
                </div>

                <div className="col-md-6">
                  <label className="text-muted small mb-1">Fecha</label>
                  <div className="fw-medium">
                    <i className="bi bi-calendar3 me-2"></i>
                    {formatDate(transaccion.fecha)}
                  </div>
                </div>

                <div className="col-md-6">
                  <label className="text-muted small mb-1">Categoría</label>
                  <div>
                    {transaccion.categoria ? (
                      <span
                        className="badge fs-6"
                        style={{
                          backgroundColor: transaccion.categoria.color || '#6c757d',
                          color: 'white',
                        }}
                      >
                        {transaccion.categoria.icono && (
                          <i className={`bi bi-${transaccion.categoria.icono} me-1`}></i>
                        )}
                        {transaccion.categoria.nombre}
                      </span>
                    ) : (
                      <span className="text-muted">Sin categoría</span>
                    )}
                  </div>
                </div>

                {transaccion.numero_comprobante && (
                  <div className="col-md-6">
                    <label className="text-muted small mb-1">Número de Comprobante</label>
                    <div className="fw-medium">
                      <i className="bi bi-receipt-cutoff me-2"></i>
                      {transaccion.numero_comprobante}
                    </div>
                  </div>
                )}

                {transaccion.metodo_pago && (
                  <div className="col-md-6">
                    <label className="text-muted small mb-1">Método de Pago</label>
                    <div className="fw-medium text-capitalize">
                      <i className="bi bi-credit-card me-2"></i>
                      {transaccion.metodo_pago.replace('_', ' ')}
                    </div>
                  </div>
                )}

                {transaccion.beneficiario && (
                  <div className="col-12">
                    <label className="text-muted small mb-1">Beneficiario</label>
                    <div className="fw-medium">
                      <i className="bi bi-person me-2"></i>
                      {transaccion.beneficiario}
                    </div>
                  </div>
                )}

                {transaccion.proyecto && (
                  <div className="col-12">
                    <label className="text-muted small mb-1">Proyecto Asociado</label>
                    <div>
                      <Link
                        href={`/secretaria/proyectos/${transaccion.proyecto.id}`}
                        className="text-decoration-none"
                      >
                        <i className="bi bi-building me-2"></i>
                        {transaccion.proyecto.titulo}
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Documentos Adjuntos */}
          {transaccion.documentos && transaccion.documentos.length > 0 && (
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white border-bottom py-3">
                <h5 className="mb-0">
                  <i className="bi bi-paperclip me-2"></i>
                  Documentos Adjuntos ({transaccion.documentos.length})
                </h5>
              </div>
              <div className="card-body">
                <div className="list-group list-group-flush">
                  {transaccion.documentos.map((doc) => (
                    <div key={doc.id} className="list-group-item px-0">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <i className="bi bi-file-earmark-text me-2"></i>
                          <span className="fw-medium">{doc.nombre_archivo}</span>
                          {doc.descripcion && (
                            <p className="text-muted small mb-0 mt-1">{doc.descripcion}</p>
                          )}
                        </div>
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-sm btn-outline-primary"
                        >
                          <i className="bi bi-download me-1"></i>
                          Descargar
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="col-lg-4">
          {/* Balance Info */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-white border-bottom py-3">
              <h5 className="mb-0">
                <i className="bi bi-calendar-range me-2"></i>
                Balance Anual
              </h5>
            </div>
            <div className="card-body">
              {transaccion.balance && (
                <>
                  <div className="text-center mb-3">
                    <div className="text-muted small">Año</div>
                    <div className="fs-3 fw-bold text-primary">{transaccion.balance.año}</div>
                  </div>
                  <div className="text-center">
                    <span className={`badge w-100 py-2 ${
                      transaccion.balance.estado === 'en_curso'
                        ? 'bg-info'
                        : transaccion.balance.estado === 'cerrado'
                        ? 'bg-warning'
                        : 'bg-success'
                    }`}>
                      {transaccion.balance.estado === 'en_curso'
                        ? 'En Curso'
                        : transaccion.balance.estado === 'cerrado'
                        ? 'Cerrado'
                        : 'Aprobado'}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Metadata */}
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-bottom py-3">
              <h5 className="mb-0">
                <i className="bi bi-clock-history me-2"></i>
                Información del Sistema
              </h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="text-muted small mb-1">ID de Transacción</label>
                <div className="text-break small font-monospace">{transaccion.id}</div>
              </div>
              <div className="mb-3">
                <label className="text-muted small mb-1">Fecha de Creación</label>
                <div className="small">{formatDateTime(transaccion.created_at)}</div>
              </div>
              {transaccion.updated_at && transaccion.updated_at !== transaccion.created_at && (
                <div>
                  <label className="text-muted small mb-1">Última Actualización</label>
                  <div className="small">{formatDateTime(transaccion.updated_at)}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4">
        <Link
          href="/secretaria/finanzas/transacciones"
          className="btn btn-outline-secondary"
        >
          <i className="bi bi-arrow-left me-2"></i>
          Volver a Transacciones
        </Link>
      </div>
    </div>
  );
}
