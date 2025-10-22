'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { forceLogout } from '@/lib/forceLogout';
import { useSoftLogout } from '@/hooks/useSoftLogout';

export default function Sidebar() {
  const pathname = usePathname();
  const { signOut } = useAuth();
  const softLogout = useSoftLogout();

  const isActive = (path) => pathname === path ? 'active' : '';

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
    <nav className="sidebar">
      <Link
        href="/dashboard"
        className={`nav-link ${isActive('/dashboard')}`}
      >
        📊 Dashboard
      </Link>
      <Link
        href="/solicitudes"
        className={`nav-link ${isActive('/solicitudes')}`}
      >
        📝 Mis Solicitudes
      </Link>
      <Link
        href="/solicitudes/nueva"
        className={`nav-link ${isActive('/solicitudes/nueva')}`}
      >
        ➕ Nueva Solicitud
      </Link>
      <Link
        href="/perfil"
        className={`nav-link ${isActive('/perfil')}`}
      >
        👤 Mi Perfil
      </Link>
      <div className="nav-divider"></div>
      <Link
        href="/mapa"
        className={`nav-link nav-link-secondary ${isActive('/mapa')}`}
      >
        🗺️ Ver Mapa
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
        🚪 Cerrar Sesión
      </button>
    </nav>
  );
}
