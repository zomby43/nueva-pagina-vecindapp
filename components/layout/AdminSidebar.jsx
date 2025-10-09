'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminSidebar() {
  const pathname = usePathname();

  const isActive = (path) => pathname === path ? 'active' : '';

  return (
    <nav className="sidebar admin-sidebar">
      <div className="sidebar-header">
        <span className="admin-badge">🛡️ ADMIN</span>
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
    </nav>
  );
}
