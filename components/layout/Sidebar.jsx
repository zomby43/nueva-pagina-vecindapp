'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { forceLogout } from '@/lib/forceLogout';
import { useSoftLogout } from '@/hooks/useSoftLogout';

export default function Sidebar({ isOpen = true, onClose }) {
  const pathname = usePathname();
  const { signOut } = useAuth();
  const softLogout = useSoftLogout();

  const isActive = (path) => pathname === path ? 'active' : '';

  // Close sidebar on link click (mobile only)
  const handleLinkClick = () => {
    if (onClose && typeof window !== 'undefined' && window.innerWidth < 992) {
      onClose();
    }
  };

  const handleSignOut = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🔘 Botón de cerrar sesión presionado');

    try {
      // Intentar logout suave primero (mantiene estilos)
      await softLogout();
    } catch (error) {
      console.warn('⚠️ Logout suave falló, intentando AuthContext signOut');
      if (signOut && typeof signOut === 'function') {
        await signOut();
      } else {
        console.warn('⚠️ signOut no disponible, usando logout de emergencia');
        forceLogout();
      }
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && onClose && (
        <div
          className="sidebar-overlay d-lg-none"
          onClick={onClose}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1040,
            display: isOpen ? 'block' : 'none'
          }}
        />
      )}

      <nav className={`sidebar ${isOpen ? 'sidebar-open' : ''}`} style={{
        background: '#f4f8f9',
        borderRadius: '16px',
        padding: '1.5rem',
        boxShadow: '0 2px 8px rgba(21, 71, 101, 0.06)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem'
      }}>
        <Link
          href="/dashboard"
          className={`nav-link ${isActive('/dashboard')}`}
          onClick={handleLinkClick}
        >
          <i className="bi bi-speedometer2 me-2"></i>Dashboard
        </Link>
      <Link
        href="/solicitudes"
        className={`nav-link ${isActive('/solicitudes')}`}
        onClick={handleLinkClick}
      >
        <i className="bi bi-file-text me-2"></i>Mis Solicitudes
      </Link>
      <Link
        href="/solicitudes/nueva"
        className={`nav-link ${isActive('/solicitudes/nueva')}`}
        onClick={handleLinkClick}
      >
        <i className="bi bi-plus-circle me-2"></i>Nueva Solicitud
      </Link>
      <Link
        href="/perfil"
        className={`nav-link ${isActive('/perfil')}`}
        onClick={handleLinkClick}
      >
        <i className="bi bi-person me-2"></i>Mi Perfil
      </Link>
      <div className="nav-divider"></div>
      <Link
        href="/avisos"
        className={`nav-link ${isActive('/avisos')}`}
        onClick={handleLinkClick}
      >
        <i className="bi bi-megaphone me-2"></i>Avisos
      </Link>
      <Link
        href="/noticias"
        className={`nav-link ${isActive('/noticias')}`}
        onClick={handleLinkClick}
      >
        <i className="bi bi-newspaper me-2"></i>Noticias
      </Link>
      <Link
        href="/proyectos"
        className={`nav-link ${pathname?.startsWith('/proyectos') ? 'active' : ''}`}
        onClick={handleLinkClick}
      >
        <i className="bi bi-building me-2"></i>Proyectos Vecinales
      </Link>
      <Link
        href="/actividades"
        className={`nav-link ${pathname?.startsWith('/actividades') ? 'active' : ''}`}
        onClick={handleLinkClick}
        suppressHydrationWarning
      >
        <i className="bi bi-calendar-event me-2"></i>Actividades Vecinales
      </Link>
      <Link
        href="/reservas"
        className={`nav-link ${pathname?.startsWith('/reservas') ? 'active' : ''}`}
        onClick={handleLinkClick}
        suppressHydrationWarning
      >
        <i className="bi bi-house-door me-2"></i>Reservar Espacios
      </Link>
      <Link
        href="/mapa"
        className={`nav-link nav-link-secondary ${isActive('/mapa')}`}
        onClick={handleLinkClick}
      >
        <i className="bi bi-map me-2"></i>Ver Mapa
      </Link>
      <button
        type="button"
        onClick={handleSignOut}
        className="nav-link nav-link-danger"
        style={{
          background: 'none',
          border: 'none',
          textAlign: 'left',
          width: '100%',
          color: '#dc3545',
          cursor: 'pointer'
        }}
      >
        <i className="bi bi-box-arrow-right me-2"></i>Cerrar Sesión
      </button>
      </nav>
    </>
  );
}
