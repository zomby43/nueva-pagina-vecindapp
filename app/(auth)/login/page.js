'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const router = useRouter();
  const { signIn } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(''); // Limpiar error al escribir
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn(formData.email, formData.password);

      if (result.success) {
        // Redirigir al dashboard correspondiente según el rol
        // El AuthContext ya cargó el perfil del usuario
        router.push('/dashboard'); // El middleware redirigirá según el rol
      } else {
        setError(result.error || 'Error al iniciar sesión. Verifica tus credenciales.');
      }
    } catch (err) {
      setError('Error inesperado. Por favor intenta nuevamente.');
      console.error('Error en login:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Iniciar Sesión</h2>
        <p className="auth-subtitle">Accede a tu cuenta de VecindApp</p>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          <div className="mb-3">
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
              disabled={loading}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="password" className="form-label">Contraseña *</label>
            <div className="input-group">
              <input
                type={showPassword ? "text" : "password"}
                className="form-control"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Ingresa tu contraseña"
                required
                disabled={loading}
              />
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          </div>

          <div className="mb-3">
            <Link href="/recuperar-password" className="text-primary text-decoration-none">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <button type="submit" className="btn btn-primary w-100 mb-3" disabled={loading}>
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="auth-divider">
          <span>o</span>
        </div>

        <div className="auth-redirect">
          <p>¿No tienes cuenta? <Link href="/register" className="text-decoration-none">Regístrate aquí</Link></p>
        </div>

        <div className="auth-back">
          <Link href="/" className="text-decoration-none">← Volver al inicio</Link>
        </div>
      </div>
    </div>
  );
}
