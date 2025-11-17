'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function BalancesAnuales() {
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(null);

  useEffect(() => {
    fetchBalances();
  }, []);

  const fetchBalances = async () => {
    try {
      setLoading(true);
      const supabase = createClient();

      const { data, error } = await supabase
        .from('balances_anuales')
        .select('*')
        .order('año', { ascending: false });

      if (error) throw error;

      setBalances(data || []);
      if (data && data.length > 0) {
        setSelectedYear(data[0].año);
      }
    } catch (error) {
      console.error('Error cargando balances:', error);
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

  const getEstadoBadge = (estado) => {
    switch (estado) {
      case 'en_curso':
        return 'bg-info';
      case 'cerrado':
        return 'bg-warning';
      case 'aprobado':
        return 'bg-success';
      default:
        return 'bg-secondary';
    }
  };

  const getEstadoTexto = (estado) => {
    switch (estado) {
      case 'en_curso':
        return 'En Curso';
      case 'cerrado':
        return 'Cerrado';
      case 'aprobado':
        return 'Aprobado';
      default:
        return estado;
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-3 text-muted">Cargando balances anuales...</p>
        </div>
      </div>
    );
  }

  const balanceActual = balances.find((b) => b.año === selectedYear);

  return (
    <div className="page-container">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-2">
              <li className="breadcrumb-item">
                <Link href="/secretaria/finanzas">Finanzas</Link>
              </li>
              <li className="breadcrumb-item active">Balances Anuales</li>
            </ol>
          </nav>
          <h1 className="h3 mb-1">
            <i className="bi bi-calendar-range me-2"></i>
            Balances Anuales
          </h1>
          <p className="text-muted mb-0">
            Resumen financiero anual de la junta de vecinos
          </p>
        </div>
      </div>

      {balances.length === 0 ? (
        <div className="card border-0 shadow-sm">
          <div className="card-body text-center py-5">
            <i className="bi bi-calendar-x text-muted" style={{ fontSize: '3rem' }}></i>
            <h5 className="mt-3">No hay balances anuales</h5>
            <p className="text-muted">
              Los balances anuales se generan automáticamente al registrar transacciones.
            </p>
            <Link
              href="/secretaria/finanzas/transacciones/nueva"
              className="btn btn-primary"
            >
              <i className="bi bi-plus-circle me-2"></i>
              Registrar Primera Transacción
            </Link>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          {/* Selector de Año */}
          <div className="col-lg-3">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white border-bottom py-3">
                <h5 className="mb-0">
                  <i className="bi bi-calendar3 me-2"></i>
                  Años Fiscales
                </h5>
              </div>
              <div className="list-group list-group-flush">
                {balances.map((balance) => (
                  <button
                    key={balance.id}
                    className={`list-group-item list-group-item-action ${
                      selectedYear === balance.año ? 'active' : ''
                    }`}
                    onClick={() => setSelectedYear(balance.año)}
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="mb-0">{balance.año}</h6>
                        <small className={selectedYear === balance.año ? 'text-white-50' : 'text-muted'}>
                          {getEstadoTexto(balance.estado)}
                        </small>
                      </div>
                      <i className="bi bi-chevron-right"></i>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Detalle del Balance */}
          <div className="col-lg-9">
            {balanceActual && (
              <>
                {/* Cards de Resumen */}
                <div className="row g-3 mb-4">
                  <div className="col-md-3">
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-body text-center">
                        <i className="bi bi-cash text-muted mb-2" style={{ fontSize: '2rem' }}></i>
                        <h6 className="text-muted mb-1">Saldo Inicial</h6>
                        <h4 className="mb-0">{formatCurrency(balanceActual.saldo_inicial)}</h4>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-body text-center">
                        <i className="bi bi-arrow-down-circle text-success mb-2" style={{ fontSize: '2rem' }}></i>
                        <h6 className="text-muted mb-1">Ingresos</h6>
                        <h4 className="text-success mb-0">
                          {formatCurrency(balanceActual.total_ingresos)}
                        </h4>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-body text-center">
                        <i className="bi bi-arrow-up-circle text-danger mb-2" style={{ fontSize: '2rem' }}></i>
                        <h6 className="text-muted mb-1">Egresos</h6>
                        <h4 className="text-danger mb-0">
                          {formatCurrency(balanceActual.total_egresos)}
                        </h4>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-body text-center">
                        <i className="bi bi-wallet2 text-primary mb-2" style={{ fontSize: '2rem' }}></i>
                        <h6 className="text-muted mb-1">Saldo Final</h6>
                        <h4 className="text-primary mb-0">
                          {formatCurrency(balanceActual.saldo_final)}
                        </h4>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Información Detallada */}
                <div className="card border-0 shadow-sm mb-4">
                  <div className="card-header bg-white border-bottom py-3">
                    <h5 className="mb-0">
                      <i className="bi bi-info-circle me-2"></i>
                      Información del Balance {balanceActual.año}
                    </h5>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="text-muted small">Año Fiscal</label>
                        <div className="fw-bold">{balanceActual.año}</div>
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="text-muted small">Estado</label>
                        <div>
                          <span className={`badge ${getEstadoBadge(balanceActual.estado)} px-3 py-2`}>
                            {getEstadoTexto(balanceActual.estado)}
                          </span>
                        </div>
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="text-muted small">Fecha de Creación</label>
                        <div className="fw-bold">
                          {new Date(balanceActual.created_at).toLocaleDateString('es-CL', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </div>
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="text-muted small">Última Actualización</label>
                        <div className="fw-bold">
                          {new Date(balanceActual.updated_at).toLocaleDateString('es-CL', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                    </div>

                    {balanceActual.observaciones && (
                      <div className="mt-3">
                        <label className="text-muted small">Observaciones</label>
                        <div className="alert alert-info mb-0">
                          {balanceActual.observaciones}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Resumen Visual */}
                <div className="card border-0 shadow-sm">
                  <div className="card-header bg-white border-bottom py-3">
                    <h5 className="mb-0">
                      <i className="bi bi-bar-chart me-2"></i>
                      Resumen del Ejercicio {balanceActual.año}
                    </h5>
                  </div>
                  <div className="card-body">
                    <div className="mb-4">
                      <h6 className="text-muted mb-3">Flujo de Caja</h6>
                      <div className="mb-2">
                        <div className="d-flex justify-content-between mb-1">
                          <span>Saldo Inicial</span>
                          <span className="fw-bold">{formatCurrency(balanceActual.saldo_inicial)}</span>
                        </div>
                        <div className="progress" style={{ height: '8px' }}>
                          <div
                            className="progress-bar bg-secondary"
                            role="progressbar"
                            style={{ width: '100%' }}
                          ></div>
                        </div>
                      </div>

                      <div className="mb-2">
                        <div className="d-flex justify-content-between mb-1">
                          <span className="text-success">+ Ingresos</span>
                          <span className="fw-bold text-success">
                            {formatCurrency(balanceActual.total_ingresos)}
                          </span>
                        </div>
                        <div className="progress" style={{ height: '8px' }}>
                          <div
                            className="progress-bar bg-success"
                            role="progressbar"
                            style={{
                              width: `${
                                (balanceActual.total_ingresos /
                                  (balanceActual.total_ingresos + balanceActual.total_egresos)) *
                                100
                              }%`,
                            }}
                          ></div>
                        </div>
                      </div>

                      <div className="mb-2">
                        <div className="d-flex justify-content-between mb-1">
                          <span className="text-danger">- Egresos</span>
                          <span className="fw-bold text-danger">
                            {formatCurrency(balanceActual.total_egresos)}
                          </span>
                        </div>
                        <div className="progress" style={{ height: '8px' }}>
                          <div
                            className="progress-bar bg-danger"
                            role="progressbar"
                            style={{
                              width: `${
                                (balanceActual.total_egresos /
                                  (balanceActual.total_ingresos + balanceActual.total_egresos)) *
                                100
                              }%`,
                            }}
                          ></div>
                        </div>
                      </div>

                      <hr className="my-3" />

                      <div>
                        <div className="d-flex justify-content-between mb-1">
                          <span className="fw-bold">Saldo Final</span>
                          <span className="fw-bold text-primary fs-5">
                            {formatCurrency(balanceActual.saldo_final)}
                          </span>
                        </div>
                        <div className="progress" style={{ height: '12px' }}>
                          <div
                            className="progress-bar bg-primary"
                            role="progressbar"
                            style={{ width: '100%' }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    <div className="d-flex gap-2 mt-4">
                      <Link
                        href="/secretaria/finanzas/transacciones"
                        className="btn btn-outline-primary"
                      >
                        <i className="bi bi-list-ul me-2"></i>
                        Ver Transacciones
                      </Link>
                      <Link
                        href="/secretaria/finanzas"
                        className="btn btn-outline-secondary"
                      >
                        <i className="bi bi-arrow-left me-2"></i>
                        Volver al Dashboard
                      </Link>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
