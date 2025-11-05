'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { forceLogout } from '@/lib/forceLogout';
import { useSoftLogout } from '@/hooks/useSoftLogout';

export default function Header({
  onLoginClick,
  onRegisterClick,
  onLogoClick,
  onToggleSidebar,
  className = '',
  initialUser = null,
  initialProfile = null,
}) {
  const { user, userProfile, loading, signOut } = useAuth();
  const softLogout = useSoftLogout();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    closeMobileMenu();

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

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => {
      if (window.innerWidth >= 992) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleMobileMenu = () => setMobileMenuOpen((prev) => !prev);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  useEffect(() => {
    if (!displayUser) {
      setMobileMenuOpen(false);
    }
  }, [displayUser]);

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
        {/* Hamburger menu button - only visible on mobile when user is logged in */}
        {displayUser && onToggleSidebar && (
          <button
            className="sidebar-toggle-btn d-lg-none"
            onClick={onToggleSidebar}
            style={{
              background: 'none',
              border: 'none',
              padding: '0.5rem',
              cursor: 'pointer',
              color: '#154765',
              fontSize: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            aria-label="Toggle sidebar"
          >
            <i className="bi bi-list"></i>
          </button>
        )}

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
        <div className="header-right">
          {isLoading ? (
            <div style={{ padding: '0.5rem 1rem' }}>
              <span style={{ color: '#6c757d' }}>Cargando...</span>
            </div>
          ) : displayUser && displayProfile ? (
            <>
              <div className="user-menu">
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
              <div className="mobile-user-action d-lg-none">
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  aria-expanded={mobileMenuOpen ? 'true' : 'false'}
                  aria-controls="mobile-user-menu"
                  onClick={toggleMobileMenu}
                >
                  <i className={`bi ${mobileMenuOpen ? 'bi-x-lg' : 'bi-person-circle'}`}></i>
                </button>
              </div>
            </>
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

      {displayUser && displayProfile && (
        <div
          id="mobile-user-menu"
          className={`mobile-user-menu d-lg-none ${mobileMenuOpen ? 'open' : ''}`}
        >
          <div className="mobile-user-details">
            {getRolBadge(displayProfile.rol)}
            <div className="mobile-user-text">
              <span className="mobile-user-name">{displayProfile.nombres} {displayProfile.apellidos}</span>
              <span className="mobile-user-email">{displayUser.email}</span>
            </div>
          </div>
          <div className="mobile-user-actions">
            <Link
              href={getRolDashboard(displayProfile.rol)}
              className="btn btn-outline-primary w-100"
              onClick={closeMobileMenu}
            >
              Ir al panel principal
            </Link>
            <button
              type="button"
              className="btn btn-secondary w-100"
              onClick={handleSignOut}
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
