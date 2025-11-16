'use client';

import { useEffect, useState } from 'react';

/**
 * Widget simple que muestra el balance disponible de la junta
 * Solo para vecinos - sin detalles de transacciones
 */
export default function BalanceWidget() {
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBalance();
  }, []);

  const fetchBalance = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/finanzas/balance');

      if (!response.ok) {
        throw new Error('Error al obtener el balance');
      }

      const data = await response.json();
      setBalance(data.balance_actual);
      setError(null);
    } catch (err) {
      console.error('Error fetching balance:', err);
      setError('No se pudo cargar el balance');
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="card shadow-sm border-0">
        <div className="card-body text-center p-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card shadow-sm border-0">
        <div className="card-body text-center p-4">
          <i className="bi bi-exclamation-triangle text-warning fs-1"></i>
          <p className="text-muted mt-2 mb-0">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card shadow-sm border-0 h-100">
      <div className="card-body p-4">
        <div className="d-flex align-items-center mb-3">
          <div className="bg-success bg-opacity-10 p-3 rounded-circle me-3">
            <i className="bi bi-cash-coin text-success fs-3"></i>
          </div>
          <div>
            <h6 className="text-muted mb-0 fw-normal">Balance Disponible</h6>
            <small className="text-muted">Fondos de la Junta de Vecinos</small>
          </div>
        </div>

        <div className="text-center py-3">
          <h2 className="display-4 fw-bold text-success mb-0">
            {formatCurrency(balance)}
          </h2>
        </div>

        <div className="mt-3 pt-3 border-top">
          <small className="text-muted d-flex align-items-center justify-content-center">
            <i className="bi bi-info-circle me-2"></i>
            Este balance te ayuda a evaluar el presupuesto al proponer proyectos
          </small>
        </div>
      </div>
    </div>
  );
}
