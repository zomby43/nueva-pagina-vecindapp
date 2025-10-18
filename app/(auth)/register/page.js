'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const router = useRouter();
  const { signUp, uploadComprobante } = useAuth();

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'file' ? files[0] : value
    }));
    setError(''); // Limpiar error al escribir
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validaciones
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setLoading(false);
      return;
    }

    if (!formData.archivo) {
      setError('Debes subir un comprobante de residencia');
      setLoading(false);
      return;
    }

    try {
      // 1. Crear usuario en Supabase
      const result = await signUp({
        email: formData.email,
        password: formData.password,
        nombres: formData.nombres,
        apellidos: formData.apellidos,
        rut: formData.rut,
        direccion: formData.direccion,
        telefono: formData.telefono,
      });

      if (!result.success) {
        setError(result.error || 'Error al crear la cuenta');
        setLoading(false);
        return;
      }

      // 2. Subir comprobante de residencia
      if (formData.archivo && result.data?.user?.id) {
        const uploadResult = await uploadComprobante(result.data.user.id, formData.archivo);
        if (!uploadResult.success) {
          console.error('Error subiendo comprobante:', uploadResult.error);
          // No bloqueamos el registro por esto, pero lo registramos
        }
      }

      // 3. Mostrar mensaje de éxito
      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 3000);

    } catch (err) {
      setError('Error inesperado. Por favor intenta nuevamente.');
      console.error('Error en registro:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card register-card">
        <h2 className="auth-title">Crear Cuenta</h2>
        <p className="auth-subtitle">Regístrate en VecindApp</p>

        {success ? (
          <div className="alert alert-success" role="alert">
            <h4 className="alert-heading">¡Registro exitoso!</h4>
            <p>Tu cuenta ha sido creada correctamente.</p>
            <p className="mb-0">Tu registro está pendiente de aprobación por la Secretaría. Te notificaremos cuando sea aprobado.</p>
            <p className="mt-2"><small>Redirigiendo al login en 3 segundos...</small></p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}
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

          <button type="submit" className="btn btn-primary w-100 mt-3" disabled={loading}>
            {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
          </button>
        </form>
        )}

        {!success && (
          <>
            <div className="auth-divider">
              <span>o</span>
            </div>

            <div className="auth-redirect">
              <p>¿Ya tienes cuenta? <Link href="/login" className="text-decoration-none">Inicia sesión aquí</Link></p>
            </div>

            <div className="auth-back">
              <Link href="/" className="text-decoration-none">← Volver al inicio</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
