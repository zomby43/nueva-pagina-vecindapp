'use client';

export default function Header({ onLoginClick, onRegisterClick, onLogoClick }) {
  return (
    <header className="main-header">
      <div className="header-container">
        {/* Sección izquierda: Logo y nombre */}
        <div className="header-left">
          <div className="logo-container" onClick={onLogoClick}>
            <img src="/logo.png" alt="VecindApp Logo" className="logo-image" />
            <div className="brand-info">
              <h1 className="brand-name">VecindApp</h1>
              <p className="brand-tagline">Plataforma Vecinal</p>
            </div>
          </div>
        </div>

        {/* Sección derecha: Botones de acción */}
        <div className="header-right">
          <div className="auth-buttons">
            <button
              className="btn btn-secondary"
              onClick={onLoginClick}
            >
              <span className="btn-icon">→</span>
              Iniciar Sesión
            </button>
            <button
              className="btn btn-primary"
              onClick={onRegisterClick}
            >
              <span className="btn-icon">+</span>
              Registrarse
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
