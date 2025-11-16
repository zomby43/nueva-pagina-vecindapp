'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NuevaTransaccion() {
  const router = useRouter();
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    tipo: 'ingreso',
    categoria_id: '',
    monto: '',
    descripcion: '',
    fecha: new Date().toISOString().split('T')[0],
    numero_comprobante: '',
    metodo_pago: '',
    beneficiario: '',
  });

  useEffect(() => {
    fetchCategorias();
  }, [formData.tipo]);

  const fetchCategorias = async () => {
    try {
      const response = await fetch(
        `/api/finanzas/categorias?activo=true&tipo=${formData.tipo}`
      );
      const data = await response.json();
      if (data.categorias) {
        setCategorias(data.categorias);
      }
    } catch (error) {
      console.error('Error obteniendo categorías:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones
    if (!formData.tipo || !formData.monto || !formData.descripcion) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    if (parseFloat(formData.monto) <= 0) {
      alert('El monto debe ser mayor a 0');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/finanzas/transacciones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          monto: parseFloat(formData.monto),
          categoria_id: formData.categoria_id || null,
          numero_comprobante: formData.numero_comprobante || null,
          metodo_pago: formData.metodo_pago || null,
          beneficiario: formData.beneficiario || null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Transacción registrada exitosamente');
        router.push('/secretaria/finanzas/transacciones');
      } else {
        alert(`Error: ${data.error || 'No se pudo crear la transacción'}`);
      }
    } catch (error) {
      console.error('Error creando transacción:', error);
      alert('Error al crear la transacción');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="mb-4">
        <h1 className="h3 mb-1">
          <i className="bi bi-plus-circle me-2"></i>
          Nueva Transacción
        </h1>
        <p className="text-muted mb-0">Registra un nuevo ingreso o egreso</p>
      </div>

      <div className="row">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                {/* Tipo de Transacción */}
                <div className="mb-4">
                  <label className="form-label fw-bold">
                    Tipo de Transacción <span className="text-danger">*</span>
                  </label>
                  <div className="d-flex gap-3">
                    <div className="form-check form-check-inline">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="tipo"
                        id="tipo_ingreso"
                        value="ingreso"
                        checked={formData.tipo === 'ingreso'}
                        onChange={handleChange}
                      />
                      <label className="form-check-label" htmlFor="tipo_ingreso">
                        <i className="bi bi-arrow-down-circle text-success me-2"></i>
                        Ingreso
                      </label>
                    </div>
                    <div className="form-check form-check-inline">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="tipo"
                        id="tipo_egreso"
                        value="egreso"
                        checked={formData.tipo === 'egreso'}
                        onChange={handleChange}
                      />
                      <label className="form-check-label" htmlFor="tipo_egreso">
                        <i className="bi bi-arrow-up-circle text-danger me-2"></i>
                        Egreso
                      </label>
                    </div>
                  </div>
                </div>

                <div className="row g-3">
                  {/* Monto */}
                  <div className="col-md-6">
                    <label className="form-label fw-bold">
                      Monto <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">$</span>
                      <input
                        type="number"
                        className="form-control"
                        name="monto"
                        value={formData.monto}
                        onChange={handleChange}
                        placeholder="0"
                        min="0"
                        step="1"
                        required
                      />
                    </div>
                  </div>

                  {/* Fecha */}
                  <div className="col-md-6">
                    <label className="form-label fw-bold">
                      Fecha <span className="text-danger">*</span>
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      name="fecha"
                      value={formData.fecha}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* Categoría */}
                  <div className="col-12">
                    <label className="form-label fw-bold">Categoría</label>
                    <select
                      className="form-select"
                      name="categoria_id"
                      value={formData.categoria_id}
                      onChange={handleChange}
                    >
                      <option value="">Sin categoría</option>
                      {categorias.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.nombre}
                        </option>
                      ))}
                    </select>
                    <small className="text-muted">
                      {formData.tipo === 'ingreso'
                        ? 'Selecciona el tipo de ingreso'
                        : 'Selecciona el tipo de egreso'}
                    </small>
                  </div>

                  {/* Descripción */}
                  <div className="col-12">
                    <label className="form-label fw-bold">
                      Descripción <span className="text-danger">*</span>
                    </label>
                    <textarea
                      className="form-control"
                      name="descripcion"
                      rows="3"
                      value={formData.descripcion}
                      onChange={handleChange}
                      placeholder="Describe brevemente esta transacción..."
                      required
                    ></textarea>
                  </div>

                  {/* Número de Comprobante */}
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Número de Comprobante</label>
                    <input
                      type="text"
                      className="form-control"
                      name="numero_comprobante"
                      value={formData.numero_comprobante}
                      onChange={handleChange}
                      placeholder="Ej: FACT-001234"
                    />
                    <small className="text-muted">Opcional: factura, boleta, recibo, etc.</small>
                  </div>

                  {/* Método de Pago */}
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Método de Pago</label>
                    <select
                      className="form-select"
                      name="metodo_pago"
                      value={formData.metodo_pago}
                      onChange={handleChange}
                    >
                      <option value="">Seleccionar...</option>
                      <option value="efectivo">Efectivo</option>
                      <option value="transferencia">Transferencia</option>
                      <option value="cheque">Cheque</option>
                      <option value="tarjeta_debito">Tarjeta de Débito</option>
                      <option value="tarjeta_credito">Tarjeta de Crédito</option>
                      <option value="otro">Otro</option>
                    </select>
                  </div>

                  {/* Beneficiario (solo para egresos) */}
                  {formData.tipo === 'egreso' && (
                    <div className="col-12">
                      <label className="form-label fw-bold">Beneficiario</label>
                      <input
                        type="text"
                        className="form-control"
                        name="beneficiario"
                        value={formData.beneficiario}
                        onChange={handleChange}
                        placeholder="Nombre de la persona o empresa que recibió el pago"
                      />
                      <small className="text-muted">Opcional: ¿A quién se le pagó?</small>
                    </div>
                  )}
                </div>

                {/* Botones */}
                <div className="d-flex gap-2 mt-4 pt-3 border-top">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Guardando...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle me-2"></i>
                        Guardar Transacción
                      </>
                    )}
                  </button>
                  <Link
                    href="/secretaria/finanzas/transacciones"
                    className="btn btn-outline-secondary"
                  >
                    Cancelar
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Sidebar con ayuda */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm bg-light">
            <div className="card-body">
              <h5 className="mb-3">
                <i className="bi bi-info-circle me-2"></i>
                Información
              </h5>

              <div className="mb-3">
                <h6 className="fw-bold">
                  <i className="bi bi-arrow-down-circle text-success me-2"></i>
                  Ingresos
                </h6>
                <p className="small text-muted mb-0">
                  Registra cuotas de socios, donaciones, subsidios, arriendo de espacios, etc.
                </p>
              </div>

              <div className="mb-3">
                <h6 className="fw-bold">
                  <i className="bi bi-arrow-up-circle text-danger me-2"></i>
                  Egresos
                </h6>
                <p className="small text-muted mb-0">
                  Registra pagos de servicios, compras, honorarios, gastos de eventos, etc.
                </p>
              </div>

              <hr />

              <div className="alert alert-info mb-0" role="alert">
                <i className="bi bi-lightbulb me-2"></i>
                <strong>Consejo:</strong> Siempre guarda los comprobantes físicos y adjúntalos
                digitalmente cuando sea posible.
              </div>
            </div>
          </div>

          <div className="card border-0 shadow-sm mt-3">
            <div className="card-body">
              <h6 className="mb-3">
                <i className="bi bi-shield-check me-2"></i>
                Transparencia
              </h6>
              <p className="small text-muted mb-0">
                Esta información se utiliza para generar el balance anual de acuerdo a la Ley
                N°19.418 de Juntas de Vecinos de Chile.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
