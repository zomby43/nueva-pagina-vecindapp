'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

// Estados considerados "procesadas"
const PROCESSED_STATES = [
  'completado', 'completada',
  'aprobado', 'aprobada',
  'emitido', 'emitida',
  'rechazado', 'rechazada',
];

const formatNumber = (n) => {
  try { return Number(n ?? 0).toLocaleString('es-CL'); }
  catch { return String(n ?? 0); }
};

// Métricas estáticas iniciales (se muestran mientras se carga)
const FALLBACK_METRICS = {
  vecinosActivos: 12,
  solicitudesProcesadas: 48,
  certificadosMes: 8,
};

const getCurrentMonthRange = () => {
  const start = new Date();
  start.setDate(1);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setMonth(end.getMonth() + 1);
  end.setMilliseconds(end.getMilliseconds() - 1);
  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
};

export default function Home() {
  const supabase = useMemo(() => createClient(), []);
  const [loading, setLoading] = useState(true);
  const [metricsLoaded, setMetricsLoaded] = useState(false); // Track if real metrics loaded
  const [userInteracted, setUserInteracted] = useState(false); // Track user interaction

  const [metrics, setMetrics] = useState(FALLBACK_METRICS);

  // -------- CARGA INICIAL (counts exactos) - Solo se ejecuta después de interacción
  const fetchMetrics = async () => {
    // Si ya se cargaron las métricas reales, no volver a cargar
    if (metricsLoaded) return;

    try {
      setLoading(true);

      // 1) Vecinos activos
      const { count: vecinosActivos, error: errU } = await supabase
        .from('usuarios')
        .select('id', { count: 'exact', head: true })
        .eq('rol', 'vecino')
        .eq('estado', 'activo');
      if (errU) throw errU;

      // 2) Solicitudes procesadas
      const { count: solicitudesProcesadas, error: errS } = await supabase
        .from('solicitudes')
        .select('id', { count: 'exact', head: true })
        .in('estado', PROCESSED_STATES);
      if (errS) throw errS;

      // 3) Certificados emitidos este mes
      const monthRange = getCurrentMonthRange();
      const { count: certificadosMes, error: errC } = await supabase
        .from('solicitudes')
        .select('id', { count: 'exact', head: true })
        .in('estado', PROCESSED_STATES)
        .gte('fecha_respuesta', monthRange.start)
        .lte('fecha_respuesta', monthRange.end);
      if (errC) throw errC;

      setMetrics({
        vecinosActivos: vecinosActivos ?? FALLBACK_METRICS.vecinosActivos,
        solicitudesProcesadas: solicitudesProcesadas ?? FALLBACK_METRICS.solicitudesProcesadas,
        certificadosMes: certificadosMes ?? FALLBACK_METRICS.certificadosMes,
      });
      setMetricsLoaded(true);
    } catch (e) {
      console.error('Error cargando métricas:', e);
    } finally {
      setLoading(false);
    }
  };

  // -------- CARGA DIFERIDA: Solo cargar datos después de interacción del usuario
  useEffect(() => {
    // Mostrar métricas estáticas inicialmente
    setLoading(false);

    // Detectar interacción del usuario (scroll, mouse move, touch, o click)
    const handleUserInteraction = () => {
      if (!userInteracted) {
        console.log('👆 Usuario interactuó, cargando métricas reales...');
        setUserInteracted(true);
        fetchMetrics();
      }
    };

    // Eventos de interacción
    const events = ['scroll', 'mousemove', 'touchstart', 'click'];
    events.forEach(event => {
      window.addEventListener(event, handleUserInteraction, { once: true, passive: true });
    });

    // También cargar después de 3 segundos si no hay interacción
    const timeout = setTimeout(() => {
      if (!userInteracted) {
        console.log('⏰ Timeout alcanzado, cargando métricas reales...');
        setUserInteracted(true);
        fetchMetrics();
      }
    }, 3000);

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleUserInteraction);
      });
      clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Navegación con recarga completa (como tenías)
  const navigateTo = (path) => {
    if (typeof window !== 'undefined') {
      window.location.href = path;
    }
  };

  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero__container">
          <div className="hero__logo-wrapper">
            <img
              src="/vencinapp.svg"
              alt="VecindApp Logo"
              className="hero__logo"
            />
          </div>
          <h1 className="hero__title">VecindApp</h1>
          <p className="hero__subtitle">
            La plataforma digital que conecta a tu Junta de Vecinos con la comunidad
          </p>
          <p className="hero__description">
            Gestiona certificados, proyectos y comunicación vecinal en un solo lugar
          </p>
          <div className="hero-stats">
            <div
              className="hero-stat"
              role="status"
              aria-live="polite"
              aria-atomic="true"
              aria-label={loading ? 'Cargando vecinos activos' : `${formatNumber(metrics.vecinosActivos)} vecinos activos`}
            >
              <div className="hero-stat__number">
                {loading ? '…' : formatNumber(metrics.vecinosActivos)}
              </div>
              <div className="hero-stat__label">Vecinos Activos</div>
            </div>
            <div
              className="hero-stat"
              role="status"
              aria-live="polite"
              aria-atomic="true"
              aria-label={loading ? 'Cargando solicitudes procesadas' : `${formatNumber(metrics.solicitudesProcesadas)} solicitudes procesadas`}
            >
              <div className="hero-stat__number">
                {loading ? '…' : formatNumber(metrics.solicitudesProcesadas)}
              </div>
              <div className="hero-stat__label">Solicitudes Procesadas</div>
            </div>
            <div
              className="hero-stat"
              role="status"
              aria-live="polite"
              aria-atomic="true"
              aria-label={loading ? 'Cargando certificados emitidos este mes' : `${formatNumber(metrics.certificadosMes)} certificados emitidos este mes`}
            >
              <div className="hero-stat__number">
                {loading ? '…' : formatNumber(metrics.certificadosMes)}
              </div>
              <div className="hero-stat__label">Certificados este mes</div>
            </div>
            <div className="hero-stat" aria-hidden="true">
              <div className="hero-stat__number">24/7</div>
              <div className="hero-stat__label">Disponibilidad</div>
            </div>
          </div>
          <div className="hero-cta">
            <button className="hero-btn hero-btn--primary" onClick={() => navigateTo('/login')}>
              Iniciar Sesión
            </button>
            <button className="hero-btn hero-btn--outline" onClick={() => navigateTo('/register')}>
              Registrarse Gratis
            </button>
          </div>
        </div>
        <div className="hero__orb hero__orb--top" aria-hidden="true" />
        <div className="hero__orb hero__orb--bottom" aria-hidden="true" />
      </section>

      <section className="section">
        <div className="section__container">
          <div className="section__header">
            <h2 className="section__title">¿Cómo Funciona?</h2>
            <p className="section__subtitle">
              Tres simples pasos para comenzar a gestionar tus trámites vecinales
            </p>
          </div>
          <div className="steps-grid">
            <div className="card-step">
              <div className="card-step__badge">1</div>
              <h3 className="card-step__title">Regístrate</h3>
              <p className="card-text">
                Crea tu cuenta proporcionando tus datos personales y un comprobante de domicilio. Es rápido y seguro.
              </p>
            </div>
            <div className="card-step card-step--warning">
              <div className="card-step__badge">2</div>
              <h3 className="card-step__title">Espera la Aprobación</h3>
              <p className="card-text">
                La directiva de tu Junta de Vecinos revisará y aprobará tu cuenta. Te notificaremos por email.
              </p>
            </div>
            <div className="card-step card-step--success">
              <div className="card-step__badge">3</div>
              <h3 className="card-step__title">Comienza a Usar</h3>
              <p className="card-text">
                Solicita certificados, consulta avisos, participa en proyectos y mantente conectado con tu comunidad.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--light">
        <div className="section__container">
          <div className="section__header">
            <h2 className="section__title">¿Qué puedes hacer en VecindApp?</h2>
            <p className="section__subtitle">
              Una plataforma completa para vecinos y directivas de Juntas de Vecinos
            </p>
          </div>
          <div className="features-grid">
            <div className="card-feature">
              <i className="bi bi-file-earmark-text card-feature__icon" aria-hidden="true" />
              <h3 className="card-feature__title">Solicitar Certificados</h3>
              <p className="card-feature__text">
                Solicita certificados de residencia y antigüedad de forma 100% digital. Sin filas, sin papel.
              </p>
            </div>
            <div className="card-feature">
              <i className="bi bi-graph-up-arrow card-feature__icon" aria-hidden="true" />
              <h3 className="card-feature__title">Seguimiento en Tiempo Real</h3>
              <p className="card-feature__text">
                Monitorea el estado de tus solicitudes 24/7. Recibe notificaciones de cada actualización.
              </p>
            </div>
            <div className="card-feature">
              <i className="bi bi-megaphone card-feature__icon" aria-hidden="true" />
              <h3 className="card-feature__title">Avisos y Noticias</h3>
              <p className="card-feature__text">
                Mantente informado de avisos importantes, eventos y noticias de tu comunidad vecinal.
              </p>
            </div>
            <div className="card-feature">
              <i className="bi bi-buildings card-feature__icon" aria-hidden="true" />
              <h3 className="card-feature__title">Proyectos Vecinales</h3>
              <p className="card-feature__text">
                Postula y vota proyectos para mejorar tu barrio. Transparencia en cada iniciativa.
              </p>
            </div>
            <div className="card-feature">
              <i className="bi bi-calendar-event card-feature__icon" aria-hidden="true" />
              <h3 className="card-feature__title">Actividades Comunitarias</h3>
              <p className="card-feature__text">
                Participa en talleres, eventos deportivos, culturales y sociales organizados por tu junta.
              </p>
            </div>
            <div className="card-feature">
              <i className="bi bi-geo-alt card-feature__icon" aria-hidden="true" />
              <h3 className="card-feature__title">Mapa Interactivo</h3>
              <p className="card-feature__text">
                Visualiza tu vecindario, localiza vecinos y conoce tu unidad vecinal en un mapa dinámico.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section stats-section">
        <div className="section__container">
          <div className="section__header">
            <h2 className="section__title">Impacto Real en la Comunidad</h2>
            <p className="section__subtitle">
              Números que reflejan el compromiso de nuestra plataforma
            </p>
          </div>
          <div className="stats-grid">
            <div className="card-stat">
              <i className="bi bi-lightning-charge card-stat__icon" aria-hidden="true" />
              <div className="card-stat__value">&lt; 24h</div>
              <div className="card-stat__label">Tiempo Promedio de Respuesta</div>
            </div>
            <div className="card-stat card-stat--success">
              <i className="bi bi-check-circle card-stat__icon" aria-hidden="true" />
              <div className="card-stat__value">95%</div>
              <div className="card-stat__label">Satisfacción de Usuarios</div>
            </div>
            <div className="card-stat card-stat--warning">
              <i className="bi bi-house-heart card-stat__icon" aria-hidden="true" />
              <div className="card-stat__value">15+</div>
              <div className="card-stat__label">Juntas de Vecinos Activas</div>
            </div>
            <div className="card-stat card-stat--danger">
              <i className="bi bi-file-earmark-check card-stat__icon" aria-hidden="true" />
              <div className="card-stat__value">100%</div>
              <div className="card-stat__label">Digital - Sin Papel</div>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--light">
        <div className="section__container">
          <div className="section__header">
            <h2 className="section__title">Beneficios para Todos</h2>
            <p className="section__subtitle">Una solución diseñada para vecinos y directivas</p>
          </div>
          <div className="benefits-grid">
            <div className="card-benefit">
              <div className="benefit-badge benefit-badge--dark">👤 PARA VECINOS</div>
              <ul className="benefit-list" role="list" aria-label="Beneficios para vecinos">
                <li className="benefit-item">Solicita certificados desde cualquier lugar</li>
                <li className="benefit-item">Seguimiento transparente de tus trámites</li>
                <li className="benefit-item">Participa en proyectos y actividades</li>
                <li className="benefit-item">Recibe avisos importantes al instante</li>
                <li className="benefit-item">Conecta con tu comunidad vecinal</li>
              </ul>
            </div>
            <div className="card-benefit">
              <div className="benefit-badge benefit-badge--teal">👥 PARA DIRECTIVAS</div>
              <ul className="benefit-list" role="list" aria-label="Beneficios para directivas">
                <li className="benefit-item">Gestión eficiente de solicitudes</li>
                <li className="benefit-item">Emite certificados digitales válidos</li>
                <li className="benefit-item">Administra proyectos y presupuestos</li>
                <li className="benefit-item">Comunica con toda la comunidad fácilmente</li>
                <li className="benefit-item">Registro digital de todas las actividades</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--muted">
        <div className="section__container">
          <div className="section__header">
            <h2 className="section__title">Explora tu Vecindario</h2>
            <p className="section__subtitle">Visualiza tu ubicación y conoce tu comunidad</p>
          </div>
          <div className="map-card">
            <img
              src="https://providencia.cl/provi/site/artic/20191112/imag/foto_0000000120191112153536/unidades_vecinales.png"
              alt="Mapa de Unidades Vecinales"
            />
            <div className="map-card__callout">
              <p className="card-text">
                <strong>¿Sabías que...?</strong> Cada Junta de Vecinos representa una Unidad Vecinal específica
              </p>
              <p className="map-card__note">
                Identifica tu unidad vecinal y conecta con tus vecinos más cercanos
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--teal cta-final">
        <div className="section__container cta-final__container">
          <h2 className="cta-final__title">¿Listo para Digitalizar tu Comunidad?</h2>
          <p className="cta-final__copy">
            Únete a cientos de vecinos que ya están gestionando sus trámites de forma digital.
            Simplifica, ahorra tiempo y conecta con tu comunidad.
          </p>
          <button className="cta-final__btn" onClick={() => navigateTo('/register')}>
            Crear Cuenta Gratis 🚀
          </button>
          <p className="cta-final__notes">Sin costos ocultos • 100% seguro • Aprobación en 24-48 horas</p>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="section__container">
          <div className="landing-footer__grid">
            <div>
              <h3 className="landing-footer__title">VecindApp</h3>
              <p className="landing-footer__text">
                La plataforma digital que conecta a las Juntas de Vecinos con su comunidad.
                Gestión moderna para organizaciones vecinales de Chile.
              </p>
            </div>
            <div>
              <h4 className="landing-footer__subtitle">Enlaces Rápidos</h4>
              <ul className="landing-footer__links">
                <li>
                  <a href="/login">Iniciar Sesión</a>
                </li>
                <li>
                  <a href="/register">Registrarse</a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="landing-footer__subtitle">Contacto</h4>
              <ul className="landing-footer__contact">
                <li>📧 contacto@vecindapp.cl</li>
                <li>📱 +56 9 XXXX XXXX</li>
                <li>🏢 Santiago, Chile</li>
              </ul>
            </div>
          </div>
          <div className="landing-footer__divider">
            © 2025 VecindApp. Todos los derechos reservados. | Hecho con 💚 para las comunidades de Chile
          </div>
        </div>
      </footer>
    </div>
  );
}
