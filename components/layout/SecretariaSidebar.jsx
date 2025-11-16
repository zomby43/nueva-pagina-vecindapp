'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { forceLogout } from '@/lib/forceLogout';
import { useSoftLogout } from '@/hooks/useSoftLogout';

export default function SecretariaSidebar({ isOpen = true, onClose }) {
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
    console.log('🔘 Botón de cerrar sesión presionado - Secretaria');

    try {
      // Intentar logout suave primero (mantiene estilos)
      await softLogout();
    } catch (error) {
      console.warn('⚠️ Logout suave falló para Secretaria, intentando AuthContext signOut');
      if (signOut && typeof signOut === 'function') {
        await signOut();
      } else {
        console.warn('⚠️ signOut no disponible para Secretaria, usando logout de emergencia');
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

      <nav className={`sidebar secretaria-sidebar ${isOpen ? 'sidebar-open' : ''}`} style={{
        background: '#f4f8f9',
        borderRadius: '16px',
        padding: '1.5rem',
        boxShadow: '0 2px 8px rgba(21, 71, 101, 0.06)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem'
      }}>
        <div className="sidebar-header" style={{
          marginBottom: '1rem',
          paddingBottom: '1rem',
          borderBottom: '2px solid #bfd3d9'
        }}>
          <span className="secretaria-badge" style={{
            background: 'linear-gradient(135deg, #439fa4 0%, #2d7a7f 100%)',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '20px',
            fontSize: '0.9rem',
            fontWeight: 600,
            display: 'inline-block',
            boxShadow: '0 2px 8px rgba(67, 159, 164, 0.3)'
          }}>
            <i className="bi bi-pencil-square me-2"></i>SECRETARÍA
          </span>
        </div>

        <Link
          href="/secretaria/dashboard"
          className={`nav-link ${isActive('/secretaria/dashboard')}`}
          onClick={handleLinkClick}
        >
          <i className="bi bi-speedometer2 me-2"></i>Dashboard
        </Link>

      <div className="nav-divider"></div>

      <div className="nav-section-title">Gestión de Solicitudes</div>
      <Link
        href="/secretaria/solicitudes"
        className={`nav-link ${isActive('/secretaria/solicitudes')}`}
        onClick={handleLinkClick}
      >
        <i className="bi bi-clipboard-check me-2"></i>Gestionar Solicitudes
      </Link>

      <div className="nav-divider"></div>

      <div className="nav-section-title">Gestión de Vecinos</div>
      <Link
        href="/secretaria/vecinos"
        className={`nav-link ${isActive('/secretaria/vecinos')}`}
        onClick={handleLinkClick}
      >
        <i className="bi bi-people me-2"></i>Ver Vecinos
      </Link>
      <Link
        href="/secretaria/vecinos/aprobaciones"
        className={`nav-link ${isActive('/secretaria/vecinos/aprobaciones')}`}
        onClick={handleLinkClick}
      >
        <i className="bi bi-person-check me-2"></i>Aprobar Registros
      </Link>

      <div className="nav-divider"></div>

      <div className="nav-section-title">Certificados</div>
      <Link
        href="/secretaria/certificados"
        className={`nav-link ${isActive('/secretaria/certificados')}`}
        onClick={handleLinkClick}
      >
        <i className="bi bi-file-earmark-text me-2"></i>Emitir Certificado
      </Link>

      <div className="nav-divider"></div>

      <div className="nav-section-title">Proyectos Vecinales</div>
      <Link
        href="/secretaria/proyectos"
        className={`nav-link ${pathname?.startsWith('/secretaria/proyectos') && pathname !== '/secretaria/proyectos/pendientes' ? 'active' : ''}`}
        onClick={handleLinkClick}
      >
        <i className="bi bi-building me-2"></i>Gestionar Proyectos
      </Link>
      <Link
        href="/secretaria/proyectos/pendientes"
        className={`nav-link ${isActive('/secretaria/proyectos/pendientes')}`}
        onClick={handleLinkClick}
      >
        <i className="bi bi-hourglass-split me-2"></i>Proyectos Pendientes
      </Link>

      <div className="nav-divider"></div>

      <div className="nav-section-title">Actividades Vecinales</div>
      <Link
        href="/secretaria/actividades"
        className={`nav-link ${pathname?.startsWith('/secretaria/actividades') ? 'active' : ''}`}
        onClick={handleLinkClick}
      >
        <i className="bi bi-calendar-event me-2"></i>Gestionar Actividades
      </Link>

      <div className="nav-divider"></div>

      <div className="nav-section-title">Reservas de Espacios</div>
      <Link
        href="/secretaria/reservas"
        className={`nav-link ${pathname?.startsWith('/secretaria/reservas') && pathname !== '/secretaria/reservas/pendientes' ? 'active' : ''}`}
        onClick={handleLinkClick}
      >
        <i className="bi bi-house-door me-2"></i>Gestionar Reservas
      </Link>
      <Link
        href="/secretaria/reservas/pendientes"
        className={`nav-link ${isActive('/secretaria/reservas/pendientes')}`}
        onClick={handleLinkClick}
      >
        <i className="bi bi-clock-history me-2"></i>Reservas Pendientes
      </Link>
      <Link
        href="/secretaria/espacios"
        className={`nav-link ${isActive('/secretaria/espacios')}`}
        onClick={handleLinkClick}
      >
        <i className="bi bi-gear me-2"></i>Administrar Espacios
      </Link>

      <div className="nav-divider"></div>

      <div className="nav-section-title">Comunicación</div>
      <Link
        href="/secretaria/avisos"
        className={`nav-link ${isActive('/secretaria/avisos')}`}
        onClick={handleLinkClick}
      >
        <i className="bi bi-megaphone me-2"></i>Avisos
      </Link>
      <Link
        href="/secretaria/noticias"
        className={`nav-link ${isActive('/secretaria/noticias')}`}
        onClick={handleLinkClick}
      >
        <i className="bi bi-newspaper me-2"></i>Noticias
      </Link>

      <div className="nav-divider"></div>

      <div className="nav-section-title">Finanzas</div>
      <Link
        href="/secretaria/finanzas"
        className={`nav-link ${pathname?.startsWith('/secretaria/finanzas') && pathname !== '/secretaria/finanzas/transacciones' ? 'active' : ''}`}
        onClick={handleLinkClick}
      >
        <i className="bi bi-cash-stack me-2"></i>Dashboard Financiero
      </Link>
      <Link
        href="/secretaria/finanzas/transacciones"
        className={`nav-link ${pathname?.startsWith('/secretaria/finanzas/transacciones') ? 'active' : ''}`}
        onClick={handleLinkClick}
      >
        <i className="bi bi-list-ul me-2"></i>Transacciones
      </Link>

      <div className="nav-divider"></div>

      <div className="nav-section-title">Configuración</div>
      <Link
        href="/secretaria/configuracion"
        className={`nav-link ${isActive('/secretaria/configuracion')}`}
        onClick={handleLinkClick}
      >
        <i className="bi bi-sliders me-2"></i>Configuración
      </Link>

      <Link
        href="/secretaria/directiva"
        className={`nav-link ${isActive('/secretaria/directiva')}`}
        onClick={handleLinkClick}
      >
        <i className="bi bi-people me-2"></i>Gestión Directiva
      </Link>

      <div className="nav-divider"></div>

      <a href="/" className="nav-link nav-link-secondary" onClick={handleLinkClick}>
        <i className="bi bi-map me-2"></i>Ver Mapa Público
      </a>
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
