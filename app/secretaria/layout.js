'use client';

import SecretariaSidebar from '@/components/layout/SecretariaSidebar';
import Header from '@/components/layout/Header';
import { useInactivityTimer } from '@/hooks/useInactivityTimer';
import { useAuth } from '@/hooks/useAuth';

// Modal de advertencia de inactividad
function InactivityWarningModal({ timeLeft, onExtend }) {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '2rem',
        maxWidth: '400px',
        width: '90%',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
      }}>
        <h3 style={{ color: '#154765', marginBottom: '1rem', fontSize: '1.5rem' }}>
          ⏰ Sesión por Expirar
        </h3>
        <p style={{ color: '#666', marginBottom: '1.5rem' }}>
          Tu sesión está a punto de expirar por inactividad.
        </p>
        <div style={{
          background: '#fff3cd',
          border: '1px solid #ffc107',
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: '1.5rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#856404' }}>
            {timeLeft}s
          </div>
          <div style={{ color: '#856404', fontSize: '0.875rem' }}>
            hasta cerrar sesión automáticamente
          </div>
        </div>
        <button
          onClick={onExtend}
          style={{
            width: '100%',
            padding: '0.75rem',
            background: '#154765',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'background 0.2s'
          }}
          onMouseOver={(e) => e.target.style.background = '#0f3649'}
          onMouseOut={(e) => e.target.style.background = '#154765'}
        >
          Mantener Sesión Activa
        </button>
      </div>
    </div>
  );
}

export default function SecretariaLayout({ children }) {
  const { signOut } = useAuth();

  // Timer de inactividad: 10 minutos total, advertencia 1 minuto antes
  const { showWarning, timeLeft, extendSession } = useInactivityTimer(
    10 * 60 * 1000, // 10 minutos
    60 * 1000,       // Advertencia 1 minuto antes
    signOut          // Logout al expirar
  );

  return (
    <>
      <div className="layout" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#d8e7eb' }}>
        <Header />
        <div className="layout-container" style={{
          maxWidth: '1400px',
          margin: '2rem auto',
          padding: '0 2rem',
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 280px) minmax(0, 1fr)',
          gap: '2rem',
          flex: 1,
          width: '100%'
        }}>
          <SecretariaSidebar />
          <main className="main-content" style={{ minHeight: '600px' }}>
            {children}
          </main>
        </div>
      </div>

      {/* Modal de advertencia de inactividad */}
      {showWarning && (
        <InactivityWarningModal
          timeLeft={timeLeft}
          onExtend={extendSession}
        />
      )}
    </>
  );
}
