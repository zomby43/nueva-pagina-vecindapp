import "../globals.css";

export default function AuthLayout({ children }) {
  return (
    <div className="auth-layout">
      {/* Header minimalista */}
      <header className="auth-header">
        <div className="auth-header-container">
          <div className="logo-container">
            <img src="/vencinapp.svg" alt="VecindApp Logo" className="logo-image" />
            <div className="brand-info">
              <h1 className="brand-name">VecindApp</h1>
              <p className="brand-tagline">Plataforma Vecinal</p>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido centrado */}
      <main className="auth-main">
        {children}
      </main>

      {/* Footer opcional */}
      <footer className="auth-footer">
        <p>© 2025 VecindApp - Plataforma Vecinal</p>
      </footer>
    </div>
  );
}
