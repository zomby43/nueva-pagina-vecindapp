'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { forceLogout } from '@/lib/forceLogout';

export default function AdminSidebar({ isOpen = true, onClose }) {
  const pathname = usePathname();
  const { signOut } = useAuth();

  const isActive = (path) => pathname === path ? 'active' : '';

  // Close sidebar on link click (mobile only)
  const handleLinkClick = () => {
    if (onClose && typeof window !== 'undefined' && window.innerWidth < 992) {
      onClose();
    }
  };

  const handleSignOut = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🔘 Botón de cerrar sesión presionado - Admin');

    if (signOut && typeof signOut === 'function') {
      signOut();
    } else {
      console.warn('⚠️ signOut no disponible para Admin, usando logout de emergencia');
      forceLogout();
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

      <nav className={`sidebar admin-sidebar ${isOpen ? 'sidebar-open' : ''}`} style={{
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
          <span className="admin-badge" style={{
            background: '#154765',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '20px',
            fontSize: '0.9rem',
            fontWeight: 600,
            display: 'inline-block'
          }}>
            <i className="bi bi-shield-check me-2"></i>ADMIN
          </span>
        </div>

        <Link
          href="/admin/dashboard"
          className={`nav-link ${isActive('/admin/dashboard')}`}
          onClick={handleLinkClick}
        >
          <i className="bi bi-speedometer2 me-2"></i>Dashboard
        </Link>
        <Link
          href="/admin/solicitudes"
          className={`nav-link ${isActive('/admin/solicitudes')}`}
          onClick={handleLinkClick}
        >
          <i className="bi bi-clipboard-check me-2"></i>Gestionar Solicitudes
        </Link>
        <Link
          href="/admin/usuarios"
          className={`nav-link ${isActive('/admin/usuarios')}`}
          onClick={handleLinkClick}
        >
          <i className="bi bi-people me-2"></i>Gestionar Usuarios
        </Link>

        <div className="nav-divider"></div>

        <div className="nav-section-title">Sistema</div>
        <Link
          href="/admin/roles"
          className={`nav-link ${isActive('/admin/roles')}`}
          onClick={handleLinkClick}
        >
          <i className="bi bi-shield-lock me-2"></i>Roles y Permisos
        </Link>
        <Link
          href="/admin/logs"
          className={`nav-link ${isActive('/admin/logs')}`}
          onClick={handleLinkClick}
        >
          <i className="bi bi-file-text me-2"></i>Logs de Actividad
        </Link>
        <Link
          href="/admin/configuracion"
          className={`nav-link ${isActive('/admin/configuracion')}`}
          onClick={handleLinkClick}
        >
          <i className="bi bi-gear me-2"></i>Configuración
        </Link>

        <div className="nav-divider"></div>

        <div className="nav-section-title">Reportes</div>
        <Link
          href="/admin/reportes"
          className={`nav-link ${isActive('/admin/reportes')}`}
          onClick={handleLinkClick}
        >
          <i className="bi bi-graph-up me-2"></i>Estadísticas
        </Link>

        <div className="nav-divider"></div>

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
