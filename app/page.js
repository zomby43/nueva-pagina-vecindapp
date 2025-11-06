'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

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

const isProcessed = (estado) =>
  PROCESSED_STATES.includes(String(estado || '').toLowerCase());

const isVecinoActivo = (row) =>
  String(row?.rol || '').toLowerCase() === 'vecino' &&
  String(row?.estado || '').toLowerCase() === 'activo';

export default function Home() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [loading, setLoading] = useState(true);

  const [metrics, setMetrics] = useState({
    vecinosActivos: 0,
    solicitudesProcesadas: 0,
  });

  // -------- CARGA INICIAL (counts exactos)
  const fetchMetrics = async () => {
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

      setMetrics({
        vecinosActivos: vecinosActivos ?? 0,
        solicitudesProcesadas: solicitudesProcesadas ?? 0,
      });
    } catch (e) {
      console.error('Error cargando métricas:', e);
    } finally {
      setLoading(false);
    }
  };

  // -------- SUSCRIPCIÓN REALTIME (sin filtros frágiles)
  useEffect(() => {
    let mounted = true;

    fetchMetrics();

    const channel = supabase
      .channel('home-metrics')
      // usuarios: cualquier cambio. Ajustamos contadores según transición
      .on('postgres_changes', { event: '*', schema: 'public', table: 'usuarios' }, (payload) => {
        if (!mounted) return;
        const { eventType, old, new: n } = payload;

        if (eventType === 'INSERT') {
          if (isVecinoActivo(n)) {
            setMetrics((m) => ({ ...m, vecinosActivos: Math.max(0, m.vecinosActivos + 1) }));
          }
        } else if (eventType === 'UPDATE') {
          const eraActivo = isVecinoActivo(old);
          const esActivo = isVecinoActivo(n);
          if (eraActivo !== esActivo) {
            setMetrics((m) => ({
              ...m,
              vecinosActivos: Math.max(0, m.vecinosActivos + (esActivo ? 1 : -1)),
            }));
          }
        } else if (eventType === 'DELETE') {
          if (isVecinoActivo(old)) {
            setMetrics((m) => ({ ...m, vecinosActivos: Math.max(0, m.vecinosActivos - 1) }));
          }
        }
      })
      // solicitudes: cualquier cambio. Contamos si entra/sale de estados procesados
      .on('postgres_changes', { event: '*', schema: 'public', table: 'solicitudes' }, (payload) => {
        if (!mounted) return;
        const { eventType, old, new: n } = payload;

        if (eventType === 'INSERT') {
          if (isProcessed(n?.estado)) {
            setMetrics((m) => ({
              ...m,
              solicitudesProcesadas: Math.max(0, m.solicitudesProcesadas + 1),
            }));
          }
        } else if (eventType === 'UPDATE') {
          const oldProc = isProcessed(old?.estado);
          const newProc = isProcessed(n?.estado);
          if (oldProc !== newProc) {
            setMetrics((m) => ({
              ...m,
              solicitudesProcesadas: Math.max(0, m.solicitudesProcesadas + (newProc ? 1 : -1)),
            }));
          }
        } else if (eventType === 'DELETE') {
          if (isProcessed(old?.estado)) {
            setMetrics((m) => ({
              ...m,
              solicitudesProcesadas: Math.max(0, m.solicitudesProcesadas - 1),
            }));
          }
        }
      })
      .subscribe();

    const onOnline = () => fetchMetrics();
    window.addEventListener('online', onOnline);

    return () => {
      mounted = false;
      channel.unsubscribe();
      window.removeEventListener('online', onOnline);
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
    <div style={{ width: '100%', background: '#f4f8f9' }}>
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #439fa4 0%, #2d7a7f 50%, #154765 100%)',
        padding: '6rem 2rem',
        textAlign: 'center',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ marginBottom: '2rem' }}>
            <img
              src="/vencinapp.svg"
              alt="VecindApp Logo"
              style={{ height: '100px', marginBottom: '1rem' }}
            />
          </div>

          <h1 style={{
            fontSize: '3.5rem',
            fontWeight: 700,
            marginBottom: '1.5rem',
            textShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}>
            VecindApp
          </h1>

          <p style={{
            fontSize: '1.5rem',
            marginBottom: '1rem',
            maxWidth: '800px',
            margin: '0 auto 1rem auto',
            opacity: 0.95
          }}>
            La plataforma digital que conecta a tu Junta de Vecinos con la comunidad
          </p>

          <p style={{
            fontSize: '1.125rem',
            marginBottom: '3rem',
            opacity: 0.85
          }}>
            Gestiona certificados, proyectos y comunicación vecinal en un solo lugar
          </p>

          {/* Trust Badges (DINÁMICOS) */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '2rem',
            marginBottom: '3rem',
            flexWrap: 'wrap'
          }}>
            <div style={{
              background: 'rgba(255,255,255,0.15)',
              padding: '1rem 1.5rem',
              borderRadius: '16px',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{ fontSize: '2rem', fontWeight: 700 }}>
                {loading ? '…' : formatNumber(metrics.vecinosActivos)}
              </div>
              <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Vecinos Activos</div>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.15)',
              padding: '1rem 1.5rem',
              borderRadius: '16px',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{ fontSize: '2rem', fontWeight: 700 }}>
                {loading ? '…' : formatNumber(metrics.solicitudesProcesadas)}
              </div>
              <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Solicitudes Procesadas</div>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.15)',
              padding: '1rem 1.5rem',
              borderRadius: '16px',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{ fontSize: '2rem', fontWeight: 700 }}>24/7</div>
              <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Disponibilidad</div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigateTo('/login')}
              style={{
                background: 'white',
                color: '#439fa4',
                padding: '1rem 2.5rem',
                fontSize: '1.125rem',
                fontWeight: 600,
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
              }}
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => navigateTo('/register')}
              style={{
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                padding: '1rem 2.5rem',
                fontSize: '1.125rem',
                fontWeight: 600,
                border: '2px solid white',
                borderRadius: '12px',
                cursor: 'pointer',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.color = '#439fa4';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                e.currentTarget.style.color = 'white';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Registrarse Gratis
            </button>
          </div>
        </div>

        {/* Decorative Elements */}
        <div style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '300px',
          height: '300px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '50%',
          filter: 'blur(60px)'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-100px',
          left: '-100px',
          width: '400px',
          height: '400px',
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '50%',
          filter: 'blur(80px)'
        }} />
      </section>

      {/* Cómo Funciona */}
      <section style={{ padding: '5rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 700, color: '#154765', marginBottom: '1rem' }}>
            ¿Cómo Funciona?
          </h2>
          <p style={{ fontSize: '1.125rem', color: '#439fa4', maxWidth: '600px', margin: '0 auto' }}>
            Tres simples pasos para comenzar a gestionar tus trámites vecinales
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem'
        }}>
          {/* Paso 1 */}
          <div
            style={{
              background: 'white',
              padding: '2.5rem',
              borderRadius: '16px',
              borderLeft: '6px solid #439fa4',
              boxShadow: '0 2px 8px rgba(21, 71, 101, 0.06)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              cursor: 'default'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 16px rgba(21, 71, 101, 0.12)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(21, 71, 101, 0.06)';
            }}
          >
            <div style={{
              background: '#439fa4',
              color: 'white',
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              fontWeight: 700,
              marginBottom: '1.5rem'
            }}>
              1
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#154765', marginBottom: '1rem' }}>
              Regístrate
            </h3>
            <p style={{ fontSize: '1rem', color: '#439fa4', lineHeight: 1.6 }}>
              Crea tu cuenta proporcionando tus datos personales y un comprobante de domicilio. Es rápido y seguro.
            </p>
          </div>

          {/* Paso 2 */}
          <div
            style={{
              background: 'white',
              padding: '2.5rem',
              borderRadius: '16px',
              borderLeft: '6px solid #fbbf24',
              boxShadow: '0 2px 8px rgba(21, 71, 101, 0.06)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              cursor: 'default'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 16px rgba(21, 71, 101, 0.12)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(21, 71, 101, 0.06)';
            }}
          >
            <div style={{
              background: '#fbbf24',
              color: '#78350f',
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              fontWeight: 700,
              marginBottom: '1.5rem'
            }}>
              2
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#154765', marginBottom: '1rem' }}>
              Espera la Aprobación
            </h3>
            <p style={{ fontSize: '1rem', color: '#439fa4', lineHeight: 1.6 }}>
              La directiva de tu Junta de Vecinos revisará y aprobará tu cuenta. Te notificaremos por email.
            </p>
          </div>

          {/* Paso 3 */}
          <div
            style={{
              background: 'white',
              padding: '2.5rem',
              borderRadius: '16px',
              borderLeft: '6px solid #34d399',
              boxShadow: '0 2px 8px rgba(21, 71, 101, 0.06)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              cursor: 'default'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 16px rgba(21, 71, 101, 0.12)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(21, 71, 101, 0.06)';
            }}
          >
            <div style={{
              background: '#34d399',
              color: '#064e3b',
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              fontWeight: 700,
              marginBottom: '1.5rem'
            }}>
              3
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#154765', marginBottom: '1rem' }}>
              Comienza a Usar
            </h3>
            <p style={{ fontSize: '1rem', color: '#439fa4', lineHeight: 1.6 }}>
              Solicita certificados, consulta avisos, participa en proyectos y mantente conectado con tu comunidad.
            </p>
          </div>
        </div>
      </section>

      {/* Características/Features */}
      <section style={{ padding: '5rem 2rem', background: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 700, color: '#154765', marginBottom: '1rem' }}>
              ¿Qué puedes hacer en VecindApp?
            </h2>
            <p style={{ fontSize: '1.125rem', color: '#439fa4', maxWidth: '700px', margin: '0 auto' }}>
              Una plataforma completa para vecinos y directivas de Juntas de Vecinos
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem'
          }}>
            {/* Feature 1 */}
            <div
              style={{
                background: '#f4f8f9',
                padding: '2rem',
                borderRadius: '16px',
                textAlign: 'center',
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'default',
                boxShadow: '0 2px 8px rgba(21, 71, 101, 0.06)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 16px rgba(21, 71, 101, 0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(21, 71, 101, 0.06)';
              }}
            >
              <div style={{ marginBottom: '1.5rem' }}>
                <i className="bi bi-file-earmark-text" style={{ fontSize: '4rem', color: '#439fa4' }}></i>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#154765', marginBottom: '1rem' }}>
                Solicitar Certificados
              </h3>
              <p style={{ fontSize: '0.9375rem', color: '#439fa4', lineHeight: 1.6 }}>
                Solicita certificados de residencia y antigüedad de forma 100% digital. Sin filas, sin papel.
              </p>
            </div>

            {/* Feature 2 */}
            <div
              style={{
                background: '#f4f8f9',
                padding: '2rem',
                borderRadius: '16px',
                textAlign: 'center',
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'default',
                boxShadow: '0 2px 8px rgba(21, 71, 101, 0.06)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 16px rgba(21, 71, 101, 0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(21, 71, 101, 0.06)';
              }}
            >
              <div style={{ marginBottom: '1.5rem' }}>
                <i className="bi bi-graph-up-arrow" style={{ fontSize: '4rem', color: '#439fa4' }}></i>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#154765', marginBottom: '1rem' }}>
                Seguimiento en Tiempo Real
              </h3>
              <p style={{ fontSize: '0.9375rem', color: '#439fa4', lineHeight: 1.6 }}>
                Monitorea el estado de tus solicitudes 24/7. Recibe notificaciones de cada actualización.
              </p>
            </div>

            {/* Feature 3 */}
            <div
              style={{
                background: '#f4f8f9',
                padding: '2rem',
                borderRadius: '16px',
                textAlign: 'center',
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'default',
                boxShadow: '0 2px 8px rgba(21, 71, 101, 0.06)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 16px rgba(21, 71, 101, 0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(21, 71, 101, 0.06)';
              }}
            >
              <div style={{ marginBottom: '1.5rem' }}>
                <i className="bi bi-megaphone" style={{ fontSize: '4rem', color: '#439fa4' }}></i>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#154765', marginBottom: '1rem' }}>
                Avisos y Noticias
              </h3>
              <p style={{ fontSize: '0.9375rem', color: '#439fa4', lineHeight: 1.6 }}>
                Mantente informado de avisos importantes, eventos y noticias de tu comunidad vecinal.
              </p>
            </div>

            {/* Feature 4 */}
            <div
              style={{
                background: '#f4f8f9',
                padding: '2rem',
                borderRadius: '16px',
                textAlign: 'center',
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'default',
                boxShadow: '0 2px 8px rgba(21, 71, 101, 0.06)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 16px rgba(21, 71, 101, 0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(21, 71, 101, 0.06)';
              }}
            >
              <div style={{ marginBottom: '1.5rem' }}>
                <i className="bi bi-buildings" style={{ fontSize: '4rem', color: '#439fa4' }}></i>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#154765', marginBottom: '1rem' }}>
                Proyectos Vecinales
              </h3>
              <p style={{ fontSize: '0.9375rem', color: '#439fa4', lineHeight: 1.6 }}>
                Postula y vota proyectos para mejorar tu barrio. Transparencia en cada iniciativa.
              </p>
            </div>

            {/* Feature 5 */}
            <div
              style={{
                background: '#f4f8f9',
                padding: '2rem',
                borderRadius: '16px',
                textAlign: 'center',
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'default',
                boxShadow: '0 2px 8px rgba(21, 71, 101, 0.06)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 16px rgba(21, 71, 101, 0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(21, 71, 101, 0.06)';
              }}
            >
              <div style={{ marginBottom: '1.5rem' }}>
                <i className="bi bi-calendar-event" style={{ fontSize: '4rem', color: '#439fa4' }}></i>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#154765', marginBottom: '1rem' }}>
                Actividades Comunitarias
              </h3>
              <p style={{ fontSize: '0.9375rem', color: '#439fa4', lineHeight: 1.6 }}>
                Participa en talleres, eventos deportivos, culturales y sociales organizados por tu junta.
              </p>
            </div>

            {/* Feature 6 */}
            <div
              style={{
                background: '#f4f8f9',
                padding: '2rem',
                borderRadius: '16px',
                textAlign: 'center',
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'default',
                boxShadow: '0 2px 8px rgba(21, 71, 101, 0.06)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 16px rgba(21, 71, 101, 0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(21, 71, 101, 0.06)';
              }}
            >
              <div style={{ marginBottom: '1.5rem' }}>
                <i className="bi bi-geo-alt" style={{ fontSize: '4rem', color: '#439fa4' }}></i>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#154765', marginBottom: '1rem' }}>
                Mapa Interactivo
              </h3>
              <p style={{ fontSize: '0.9375rem', color: '#439fa4', lineHeight: 1.6 }}>
                Visualiza tu vecindario, localiza vecinos y conoce tu unidad vecinal en un mapa dinámico.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Estadísticas */}
      <section style={{ padding: '5rem 2rem', background: '#d8e7eb' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 700, color: '#154765', marginBottom: '1rem' }}>
              Impacto Real en la Comunidad
            </h2>
            <p style={{ fontSize: '1.125rem', color: '#439fa4' }}>
              Números que reflejan el compromiso de nuestra plataforma
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '2rem'
          }}>
            {/* Stat 1 */}
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '2rem',
              boxShadow: '0 2px 8px rgba(21, 71, 101, 0.06)',
              borderLeft: '4px solid #439fa4',
              textAlign: 'center'
            }}>
              <div style={{ marginBottom: '0.5rem' }}>
                <i className="bi bi-lightning-charge" style={{ fontSize: '3rem', color: '#439fa4' }}></i>
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#154765', marginBottom: '0.5rem' }}>
                &lt; 24h
              </div>
              <div style={{ fontSize: '0.875rem', color: '#439fa4', textTransform: 'uppercase', fontWeight: 600 }}>
                Tiempo Promedio de Respuesta
              </div>
            </div>

            {/* Stat 2 */}
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '2rem',
              boxShadow: '0 2px 8px rgba(21, 71, 101, 0.06)',
              borderLeft: '4px solid #34d399',
              textAlign: 'center'
            }}>
              <div style={{ marginBottom: '0.5rem' }}>
                <i className="bi bi-check-circle" style={{ fontSize: '3rem', color: '#34d399' }}></i>
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#154765', marginBottom: '0.5rem' }}>
                95%
              </div>
              <div style={{ fontSize: '0.875rem', color: '#439fa4', textTransform: 'uppercase', fontWeight: 600 }}>
                Satisfacción de Usuarios
              </div>
            </div>

            {/* Stat 3 */}
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '2rem',
              boxShadow: '0 2px 8px rgba(21, 71, 101, 0.06)',
              borderLeft: '4px solid #fbbf24',
              textAlign: 'center'
            }}>
              <div style={{ marginBottom: '0.5rem' }}>
                <i className="bi bi-house-heart" style={{ fontSize: '3rem', color: '#fbbf24' }}></i>
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#154765', marginBottom: '0.5rem' }}>
                15+
              </div>
              <div style={{ fontSize: '0.875rem', color: '#439fa4', textTransform: 'uppercase', fontWeight: 600 }}>
                Juntas de Vecinos Activas
              </div>
            </div>

            {/* Stat 4 */}
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '2rem',
              boxShadow: '0 2px 8px rgba(21, 71, 101, 0.06)',
              borderLeft: '4px solid #fb7185',
              textAlign: 'center'
            }}>
              <div style={{ marginBottom: '0.5rem' }}>
                <i className="bi bi-file-earmark-check" style={{ fontSize: '3rem', color: '#fb7185' }}></i>
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#154765', marginBottom: '0.5rem' }}>
                100%
              </div>
              <div style={{ fontSize: '0.875rem', color: '#439fa4', textTransform: 'uppercase', fontWeight: 600 }}>
                Digital - Sin Papel
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Beneficios por Rol */}
      <section style={{ padding: '5rem 2rem', background: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 700, color: '#154765', marginBottom: '1rem' }}>
              Beneficios para Todos
            </h2>
            <p style={{ fontSize: '1.125rem', color: '#439fa4' }}>
              Una solución diseñada para vecinos y directivas
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            {/* Para Vecinos */}
            <div style={{
              background: '#f4f8f9',
              padding: '2.5rem',
              borderRadius: '16px',
              boxShadow: '0 2px 8px rgba(21, 71, 101, 0.06)'
            }}>
              <div style={{
                display: 'inline-block',
                background: 'linear-gradient(135deg, #154765 0%, #0f3449 100%)',
                color: 'white',
                padding: '0.5rem 1.5rem',
                borderRadius: '20px',
                fontSize: '0.875rem',
                fontWeight: 700,
                marginBottom: '1.5rem'
              }}>
                👤 PARA VECINOS
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <li style={{ marginBottom: '1rem', paddingLeft: '2rem', position: 'relative', color: '#439fa4' }}>
                  <span style={{ position: 'absolute', left: 0 }}>✓</span>
                  Solicita certificados desde cualquier lugar
                </li>
                <li style={{ marginBottom: '1rem', paddingLeft: '2rem', position: 'relative', color: '#439fa4' }}>
                  <span style={{ position: 'absolute', left: 0 }}>✓</span>
                  Seguimiento transparente de tus trámites
                </li>
                <li style={{ marginBottom: '1rem', paddingLeft: '2rem', position: 'relative', color: '#439fa4' }}>
                  <span style={{ position: 'absolute', left: 0 }}>✓</span>
                  Participa en proyectos y actividades
                </li>
                <li style={{ marginBottom: '1rem', paddingLeft: '2rem', position: 'relative', color: '#439fa4' }}>
                  <span style={{ position: 'absolute', left: 0 }}>✓</span>
                  Recibe avisos importantes al instante
                </li>
                <li style={{ marginBottom: '1rem', paddingLeft: '2rem', position: 'relative', color: '#439fa4' }}>
                  <span style={{ position: 'absolute', left: 0 }}>✓</span>
                  Conecta con tu comunidad vecinal
                </li>
              </ul>
            </div>

            {/* Para Directiva */}
            <div style={{
              background: '#f4f8f9',
              padding: '2.5rem',
              borderRadius: '16px',
              boxShadow: '0 2px 8px rgba(21, 71, 101, 0.06)'
            }}>
              <div style={{
                display: 'inline-block',
                background: 'linear-gradient(135deg, #439fa4 0%, #2d7a7f 100%)',
                color: 'white',
                padding: '0.5rem 1.5rem',
                borderRadius: '20px',
                fontSize: '0.875rem',
                fontWeight: 700,
                marginBottom: '1.5rem'
              }}>
                👥 PARA DIRECTIVAS
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <li style={{ marginBottom: '1rem', paddingLeft: '2rem', position: 'relative', color: '#439fa4' }}>
                  <span style={{ position: 'absolute', left: 0 }}>✓</span>
                  Gestión eficiente de solicitudes
                </li>
                <li style={{ marginBottom: '1rem', paddingLeft: '2rem', position: 'relative', color: '#439fa4' }}>
                  <span style={{ position: 'absolute', left: 0 }}>✓</span>
                  Emite certificados digitales válidos
                </li>
                <li style={{ marginBottom: '1rem', paddingLeft: '2rem', position: 'relative', color: '#439fa4' }}>
                  <span style={{ position: 'absolute', left: 0 }}>✓</span>
                  Administra proyectos y presupuestos
                </li>
                <li style={{ marginBottom: '1rem', paddingLeft: '2rem', position: 'relative', color: '#439fa4' }}>
                  <span style={{ position: 'absolute', left: 0 }}>✓</span>
                  Comunica con toda la comunidad fácilmente
                </li>
                <li style={{ marginBottom: '1rem', paddingLeft: '2rem', position: 'relative', color: '#439fa4' }}>
                  <span style={{ position: 'absolute', left: 0 }}>✓</span>
                  Registro digital de todas las actividades
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Mapa de Comunidad */}
      <section style={{ padding: '5rem 2rem', background: '#f4f8f9' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 700, color: '#154765', marginBottom: '1rem' }}>
              Explora tu Vecindario
            </h2>
            <p style={{ fontSize: '1.125rem', color: '#439fa4' }}>
              Visualiza tu ubicación y conoce tu comunidad
            </p>
          </div>

          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '2rem',
            boxShadow: '0 2px 8px rgba(21, 71, 101, 0.06)'
          }}>
            <img
              src="https://providencia.cl/provi/site/artic/20191112/imag/foto_0000000120191112153536/unidades_vecinales.png"
              alt="Mapa de Unidades Vecinales"
              style={{
                width: '100%',
                borderRadius: '12px',
                display: 'block'
              }}
            />
            <div style={{
              marginTop: '2rem',
              textAlign: 'center',
              padding: '1.5rem',
              background: '#f4f8f9',
              borderRadius: '12px'
            }}>
              <p style={{ fontSize: '1rem', color: '#439fa4', marginBottom: '0.5rem' }}>
                <strong style={{ color: '#154765' }}>¿Sabías que...?</strong> Cada Junta de Vecinos representa una Unidad Vecinal específica
              </p>
              <p style={{ fontSize: '0.875rem', color: '#bfd3d9', margin: 0 }}>
                Identifica tu unidad vecinal y conecta con tus vecinos más cercanos
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section style={{
        background: 'linear-gradient(135deg, #439fa4 0%, #2d7a7f 50%, #154765 100%)',
        padding: '5rem 2rem',
        textAlign: 'center',
        color: 'white'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>
            ¿Listo para Digitalizar tu Comunidad?
          </h2>
          <p style={{ fontSize: '1.25rem', marginBottom: '3rem', opacity: 0.95, lineHeight: 1.6 }}>
            Únete a cientos de vecinos que ya están gestionando sus trámites de forma digital.
            Simplifica, ahorra tiempo y conecta con tu comunidad.
          </p>
          <button
            onClick={() => navigateTo('/register')}
            style={{
              background: 'white',
              color: '#439fa4',
              padding: '1.25rem 3rem',
              fontSize: '1.25rem',
              fontWeight: 700,
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px) scale(1.05)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.25)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            }}
          >
            Crear Cuenta Gratis 🚀
          </button>
          <p style={{ fontSize: '0.875rem', marginTop: '1.5rem', opacity: 0.8 }}>
            Sin costos ocultos • 100% seguro • Aprobación en 24-48 horas
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#154765', color: 'white', padding: '3rem 2rem 2rem 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '3rem',
            marginBottom: '3rem'
          }}>
            {/* Columna 1 */}
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', color: '#ffffff' }}>
                VecindApp
              </h3>
              <p style={{ fontSize: '0.875rem', lineHeight: 1.6, color: '#bfd3d9' }}>
                La plataforma digital que conecta a las Juntas de Vecinos con su comunidad.
                Gestión moderna para organizaciones vecinales de Chile.
              </p>
            </div>

            {/* Columna 2 */}
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: '#ffffff' }}>
                Enlaces Rápidos
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <li style={{ marginBottom: '0.5rem' }}>
                  <a href="/login" style={{ color: '#bfd3d9', textDecoration: 'none', fontSize: '0.875rem' }}>
                    Iniciar Sesión
                  </a>
                </li>
                <li style={{ marginBottom: '0.5rem' }}>
                  <a href="/register" style={{ color: '#bfd3d9', textDecoration: 'none', fontSize: '0.875rem' }}>
                    Registrarse
                  </a>
                </li>
              </ul>
            </div>

            {/* Columna 3 */}
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: '#ffffff' }}>
                Contacto
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <li style={{ marginBottom: '0.5rem', color: '#bfd3d9', fontSize: '0.875rem' }}>
                  📧 contacto@vecindapp.cl
                </li>
                <li style={{ marginBottom: '0.5rem', color: '#bfd3d9', fontSize: '0.875rem' }}>
                  📱 +56 9 XXXX XXXX
                </li>
                <li style={{ marginBottom: '0.5rem', color: '#bfd3d9', fontSize: '0.875rem' }}>
                  🏢 Santiago, Chile
                </li>
              </ul>
            </div>
          </div>

          <div style={{
            borderTop: '1px solid rgba(191, 211, 217, 0.2)',
            paddingTop: '2rem',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '0.875rem', color: '#bfd3d9', margin: 0 }}>
              © 2025 VecindApp. Todos los derechos reservados. | Hecho con 💚 para las comunidades de Chile
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
