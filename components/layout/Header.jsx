'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function Header({ onLoginClick, onRegisterClick, onLogoClick }) {
  const { user, userProfile, signOut } = useAuth();

  const getRolBadge = (rol) => {
    switch (rol) {
      case 'admin':
        return <span className="role-badge admin-badge">🛡️ ADMIN</span>;
      case 'secretaria':
        return <span className="role-badge secretaria-badge">📝 SECRETARÍA</span>;
      case 'vecino':
        return <span className="role-badge vecino-badge">👤 VECINO</span>;
      default:
        return null;
    }
  };

  const getRolDashboard = (rol) => {
    switch (rol) {
      case 'admin':
        return '/admin/dashboard';
      case 'secretaria':
        return '/secretaria/dashboard';
      case 'vecino':
        return '/dashboard';
      default:
        return '/';
    }
  };

  return (
    <header className="main-header" style={{
      background: 'white',
      boxShadow: '0 2px 10px rgba(21, 71, 101, 0.08)',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      padding: '1rem 0'
    }}>
      <div className="header-container" style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '0 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '2rem'
      }}>
        {/* Sección izquierda: Logo y nombre */}
        <div className="header-left" style={{ flexShrink: 0 }}>
          <Link href={user ? getRolDashboard(userProfile?.rol) : '/'} className="logo-container">
            <img src="/logo.png" alt="VecindApp Logo" className="logo-image" />
            <div className="brand-info">
              <h1 className="brand-name">VecindApp</h1>
              <p className="brand-tagline">Plataforma Vecinal</p>
            </div>
          </Link>
        </div>

        {/* Sección derecha: Botones de acción o info de usuario */}
        <div className="header-right" style={{ flexShrink: 0 }}>
          {user && userProfile ? (
            <div className="user-menu" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}>
              {getRolBadge(userProfile.rol)}
              <div className="user-info">
                <span className="user-name">{userProfile.nombres} {userProfile.apellidos}</span>
                <span className="user-email">{user.email}</span>
              </div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={signOut}
              >
                Cerrar Sesión
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <button
                className="btn btn-secondary"
                onClick={onLoginClick}
              >
                <span className="btn-icon">→</span>
                Iniciar Sesión
              </button>
              <button
                className="btn btn-primary"
                onClick={onRegisterClick}
              >
                <span className="btn-icon">+</span>
                Registrarse
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
