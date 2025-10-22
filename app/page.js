'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <img src="/vencinapp.svg" alt="VecindApp Logo" className="hero-logo" />
          <h1 className="hero-title">Bienvenido a VecindApp</h1>
          <p className="hero-subtitle">
            Tu plataforma vecinal para gestionar certificados de residencia y más
          </p>
          <div className="hero-actions">
            <Link href="/login" className="btn btn-primary btn-lg">
              Iniciar Sesión
            </Link>
            <Link href="/register" className="btn btn-secondary btn-lg">
              Registrarse
            </Link>
          </div>
        </div>
      </section>

      {/* Mapa de Unidades Vecinales */}
      <section className="map-section">
        <div className="map-header">
          <h2>Explora tu Vecindario</h2>
          <p>Visualiza tu ubicación y conoce tu comunidad</p>
        </div>
        <div className="map-container">
          <img
            src="https://providencia.cl/provi/site/artic/20191112/imag/foto_0000000120191112153536/unidades_vecinales.png"
            alt="Mapa de Unidades Vecinales de Providencia"
            className="map-image"
          />
        </div>
      </section>

      {/* Características */}
      <section className="features-section">
        <h2>¿Qué puedes hacer en VecindApp?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📋</div>
            <h3>Solicitar Certificados</h3>
            <p>Solicita certificados de residencia de forma rápida y sencilla</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Seguimiento en Tiempo Real</h3>
            <p>Monitorea el estado de tus solicitudes en todo momento</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3>Notificaciones</h3>
            <p>Recibe actualizaciones por email sobre tus trámites</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🗺️</div>
            <h3>Mapa Interactivo</h3>
            <p>Visualiza información de tu vecindario</p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="cta-section">
        <h2>¿Listo para comenzar?</h2>
        <p>Únete a nuestra comunidad y gestiona tus trámites vecinales de forma digital</p>
        <Link href="/register" className="btn btn-primary btn-lg">
          Crear Cuenta Gratis
        </Link>
      </section>
    </div>
  );
}
