'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function TransaccionesPage() {
  const [transacciones, setTransacciones] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    tipo: '',
    categoria_id: '',
    fecha_desde: '',
    fecha_hasta: '',
  });

  useEffect(() => {
    fetchCategorias();
    fetchTransacciones();
  }, []);

  const fetchCategorias = async () => {
    try {
      const response = await fetch('/api/finanzas/categorias?activo=true');
      const data = await response.json();
      if (data.categorias) {
        setCategorias(data.categorias);
      }
    } catch (error) {
      console.error('Error obteniendo categorías:', error);
    }
  };

  const fetchTransacciones = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (filtros.tipo) params.append('tipo', filtros.tipo);
      if (filtros.categoria_id) params.append('categoria_id', filtros.categoria_id);
      if (filtros.fecha_desde) params.append('fecha_desde', filtros.fecha_desde);
      if (filtros.fecha_hasta) params.append('fecha_hasta', filtros.fecha_hasta);

      const response = await fetch(`/api/finanzas/transacciones?${params.toString()}`);
      const data = await response.json();

      if (data.transacciones) {
        setTransacciones(data.transacciones);
      }
    } catch (error) {
      console.error('Error obteniendo transacciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const aplicarFiltros = (e) => {
    e.preventDefault();
    fetchTransacciones();
  };

  const limpiarFiltros = () => {
    setFiltros({
      tipo: '',
      categoria_id: '',
      fecha_desde: '',
      fecha_hasta: '',
    });
    setTimeout(() => fetchTransacciones(), 100);
  };

  const handleEliminar = async (id) => {
    if (!confirm('¿Estás seguro de eliminar esta transacción?')) {
      return;
    }

    try {
      const response = await fetch(`/api/finanzas/transacciones/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Transacción eliminada exitosamente');
        fetchTransacciones();
      } else {
        const data = await response.json();
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error eliminando transacción:', error);
      alert('Error al eliminar la transacción');
    }
  };

  const formatCurrency = (amount) => {
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

  return (
    <div className="page-container">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-1">
            <i className="bi bi-list-ul me-2"></i>
            Transacciones Financieras
          </h1>
          <p className="text-muted mb-0">Gestiona los ingresos y egresos de la junta</p>
        </div>
        <div className="d-flex gap-2">
          <Link href="/secretaria/finanzas" className="btn btn-outline-secondary">
            <i className="bi bi-arrow-left me-2"></i>
            Volver
          </Link>
          <Link href="/secretaria/finanzas/transacciones/nueva" className="btn btn-primary">
            <i className="bi bi-plus-circle me-2"></i>
            Nueva Transacción
          </Link>
        </div>
      </div>

      {/* Filtros */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <h5 className="mb-3">
            <i className="bi bi-funnel me-2"></i>
            Filtros
          </h5>
          <form onSubmit={aplicarFiltros}>
            <div className="row g-3">
              <div className="col-md-3">
                <label className="form-label">Tipo</label>
                <select
                  name="tipo"
                  className="form-select"
                  value={filtros.tipo}
                  onChange={handleFiltroChange}
                >
                  <option value="">Todos</option>
                  <option value="ingreso">Ingresos</option>
                  <option value="egreso">Egresos</option>
                </select>
              </div>

              <div className="col-md-3">
                <label className="form-label">Categoría</label>
                <select
                  name="categoria_id"
                  className="form-select"
                  value={filtros.categoria_id}
                  onChange={handleFiltroChange}
                >
                  <option value="">Todas</option>
                  {categorias.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.tipo === 'ingreso' ? '📈' : '📉'} {cat.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-2">
                <label className="form-label">Desde</label>
                <input
                  type="date"
                  name="fecha_desde"
                  className="form-control"
                  value={filtros.fecha_desde}
                  onChange={handleFiltroChange}
                />
              </div>

              <div className="col-md-2">
                <label className="form-label">Hasta</label>
                <input
                  type="date"
                  name="fecha_hasta"
                  className="form-control"
                  value={filtros.fecha_hasta}
                  onChange={handleFiltroChange}
                />
              </div>

              <div className="col-md-2 d-flex align-items-end">
                <div className="d-flex gap-2 w-100">
                  <button type="submit" className="btn btn-primary flex-grow-1">
                    <i className="bi bi-search"></i>
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={limpiarFiltros}
                  >
                    <i className="bi bi-x-circle"></i>
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Tabla de transacciones */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
            </div>
          ) : transacciones.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-inbox text-muted" style={{ fontSize: '3rem' }}></i>
              <p className="text-muted mt-3">No se encontraron transacciones</p>
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
                    <th>Fecha</th>
                    <th>Descripción</th>
                    <th>Categoría</th>
                    <th>Tipo</th>
                    <th className="text-end">Monto</th>
                    <th className="text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {transacciones.map((transaccion) => (
                    <tr key={transaccion.id}>
                      <td className="align-middle">{formatDate(transaccion.fecha)}</td>
                      <td className="align-middle">
                        <div className="fw-medium">{transaccion.descripcion}</div>
                        {transaccion.numero_comprobante && (
                          <small className="text-muted">
                            Comp. #{transaccion.numero_comprobante}
                          </small>
                        )}
                        {transaccion.beneficiario && (
                          <div>
                            <small className="text-muted">
                              <i className="bi bi-person me-1"></i>
                              {transaccion.beneficiario}
                            </small>
                          </div>
                        )}
                      </td>
                      <td className="align-middle">
                        {transaccion.categoria ? (
                          <span
                            className="badge rounded-pill"
                            style={{
                              backgroundColor: transaccion.categoria.color || '#6c757d',
                              color: 'white',
                            }}
                          >
                            {transaccion.categoria.nombre}
                          </span>
                        ) : (
                          <span className="text-muted">Sin categoría</span>
                        )}
                      </td>
                      <td className="align-middle">
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
                      <td className="text-end align-middle">
                        <span
                          className={`fw-bold fs-6 ${
                            transaccion.tipo === 'ingreso' ? 'text-success' : 'text-danger'
                          }`}
                        >
                          {transaccion.tipo === 'ingreso' ? '+' : '-'}
                          {formatCurrency(transaccion.monto)}
                        </span>
                      </td>
                      <td className="text-center align-middle">
                        <div className="btn-group btn-group-sm">
                          <Link
                            href={`/secretaria/finanzas/transacciones/${transaccion.id}`}
                            className="btn btn-outline-primary"
                            title="Ver detalles"
                          >
                            <i className="bi bi-eye"></i>
                          </Link>
                          <button
                            className="btn btn-outline-danger"
                            onClick={() => handleEliminar(transaccion.id)}
                            title="Eliminar"
                          >
                            <i className="bi bi-trash"></i>
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

      {/* Resumen */}
      {transacciones.length > 0 && (
        <div className="card border-0 shadow-sm mt-4">
          <div className="card-body">
            <div className="row text-center">
              <div className="col-md-4">
                <h6 className="text-muted">Total Transacciones</h6>
                <h4>{transacciones.length}</h4>
              </div>
              <div className="col-md-4">
                <h6 className="text-success">Total Ingresos</h6>
                <h4 className="text-success">
                  {formatCurrency(
                    transacciones
                      .filter((t) => t.tipo === 'ingreso')
                      .reduce((sum, t) => sum + parseFloat(t.monto), 0)
                  )}
                </h4>
              </div>
              <div className="col-md-4">
                <h6 className="text-danger">Total Egresos</h6>
                <h4 className="text-danger">
                  {formatCurrency(
                    transacciones
                      .filter((t) => t.tipo === 'egreso')
                      .reduce((sum, t) => sum + parseFloat(t.monto), 0)
                  )}
                </h4>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
