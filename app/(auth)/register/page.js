'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    rut: '',
    email: '',
    direccion: '',
    telefono: '',
    password: '',
    confirmPassword: '',
    archivo: null
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'file' ? files[0] : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    console.log('Register:', formData);
    // TODO: Implementar lógica de registro
    alert('Funcionalidad de registro pendiente de implementar');
  };

  return (
    <div className="auth-container">
      <div className="auth-card register-card">
        <h2 className="auth-title">Crear Cuenta</h2>
        <p className="auth-subtitle">Regístrate en VecindApp</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="row g-3">
            <div className="col-md-6">
              <label htmlFor="nombres" className="form-label">Nombres *</label>
              <input
                type="text"
                className="form-control"
                id="nombres"
                name="nombres"
                value={formData.nombres}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-6">
              <label htmlFor="apellidos" className="form-label">Apellidos *</label>
              <input
                type="text"
                className="form-control"
                id="apellidos"
                name="apellidos"
                value={formData.apellidos}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="row g-3 mt-1">
            <div className="col-md-6">
              <label htmlFor="rut" className="form-label">RUT *</label>
              <input
                type="text"
                className="form-control"
                id="rut"
                name="rut"
                value={formData.rut}
                onChange={handleChange}
                placeholder="12.345.678-9"
                required
              />
            </div>

            <div className="col-md-6">
              <label htmlFor="telefono" className="form-label">Teléfono *</label>
              <input
                type="tel"
                className="form-control"
                id="telefono"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                placeholder="+56 9 1234 5678"
                required
              />
            </div>
          </div>

          <div className="mb-3 mt-3">
            <label htmlFor="email" className="form-label">Email *</label>
            <input
              type="email"
              className="form-control"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="tu@email.com"
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="direccion" className="form-label">Dirección *</label>
            <input
              type="text"
              className="form-control"
              id="direccion"
              name="direccion"
              value={formData.direccion}
              onChange={handleChange}
              placeholder="Calle, número, departamento"
              required
            />
          </div>

          <div className="row g-3">
            <div className="col-md-6">
              <label htmlFor="password" className="form-label">Contraseña *</label>
              <div className="input-group">
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  minLength="6"
                  placeholder="Mínimo 6 caracteres"
                  required
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>

            <div className="col-md-6">
              <label htmlFor="confirmPassword" className="form-label">Confirmar Contraseña *</label>
              <div className="input-group">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className={`form-control ${
                    formData.confirmPassword &&
                    formData.password !== formData.confirmPassword
                      ? 'is-invalid'
                      : ''
                  }`}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  minLength="6"
                  placeholder="Repite tu contraseña"
                  required
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
              {formData.confirmPassword &&
               formData.password !== formData.confirmPassword && (
                <div className="invalid-feedback d-block">
                  Las contraseñas no coinciden
                </div>
              )}
            </div>
          </div>

          <div className="mb-3 mt-3">
            <label htmlFor="archivo" className="form-label">
              Comprobante de Residencia *
            </label>
            <small className="d-block text-muted mb-2">
              (Cuenta de luz, agua, teléfono o documento que acredite tu domicilio)
            </small>
            <input
              type="file"
              className="form-control"
              id="archivo"
              name="archivo"
              onChange={handleChange}
              accept=".pdf,.jpg,.jpeg,.png,.gif"
              required
            />
            {formData.archivo && (
              <small className="text-success d-block mt-2">
                ✓ {formData.archivo.name}
              </small>
            )}
          </div>

          <button type="submit" className="btn btn-primary w-100 mt-3">
            Crear Cuenta
          </button>
        </form>

        <div className="auth-divider">
          <span>o</span>
        </div>

        <div className="auth-redirect">
          <p>¿Ya tienes cuenta? <Link href="/login" className="text-decoration-none">Inicia sesión aquí</Link></p>
        </div>

        <div className="auth-back">
          <Link href="/" className="text-decoration-none">← Volver al inicio</Link>
        </div>
      </div>
    </div>
  );
}
