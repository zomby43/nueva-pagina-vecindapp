'use client';

import Sidebar from "./Sidebar";

export default function UserLayout({ children }) {
  return (
    <div className="app-layout">
      {/* Header para usuarios */}
      <header className="main-header">
        <div className="header-container">
          <div className="header-left">
            <div className="logo-container">
              <img src="/vencinapp.svg" alt="VecindApp Logo" className="logo-image" />
              <div className="brand-info">
                <h1 className="brand-name">VecindApp</h1>
                <p className="brand-tagline">Plataforma Vecinal</p>
              </div>
            </div>
          </div>

          <div className="header-right">
            <div className="user-menu">
              <span className="user-name">Usuario</span>
              <button className="btn btn-secondary btn-sm">
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container">
        {/* Menú lateral */}
        <aside>
          <Sidebar />
        </aside>

        {/* Contenido principal */}
        <main>{children}</main>
      </div>
    </div>
  );
}
