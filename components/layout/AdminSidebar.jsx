'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { forceLogout } from '@/lib/forceLogout';

export default function AdminSidebar() {
  const pathname = usePathname();
  const { signOut } = useAuth();

  const isActive = (path) => pathname === path ? 'active' : '';

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
    <nav className="sidebar admin-sidebar" style={{
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
        }}>🛡️ ADMIN</span>
      </div>

      <Link
        href="/admin/dashboard"
        className={`nav-link ${isActive('/admin/dashboard')}`}
      >
        📊 Dashboard
      </Link>
      <Link
        href="/admin/solicitudes"
        className={`nav-link ${isActive('/admin/solicitudes')}`}
      >
        📋 Gestionar Solicitudes
      </Link>
      <Link
        href="/admin/usuarios"
        className={`nav-link ${isActive('/admin/usuarios')}`}
      >
        👥 Gestionar Usuarios
      </Link>

      <div className="nav-divider"></div>

      <div className="nav-section-title">Reportes</div>
      <Link
        href="/admin/reportes"
        className={`nav-link ${isActive('/admin/reportes')}`}
      >
        📈 Estadísticas
      </Link>

      <div className="nav-divider"></div>

      <a href="/" className="nav-link nav-link-secondary">
        🗺️ Ver Mapa Público
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
        🚪 Cerrar Sesión
      </button>
    </nav>
  );
}
