'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function FinanzasDashboard() {
  const [balance, setBalance] = useState(null);
  const [balanceAño, setBalanceAño] = useState(null);
  const [transaccionesRecientes, setTransaccionesRecientes] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDatosFinancieros();
  }, []);

  const fetchDatosFinancieros = async () => {
    try {
      setLoading(true);
      const supabase = createClient();

      // Obtener balance actual
      const balanceResponse = await fetch('/api/finanzas/balance');
      const balanceData = await balanceResponse.json();
      setBalance(balanceData.balance_actual);
      setBalanceAño(balanceData.balance_año);

      // Obtener transacciones recientes
      const { data: transacciones, error: transError } = await supabase
        .from('transacciones_financieras')
        .select(`
          *,
          categoria:categorias_transaccion(nombre, tipo, color)
        `)
        .order('fecha', { ascending: false })
        .limit(10);

      if (!transError && transacciones) {
        setTransaccionesRecientes(transacciones);
      }

      // Obtener categorías
      const { data: cats, error: catError } = await supabase
        .from('categorias_transaccion')
        .select('*')
        .eq('activo', true)
        .order('tipo', { ascending: true })
        .order('nombre', { ascending: true });

      if (!catError && cats) {
        setCategorias(cats);
      }
    } catch (error) {
      console.error('Error cargando datos financieros:', error);
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

  const formatDate = (fecha) => {
    if (!fecha) return '';
    return new Date(fecha).toLocaleDateString('es-CL', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-3 text-muted">Cargando información financiera...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-1">
            <i className="bi bi-cash-stack me-2"></i>
            Gestión Financiera
          </h1>
          <p className="text-muted mb-0">
            Administra las finanzas de la junta de vecinos
          </p>
        </div>
        <div>
          <Link
            href="/secretaria/finanzas/transacciones/nueva"
            className="btn btn-primary"
          >
            <i className="bi bi-plus-circle me-2"></i>
            Registrar Transacción
          </Link>
        </div>
      </div>

      {/* Cards de resumen */}
      <div className="row g-4 mb-4">
        {/* Balance Actual */}
        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center mb-3">
                <div className="bg-success bg-opacity-10 p-3 rounded-circle me-3">
                  <i className="bi bi-wallet2 text-success fs-4"></i>
                </div>
                <div>
                  <h6 className="text-dark mb-0 fw-semibold">Balance Actual</h6>
                  <small className="text-muted">Fondos Disponibles</small>
                </div>
              </div>
              <h2 className="display-5 fw-bold text-success mb-0">
                {formatCurrency(balance)}
              </h2>
            </div>
          </div>
        </div>

        {/* Total Ingresos del Año */}
        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center mb-3">
                <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-3">
                  <i className="bi bi-arrow-down-circle text-primary fs-4"></i>
                </div>
                <div>
                  <h6 className="text-dark mb-0 fw-semibold">Ingresos {balanceAño?.año}</h6>
                  <small className="text-muted">Total del año</small>
                </div>
              </div>
              <h2 className="display-6 fw-bold text-primary mb-0">
                {formatCurrency(balanceAño?.total_ingresos || 0)}
              </h2>
            </div>
          </div>
        </div>

        {/* Total Egresos del Año */}
        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center mb-3">
                <div className="bg-danger bg-opacity-10 p-3 rounded-circle me-3">
                  <i className="bi bi-arrow-up-circle text-danger fs-4"></i>
                </div>
                <div>
                  <h6 className="text-dark mb-0 fw-semibold">Egresos {balanceAño?.año}</h6>
                  <small className="text-muted">Total del año</small>
                </div>
              </div>
              <h2 className="display-6 fw-bold text-danger mb-0">
                {formatCurrency(balanceAño?.total_egresos || 0)}
              </h2>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Transacciones Recientes */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-bottom-0 d-flex justify-content-between align-items-center py-3">
              <h5 className="mb-0 text-dark">
                <i className="bi bi-clock-history me-2"></i>
                Transacciones Recientes
              </h5>
              <Link
                href="/secretaria/finanzas/transacciones"
                className="btn btn-sm btn-primary text-white"
              >
                <i className="bi bi-list-ul me-1"></i>
                Ver todas
              </Link>
            </div>
            <div className="card-body p-0">
              {transaccionesRecientes.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-inbox text-muted" style={{ fontSize: '3rem' }}></i>
                  <p className="text-muted mt-3">No hay transacciones registradas</p>
                  <Link
                    href="/secretaria/finanzas/transacciones/nueva"
                    className="btn btn-primary btn-sm"
                  >
                    Registrar primera transacción
                  </Link>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th className="text-dark fw-semibold">Fecha</th>
                        <th className="text-dark fw-semibold">Descripción</th>
                        <th className="text-dark fw-semibold">Categoría</th>
                        <th className="text-dark fw-semibold">Tipo</th>
                        <th className="text-dark fw-semibold text-end">Monto</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transaccionesRecientes.map((transaccion) => (
                        <tr key={transaccion.id}>
                          <td className="text-dark">{formatDate(transaccion.fecha)}</td>
                          <td>
                            <div className="fw-semibold text-dark">{transaccion.descripcion}</div>
                            {transaccion.numero_comprobante && (
                              <small className="text-muted">
                                Comp. #{transaccion.numero_comprobante}
                              </small>
                            )}
                          </td>
                          <td>
                            <span
                              className="badge rounded-pill"
                              style={{
                                backgroundColor: transaccion.categoria?.color || '#6c757d',
                                color: 'white',
                              }}
                            >
                              {transaccion.categoria?.nombre || 'Sin categoría'}
                            </span>
                          </td>
                          <td>
                            {transaccion.tipo === 'ingreso' ? (
                              <span className="badge bg-success">
                                <i className="bi bi-arrow-down"></i> Ingreso
                              </span>
                            ) : (
                              <span className="badge bg-danger">
                                <i className="bi bi-arrow-up"></i> Egreso
                              </span>
                            )}
                          </td>
                          <td className="text-end">
                            <span
                              className={`fw-bold ${
                                transaccion.tipo === 'ingreso'
                                  ? 'text-success'
                                  : 'text-danger'
                              }`}
                            >
                              {transaccion.tipo === 'ingreso' ? '+' : '-'}
                              {formatCurrency(transaccion.monto)}
                            </span>
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

        {/* Accesos Rápidos */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-white border-bottom-0 py-3">
              <h5 className="mb-0 text-dark">
                <i className="bi bi-lightning-fill me-2"></i>
                Accesos Rápidos
              </h5>
            </div>
            <div className="card-body">
              <div className="d-grid gap-2">
                <Link
                  href="/secretaria/finanzas/transacciones/nueva"
                  className="btn btn-primary text-white text-start"
                >
                  <i className="bi bi-plus-circle me-2"></i>
                  Nueva Transacción
                </Link>
                <Link
                  href="/secretaria/finanzas/transacciones"
                  className="btn btn-secondary text-white text-start"
                >
                  <i className="bi bi-list-ul me-2"></i>
                  Ver Transacciones
                </Link>
                <Link
                  href="/secretaria/finanzas/balances"
                  className="btn btn-secondary text-white text-start"
                >
                  <i className="bi bi-calendar-range me-2"></i>
                  Balances Anuales
                </Link>
                <Link
                  href="/secretaria/finanzas/categorias"
                  className="btn btn-secondary text-white text-start"
                >
                  <i className="bi bi-tags me-2"></i>
                  Gestionar Categorías
                </Link>
              </div>
            </div>
          </div>

          {/* Información del Balance Anual */}
          {balanceAño && (
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white border-bottom-0 py-3">
                <h5 className="mb-0 text-dark">
                  <i className="bi bi-calendar-check me-2"></i>
                  Balance {balanceAño.año}
                </h5>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-dark">Saldo Inicial:</span>
                    <span className="fw-bold text-dark">{formatCurrency(balanceAño.saldo_inicial)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-success fw-semibold">+ Ingresos:</span>
                    <span className="fw-bold text-success">
                      {formatCurrency(balanceAño.total_ingresos)}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-danger fw-semibold">- Egresos:</span>
                    <span className="fw-bold text-danger">
                      {formatCurrency(balanceAño.total_egresos)}
                    </span>
                  </div>
                  <hr />
                  <div className="d-flex justify-content-between">
                    <span className="fw-bold text-dark">Saldo Final:</span>
                    <span className="fw-bold text-primary fs-5">
                      {formatCurrency(balanceAño.saldo_final)}
                    </span>
                  </div>
                </div>
                <div className="mt-3">
                  <span
                    className={`badge w-100 py-2 ${
                      balanceAño.estado === 'en_curso'
                        ? 'bg-info'
                        : balanceAño.estado === 'cerrado'
                        ? 'bg-warning'
                        : 'bg-success'
                    }`}
                  >
                    {balanceAño.estado === 'en_curso'
                      ? 'En Curso'
                      : balanceAño.estado === 'cerrado'
                      ? 'Cerrado'
                      : 'Aprobado'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
