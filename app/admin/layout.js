'use client';

import "../globals.css";
import AdminSidebar from "@/components/layout/AdminSidebar";

export default function AdminLayout({ children }) {
  return (
    <div className="app-layout admin-layout">
      {/* Header para administradores */}
      <header className="main-header admin-header">
        <div className="header-container">
          <div className="header-left">
            <div className="logo-container">
              <img src="/vencinapp.svg" alt="VecindApp Logo" className="logo-image" />
              <div className="brand-info">
                <h1 className="brand-name">VecindApp Admin</h1>
                <p className="brand-tagline">Panel de Administración</p>
              </div>
            </div>
          </div>

          <div className="header-right">
            <div className="user-menu">
              <span className="admin-badge-small">🛡️ ADMIN</span>
              <span className="user-name">Administrador</span>
              <button className="btn btn-secondary btn-sm">
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container">
        {/* Menú lateral admin */}
        <aside>
          <AdminSidebar />
        </aside>

        {/* Contenido principal */}
        <main>{children}</main>
      </div>
    </div>
  );
}
