'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (path) => pathname === path ? 'active' : '';

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
    </nav>
  );
}
