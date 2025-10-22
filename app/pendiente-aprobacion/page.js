'use client';

import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

export default function PendienteAprobacionPage() {
  const { user, signOut } = useAuth();

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="text-center mb-4">
          <div style={{ fontSize: '4rem' }}>⏳</div>
          <h2 className="auth-title">Registro Pendiente de Aprobación</h2>
        </div>

        <div className="alert alert-info">
          <h4 className="alert-heading">¡Gracias por registrarte!</h4>
          <p>Tu cuenta ha sido creada exitosamente, pero está pendiente de aprobación por parte de la Secretaría de la Junta de Vecinos.</p>
          <hr />
          <p className="mb-0">
            <strong>¿Qué sigue?</strong>
          </p>
          <ul className="mt-2">
            <li>La Secretaría revisará tu solicitud y verificará tu comprobante de residencia</li>
            <li>Recibirás una notificación por correo electrónico cuando tu cuenta sea aprobada</li>
            <li>Una vez aprobada, podrás acceder a todas las funciones de la plataforma</li>
          </ul>
        </div>

        <div className="mt-4 text-center">
          <p className="text-muted mb-3">
            <small>Usuario: {user?.email}</small>
          </p>
          <button
            onClick={signOut}
            className="btn btn-secondary"
          >
            Cerrar Sesión
          </button>
        </div>

        <div className="auth-back mt-4">
          <Link href="/" className="text-decoration-none">← Volver al inicio</Link>
        </div>
      </div>
    </div>
  );
}
