'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { forceLogout } from '@/lib/forceLogout';
import { useSoftLogout } from '@/hooks/useSoftLogout';

export default function SecretariaSidebar() {
  const pathname = usePathname();
  const { signOut } = useAuth();
  const softLogout = useSoftLogout();

  const isActive = (path) => pathname === path ? 'active' : '';

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
    <nav className="sidebar secretaria-sidebar" style={{
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
        }}>📝 SECRETARÍA</span>
      </div>

      <Link
        href="/secretaria/dashboard"
        className={`nav-link ${isActive('/secretaria/dashboard')}`}
      >
        📊 Dashboard
      </Link>

      <div className="nav-divider"></div>

      <div className="nav-section-title">Gestión de Solicitudes</div>
      <Link
        href="/secretaria/solicitudes"
        className={`nav-link ${isActive('/secretaria/solicitudes')}`}
      >
        📋 Gestionar Solicitudes
      </Link>

      <div className="nav-divider"></div>

      <div className="nav-section-title">Gestión de Vecinos</div>
      <Link
        href="/secretaria/vecinos"
        className={`nav-link ${isActive('/secretaria/vecinos')}`}
      >
        👥 Ver Vecinos
      </Link>
      <Link
        href="/secretaria/vecinos/aprobaciones"
        className={`nav-link ${isActive('/secretaria/vecinos/aprobaciones')}`}
      >
        ✅ Aprobar Registros
      </Link>

      <div className="nav-divider"></div>

      <div className="nav-section-title">Certificados</div>
      <Link
        href="/secretaria/certificados"
        className={`nav-link ${isActive('/secretaria/certificados')}`}
      >
        📄 Emitir Certificado
      </Link>

      <div className="nav-divider"></div>

      <div className="nav-section-title">Comunicación</div>
      <Link
        href="/secretaria/avisos"
        className={`nav-link ${isActive('/secretaria/avisos')}`}
      >
        📢 Avisos
      </Link>
      <Link
        href="/secretaria/noticias"
        className={`nav-link ${isActive('/secretaria/noticias')}`}
      >
        📰 Noticias
      </Link>

      <div className="nav-divider"></div>

      <div className="nav-section-title">Configuración</div>
      <Link
        href="/secretaria/configuracion"
        className={`nav-link ${isActive('/secretaria/configuracion')}`}
      >
        ⚙️ Configuración
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
