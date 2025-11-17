'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const supabase = createClient();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError('Por favor ingresa un email válido');
        setLoading(false);
        return;
      }

      // Enviar email de recuperación
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) {
        throw resetError;
      }

      setSuccess(true);
    } catch (err) {
      console.error('Error al solicitar recuperación:', err);
      setError('Hubo un error al enviar el email. Por favor intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-container">
        <div className="auth-card text-center">
          <div className="mb-4">
            <i className="bi bi-envelope-check" style={{ fontSize: '3rem', color: 'var(--ok)' }}></i>
          </div>
          <h2 className="auth-title">Email Enviado</h2>
          <p className="auth-subtitle">
            Si existe una cuenta con el email <strong>{email}</strong>,
            recibirás un correo con instrucciones para restablecer tu contraseña.
          </p>
          <p className="text-muted mb-4">
            Por favor revisa tu bandeja de entrada y spam.
          </p>
          <Link href="/login" className="btn btn-primary w-100">
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Recuperar Contraseña</h2>
        <p className="auth-subtitle">
          Ingresa tu email y te enviaremos instrucciones para restablecer tu contraseña
        </p>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="mb-4">
            <label htmlFor="email" className="form-label">
              Email <span className="text-danger">*</span>
            </label>
            <input
              type="email"
              className="form-control"
              id="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Enviando...
              </>
            ) : (
              'Enviar Email de Recuperación'
            )}
          </button>
        </form>

        <div className="auth-divider">
          <span>o</span>
        </div>

        <div className="auth-back">
          <Link href="/login" className="text-decoration-none">
            ← Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
