'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { forceLogout } from '@/lib/forceLogout';
import { useSoftLogout } from '@/hooks/useSoftLogout';

export default function Header({
  onLoginClick,
  onRegisterClick,
  onLogoClick,
  className = '',
  initialUser = null,
  initialProfile = null,
}) {
  const { user, userProfile, loading, signOut } = useAuth();
  const softLogout = useSoftLogout();

  const hasContextUser = Boolean(user && userProfile);
  const shouldUseInitial = !hasContextUser && loading && initialUser && initialProfile;
  const displayUser = hasContextUser ? user : shouldUseInitial ? initialUser : null;
  const displayProfile = hasContextUser ? userProfile : shouldUseInitial ? initialProfile : null;
  const isLoading = loading && !displayUser;

  const headerClassName = ['main-header', className].filter(Boolean).join(' ');

  // Funciones de navegación que limpian cache
  const handleLoginClick = () => {
    if (onLoginClick) {
      onLoginClick();
    } else if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  };

  const handleRegisterClick = () => {
    if (onRegisterClick) {
      onRegisterClick();
    } else if (typeof window !== 'undefined') {
      window.location.href = '/register';
    }
  };

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

  const handleSignOut = async (event) => {
    event?.preventDefault?.();
    event?.stopPropagation?.();

    try {
      await softLogout();
    } catch (error) {
      console.warn('Logout suave falló desde Header, intentando AuthContext:', error);
      try {
        if (typeof signOut === 'function') {
          await signOut();
          return;
        }
      } catch (ctxError) {
        console.error('AuthContext signOut falló:', ctxError);
      }
      forceLogout();
    }
  };

  const isAdminHeader = className.includes('admin-header');

  return (
    <header
      className={headerClassName}
      style={{
        background: isAdminHeader ? undefined : 'white',
        boxShadow: '0 2px 10px rgba(21, 71, 101, 0.08)',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        padding: '1rem 0'
      }}
    >
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
          <Link href={displayUser ? getRolDashboard(displayProfile?.rol) : '/'} className="logo-container">
            <img src="/logo.png" alt="VecindApp Logo" className="logo-image" />
            <div className="brand-info">
              <h1 className="brand-name">VecindApp</h1>
              <p className="brand-tagline">Plataforma Vecinal</p>
            </div>
          </Link>
        </div>

        {/* Sección derecha: Botones de acción o info de usuario */}
        <div className="header-right" style={{ flexShrink: 0 }}>
          {isLoading ? (
            <div style={{ padding: '0.5rem 1rem' }}>
              <span style={{ color: '#6c757d' }}>Cargando...</span>
            </div>
          ) : displayUser && displayProfile ? (
            <div className="user-menu" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}>
              {getRolBadge(displayProfile.rol)}
              <div className="user-info">
                <span className="user-name">{displayProfile.nombres} {displayProfile.apellidos}</span>
                <span className="user-email">{displayUser.email}</span>
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleSignOut}
              >
                Cerrar Sesión
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <button
                className="btn btn-secondary"
                onClick={handleLoginClick}
                style={{ cursor: 'pointer' }}
              >
                <span className="btn-icon">→</span>
                Iniciar Sesión
              </button>
              <button
                className="btn btn-primary"
                onClick={handleRegisterClick}
                style={{ cursor: 'pointer' }}
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
