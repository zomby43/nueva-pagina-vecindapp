'use client';

import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

export default function PendienteAprobacionPage() {
  const { user, signOut } = useAuth();

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #d8e7eb 0%, #b8d4e0 100%)',
      padding: '2rem'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '3rem',
        maxWidth: '600px',
        width: '100%',
        boxShadow: '0 10px 40px rgba(21, 71, 101, 0.15)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '4rem' }}>⏳</div>
          <h2 style={{
            color: '#154765',
            fontSize: '1.75rem',
            fontWeight: '600',
            marginTop: '1rem'
          }}>
            Registro Pendiente de Aprobación
          </h2>
        </div>

        <div style={{
          background: '#d1ecf1',
          border: '1px solid #bee5eb',
          borderRadius: '8px',
          padding: '1.5rem',
          marginBottom: '2rem'
        }}>
          <h4 style={{ color: '#0c5460', fontSize: '1.25rem', marginBottom: '1rem' }}>
            ¡Gracias por registrarte!
          </h4>
          <p style={{ color: '#0c5460', marginBottom: '1rem' }}>
            Tu cuenta ha sido creada exitosamente, pero está pendiente de aprobación por parte de la Secretaría de la Junta de Vecinos.
          </p>
          <hr style={{ margin: '1rem 0', borderTop: '1px solid #bee5eb' }} />
          <p style={{ color: '#0c5460', fontWeight: '600', marginBottom: '0.5rem' }}>
            ¿Qué sigue?
          </p>
          <ul style={{ color: '#0c5460', paddingLeft: '1.5rem', marginTop: '1rem' }}>
            <li style={{ marginBottom: '0.5rem' }}>La Secretaría revisará tu solicitud y verificará tu comprobante de residencia</li>
            <li style={{ marginBottom: '0.5rem' }}>Recibirás una notificación por correo electrónico cuando tu cuenta sea aprobada</li>
            <li>Una vez aprobada, podrás acceder a todas las funciones de la plataforma</li>
          </ul>
        </div>

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <p style={{ color: '#6c757d', marginBottom: '1rem', fontSize: '0.875rem' }}>
            Usuario: {user?.email}
          </p>
          <button
            onClick={signOut}
            style={{
              background: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '0.75rem 2rem',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
            onMouseOver={(e) => e.target.style.background = '#5a6268'}
            onMouseOut={(e) => e.target.style.background = '#6c757d'}
          >
            Cerrar Sesión
          </button>
        </div>

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <Link href="/" style={{
            color: '#4ca1af',
            textDecoration: 'none',
            fontSize: '0.95rem'
          }}>
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
