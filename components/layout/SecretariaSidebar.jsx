'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function SecretariaSidebar() {
  const pathname = usePathname();

  const isActive = (path) => pathname === path ? 'active' : '';

  return (
    <nav className="sidebar secretaria-sidebar">
      <div className="sidebar-header">
        <span className="secretaria-badge">📝 SECRETARÍA</span>
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
        📋 Ver Solicitudes
      </Link>
      <Link
        href="/secretaria/solicitudes/pendientes"
        className={`nav-link ${isActive('/secretaria/solicitudes/pendientes')}`}
      >
        ⏰ Pendientes
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

      <a href="/" className="nav-link nav-link-secondary">
        🗺️ Ver Mapa Público
      </a>
    </nav>
  );
}
