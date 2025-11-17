'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [userEmail, setUserEmail] = useState('');
  const router = useRouter();
  const supabase = createClient();
  const searchParams = useSearchParams();
  const recoveryCode = searchParams?.get('code') || null;
  const hasExchangedCodeRef = useRef(false);

  useEffect(() => {
    let isMounted = true;
    let pendingTimeout = null;

    const setSessionFromUser = (sessionUser) => {
      if (!isMounted) return;
      setIsValidSession(true);
      setError('');
      setUserEmail(sessionUser?.email ?? '');
      setCheckingSession(false);
    };

    const markInvalidSession = (message) => {
      if (!isMounted) return;
      setIsValidSession(false);
      setError(message || 'No se pudo validar el enlace de recuperación.');
      setCheckingSession(false);
    };

    const reloadWithoutCode = () => {
      try {
        if (typeof window === 'undefined') return;
        const currentUrl = new URL(window.location.href);
        if (!currentUrl.searchParams.has('code')) return;
        currentUrl.searchParams.delete('code');
        hasExchangedCodeRef.current = true;
        window.location.replace(currentUrl.toString());
      } catch (reloadError) {
        console.warn('No se pudo refrescar la página sin el código:', reloadError);
      }
    };

    const initializeRecoverySession = async () => {
      setCheckingSession(true);
      try {
        const code = recoveryCode;

        if (code && !hasExchangedCodeRef.current) {
          // Cuando el enlace viene con código (PKCE) hay que intercambiarlo por una sesión válida
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);

          if (error) {
            throw new Error(error.message || 'El enlace de recuperación es inválido o expiró.');
          }

          const sessionUser = data?.user || data?.session?.user;
          if (!sessionUser) {
            throw new Error('No se pudo validar la sesión de recuperación. Solicita un nuevo enlace.');
          }

          setSessionFromUser(sessionUser);
          hasExchangedCodeRef.current = true;
          reloadWithoutCode();
          return;
        }

        // Compatibilidad: intentar usar una sesión que ya exista
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          throw error;
        }

        if (session?.user) {
          setSessionFromUser(session.user);
          hasExchangedCodeRef.current = true;
          return;
        }

        // Si aún no hay sesión, esperar evento de Supabase por unos segundos antes de mostrar error
        if (pendingTimeout) {
          clearTimeout(pendingTimeout);
        }

        pendingTimeout = setTimeout(() => {
          markInvalidSession('Sesión inválida. Solicita un nuevo enlace de recuperación.');
        }, 5000);
      } catch (sessionError) {
        console.error('Error verificando sesión de recuperación:', sessionError);
        markInvalidSession(sessionError?.message || 'No se pudo validar el enlace de recuperación.');
      }
    };

    initializeRecoverySession();

    // Escuchar eventos de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session);

      if (!isMounted) {
        return;
      }

      if (session?.user) {
        if (pendingTimeout) {
          clearTimeout(pendingTimeout);
          pendingTimeout = null;
        }
        setIsValidSession(true);
        setError('');
        setUserEmail(session.user.email ?? '');
        setCheckingSession(false);
        return;
      }

      if (event === 'SIGNED_OUT') {
        if (pendingTimeout) {
          clearTimeout(pendingTimeout);
          pendingTimeout = null;
        }
        setCheckingSession(false);
        setIsValidSession(false);
      }
    });

    return () => {
      isMounted = false;
      if (pendingTimeout) {
        clearTimeout(pendingTimeout);
      }
      subscription.unsubscribe();
    };
  }, [supabase, recoveryCode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validar contraseñas
      if (password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres');
        setLoading(false);
        return;
      }

      if (password !== confirmPassword) {
        setError('Las contraseñas no coinciden');
        setLoading(false);
        return;
      }

      // Verificar que hay un usuario en la sesión actual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Sesión inválida. Por favor solicita un nuevo enlace de recuperación.');
        setLoading(false);
        return;
      }

      console.log('Actualizando contraseña para usuario:', user.email);

      // Usar endpoint interno con Service Role para evitar bloqueos del cliente
      console.log('Llamando a /api/reset-password con service role...');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, 15000); // 15 segundos

      let response;
      try {
        response = await fetch('/api/reset-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.id,
            password,
          }),
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timeoutId);
      }

      console.log('Respuesta recibida de /api/reset-password:', response.status);

      const result = await response.json().catch(() => ({}));
      console.log('Payload de respuesta /api/reset-password:', result);

      if (!response.ok || !result?.success) {
        console.error('API reset-password error:', result);
        throw new Error(result?.error || 'No se pudo actualizar la contraseña.');
      }

      console.log('Contraseña actualizada exitosamente mediante API');

      // Registrar actividad en la tabla de logs
      try {
        console.log('Registrando actividad de password_reset...');
        await supabase.from('logs_actividad').insert({
          usuario_id: user.id,
          tipo_accion: 'password_reset',
          detalles: {
            timestamp: new Date().toISOString(),
            email: user.email
          }
        });
        console.log('Log de password_reset registrado.');
      } catch (logError) {
        console.error('Error al registrar actividad:', logError);
        // No detenemos el flujo si falla el log
      }

      // Esperar un poco antes de cerrar sesión para asegurar que la actualización se completó
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Cerrar sesión
      console.log('Cerrando sesión...');
      await supabase.auth.signOut();
      console.log('Sesión cerrada correctamente.');

      setSuccess(true);

      // Redirigir al login después de 2 segundos
      setTimeout(() => {
        router.push('/login');
      }, 2000);

    } catch (err) {
      console.error('Error al actualizar contraseña:', err);

      // Mostrar mensaje de error más específico
      let errorMessage = 'Hubo un error al actualizar la contraseña. Por favor intenta nuevamente.';

      if (err?.name === 'AbortError') {
        errorMessage = 'La solicitud está tardando demasiado. Revisa tu conexión e intenta otra vez.';
      } else if (err?.message) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-container">
        <div className="auth-card text-center">
          <div className="mb-4">
            <i className="bi bi-check-circle" style={{ fontSize: '3rem', color: 'var(--ok)' }}></i>
          </div>
          <h2 className="auth-title">Contraseña Actualizada</h2>
          <p className="auth-subtitle">
            Tu contraseña ha sido actualizada exitosamente.
          </p>
          <p className="text-muted mb-4">
            Serás redirigido al inicio de sesión en unos segundos...
          </p>
          <Link href="/login" className="btn btn-primary w-100">
            Ir al inicio de sesión
          </Link>
        </div>
      </div>
    );
  }

  if (checkingSession) {
    return (
      <div className="auth-container">
        <div className="auth-card text-center">
          <div className="mb-4">
            <span className="spinner-border" role="status" aria-hidden="true"></span>
          </div>
          <h2 className="auth-title">Validando enlace…</h2>
          <p className="auth-subtitle">
            Estamos verificando tu sesión de recuperación. Esto puede tardar unos segundos.
          </p>
        </div>
      </div>
    );
  }

  if (!isValidSession && error) {
    return (
      <div className="auth-container">
        <div className="auth-card text-center">
          <div className="mb-4">
            <i className="bi bi-exclamation-triangle" style={{ fontSize: '3rem', color: 'var(--err)' }}></i>
          </div>
          <h2 className="auth-title">Sesión Inválida</h2>
          <p className="auth-subtitle">{error}</p>
          <div className="d-flex gap-2 justify-content-center">
            <Link href="/forgot-password" className="btn btn-primary">
              Solicitar nuevo enlace
            </Link>
            <Link href="/login" className="btn btn-outline-secondary">
              Volver al login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Restablecer Contraseña</h2>
        <p className="auth-subtitle">
          Ingresa tu nueva contraseña
        </p>

        {userEmail && (
          <div className="alert alert-info mb-3" role="alert">
            <i className="bi bi-person-circle me-2"></i>
            Cambiando contraseña para: <strong>{userEmail}</strong>
          </div>
        )}

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              Nueva Contraseña <span className="text-danger">*</span>
            </label>
            <div className="input-group">
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-control"
                id="password"
              placeholder="Ingresa tu nueva contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading || checkingSession}
              minLength={6}
            />
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => setShowPassword(!showPassword)}
              disabled={loading || checkingSession}
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              <i className={`bi bi-eye${showPassword ? '-slash' : ''}`}></i>
            </button>
            </div>
            <small className="text-muted">Mínimo 6 caracteres</small>
          </div>

          <div className="mb-4">
            <label htmlFor="confirmPassword" className="form-label">
              Confirmar Contraseña <span className="text-danger">*</span>
            </label>
            <div className="input-group">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                className="form-control"
                id="confirmPassword"
              placeholder="Confirma tu nueva contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading || checkingSession}
              minLength={6}
            />
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={loading || checkingSession}
              aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              <i className={`bi bi-eye${showConfirmPassword ? '-slash' : ''}`}></i>
            </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading || !isValidSession || checkingSession}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Actualizando...
              </>
            ) : (
              'Actualizar Contraseña'
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
