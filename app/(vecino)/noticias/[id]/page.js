'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { toggleReaccion, getReaccionesNoticia, getReaccionUsuario } from '@/lib/reacciones/noticiasReacciones';

export default function NoticiaDetallePage() {
  const params = useParams();
  const router = useRouter();
  const [noticia, setNoticia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showImageModal, setShowImageModal] = useState(false);

  // Estados para reacciones
  const [reacciones, setReacciones] = useState({ meGusta: 0, noMeGusta: 0, total: 0 });
  const [miReaccion, setMiReaccion] = useState(null);
  const [loadingReaccion, setLoadingReaccion] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchNoticia();
      fetchReacciones();
    }
  }, [params.id]);

  const fetchNoticia = async () => {
    try {
      setLoading(true);
      setError('');
      const supabase = createClient();

      const { data, error } = await supabase
        .from('noticias')
        .select(`
          *,
          autor:autor_id (
            nombres,
            apellidos
          )
        `)
        .eq('id', params.id)
        .eq('estado', 'publicado')
        .single();

      if (error) {
        console.error('Error fetching noticia:', error);
        throw error;
      }

      if (!data) {
        setError('Noticia no encontrada');
        return;
      }

      setNoticia(data);
    } catch (error) {
      console.error('Error completo:', error);
      setError('Error al cargar la noticia');
    } finally {
      setLoading(false);
    }
  };

  const getCategoriaTexto = (categoria) => {
    const textos = {
      general: 'General',
      eventos: 'Eventos',
      obras: 'Obras',
      seguridad: 'Seguridad',
      medio_ambiente: 'Medio Ambiente',
      cultura: 'Cultura',
      deportes: 'Deportes',
      otro: 'Otro'
    };
    return textos[categoria] || categoria;
  };

  const getCategoriaBadge = (categoria) => {
    const colores = {
      general: 'bg-primary',
      eventos: 'bg-info',
      obras: 'bg-warning text-dark',
      seguridad: 'bg-danger',
      medio_ambiente: 'bg-success',
      cultura: 'bg-purple',
      deportes: 'bg-orange',
      otro: 'bg-secondary'
    };
    return colores[categoria] || 'bg-secondary';
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Función para cargar reacciones
  const fetchReacciones = async () => {
    try {
      const stats = await getReaccionesNoticia(params.id);
      setReacciones(stats);

      const miReaccionData = await getReaccionUsuario(params.id);
      setMiReaccion(miReaccionData.reaccion);
    } catch (error) {
      console.error('Error al cargar reacciones:', error);
    }
  };

  // Función para manejar click en botón de reacción
  const handleReaccion = async (tipo) => {
    try {
      setLoadingReaccion(true);
      const result = await toggleReaccion(params.id, tipo);

      if (result.success) {
        // Actualizar estado local
        await fetchReacciones();
      } else {
        alert('Error al registrar reacción: ' + result.error);
      }
    } catch (error) {
      console.error('Error al reaccionar:', error);
      alert('Error al registrar reacción');
    } finally {
      setLoadingReaccion(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="text-center">
            <div className="spinner-border mb-3" role="status"></div>
            <p>Cargando noticia...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !noticia) {
    return (
      <div className="page-container">
        <div className="alert alert-danger">
          <h5>Error</h5>
          <p>{error || 'No se pudo cargar la noticia'}</p>
          <Link href="/noticias" className="btn btn-primary mt-2">
            Volver a Noticias
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-3">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link href="/noticias">Noticias</Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            {noticia.titulo}
          </li>
        </ol>
      </nav>

      {/* Imagen Hero (si existe) - Centrada y clickeable */}
      {noticia.imagen_url && (
        <div
          className="mb-4 text-center"
          style={{
            width: '100%',
            maxWidth: '900px',
            margin: '0 auto',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            cursor: 'pointer',
            position: 'relative'
          }}
          onClick={() => setShowImageModal(true)}
        >
          <img
            src={noticia.imagen_url}
            alt={noticia.titulo}
            style={{
              width: '100%',
              maxHeight: '600px',
              objectFit: 'contain',
              display: 'block',
              transition: 'transform 0.3s ease'
            }}
            className="noticia-hero-image"
          />
          <div
            className="image-overlay"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0,
              transition: 'opacity 0.3s ease'
            }}
          >
            <span style={{
              color: 'white',
              background: 'rgba(0,0,0,0.7)',
              padding: '1rem 2rem',
              borderRadius: '30px',
              fontSize: '1.1rem',
              fontWeight: '600'
            }}>
              🔍 Click para ver en grande
            </span>
          </div>
        </div>
      )}

      {/* Contenido de la noticia */}
      <article>
        <div className="card noticia-detalle-card">
          <div className="card-body noticia-detalle-body">
            {/* Header */}
            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <span className={`badge ${getCategoriaBadge(noticia.categoria)} me-2`}>
                    {getCategoriaTexto(noticia.categoria)}
                  </span>
                  {noticia.destacado && (
                    <span className="badge bg-warning text-dark">
                      ⭐ Destacada
                    </span>
                  )}
                </div>
                <Link href="/noticias" className="btn btn-sm btn-outline-secondary">
                  ← Volver
                </Link>
              </div>

              <h1 className="display-5 fw-bold mb-3">{noticia.titulo}</h1>

              {noticia.resumen && (
                <p className="lead text-muted">{noticia.resumen}</p>
              )}

              <div className="d-flex align-items-center text-muted">
                <small>
                  📅 Publicado el {formatearFecha(noticia.fecha_publicacion)}
                </small>
                {noticia.autor && (
                  <>
                    <span className="mx-2">•</span>
                    <small>
                      ✍️ Por {noticia.autor.nombres} {noticia.autor.apellidos}
                    </small>
                  </>
                )}
              </div>
            </div>

            <hr />

            {/* Contenido */}
            <div
              className="noticia-contenido"
              style={{ fontSize: '1.1rem', lineHeight: '1.8' }}
              dangerouslySetInnerHTML={{ __html: noticia.contenido }}
            />

            <hr className="my-4" />

            {/* Sección de Reacciones */}
            <div className="reacciones-section" style={{
              background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
              padding: '2rem',
              borderRadius: '16px',
              marginBottom: '2rem'
            }}>
              <h5 className="mb-3 text-center fw-bold" style={{ color: '#154765' }}>
                ¿Qué te pareció esta noticia?
              </h5>
              <div className="reacciones-buttons mb-4">
                <button
                  className={`btn-reaccion ${miReaccion === 'me_gusta' ? 'activo me-gusta' : ''}`}
                  onClick={() => handleReaccion('me_gusta')}
                  disabled={loadingReaccion}
                  style={{
                    background: miReaccion === 'me_gusta' ? '#10b981' : 'white',
                    color: miReaccion === 'me_gusta' ? 'white' : '#374151',
                    border: `2px solid ${miReaccion === 'me_gusta' ? '#10b981' : '#d1d5db'}`,
                    padding: '1rem 2rem',
                    borderRadius: '50px',
                    fontSize: '1.2rem',
                    fontWeight: '600',
                    cursor: loadingReaccion ? 'wait' : 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: miReaccion === 'me_gusta' ? '0 4px 12px rgba(16, 185, 129, 0.4)' : '0 2px 8px rgba(0,0,0,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    transform: miReaccion === 'me_gusta' ? 'scale(1.05)' : 'scale(1)',
                    flex: '1 1 240px',
                    maxWidth: '340px',
                    width: '100%',
                    justifyContent: 'center'
                  }}
                >
                  <span style={{ fontSize: '1.5rem' }}>👍</span>
                  <span>Me gusta</span>
                  <span className="badge" style={{
                    background: miReaccion === 'me_gusta' ? 'rgba(255,255,255,0.3)' : '#e5e7eb',
                    color: miReaccion === 'me_gusta' ? 'white' : '#374151',
                    padding: '0.25rem 0.6rem',
                    borderRadius: '20px',
                    fontSize: '0.9rem'
                  }}>
                    {reacciones.meGusta}
                  </span>
                </button>

                <button
                  className={`btn-reaccion ${miReaccion === 'no_me_gusta' ? 'activo no-me-gusta' : ''}`}
                  onClick={() => handleReaccion('no_me_gusta')}
                  disabled={loadingReaccion}
                  style={{
                    background: miReaccion === 'no_me_gusta' ? '#ef4444' : 'white',
                    color: miReaccion === 'no_me_gusta' ? 'white' : '#374151',
                    border: `2px solid ${miReaccion === 'no_me_gusta' ? '#ef4444' : '#d1d5db'}`,
                    padding: '1rem 2rem',
                    borderRadius: '50px',
                    fontSize: '1.2rem',
                    fontWeight: '600',
                    cursor: loadingReaccion ? 'wait' : 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: miReaccion === 'no_me_gusta' ? '0 4px 12px rgba(239, 68, 68, 0.4)' : '0 2px 8px rgba(0,0,0,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    transform: miReaccion === 'no_me_gusta' ? 'scale(1.05)' : 'scale(1)',
                    flex: '1 1 240px',
                    maxWidth: '340px',
                    width: '100%',
                    justifyContent: 'center'
                  }}
                >
                  <span style={{ fontSize: '1.5rem' }}>👎</span>
                  <span>No me gusta</span>
                  <span className="badge" style={{
                    background: miReaccion === 'no_me_gusta' ? 'rgba(255,255,255,0.3)' : '#e5e7eb',
                    color: miReaccion === 'no_me_gusta' ? 'white' : '#374151',
                    padding: '0.25rem 0.6rem',
                    borderRadius: '20px',
                    fontSize: '0.9rem'
                  }}>
                    {reacciones.noMeGusta}
                  </span>
                </button>
              </div>

              {/* Estadísticas */}
              <div className="text-center">
                <small className="text-muted">
                  {reacciones.total > 0 ? (
                    <>
                      <strong>{reacciones.total}</strong> {reacciones.total === 1 ? 'persona ha reaccionado' : 'personas han reaccionado'} a esta noticia
                    </>
                  ) : (
                    'Sé el primero en reaccionar a esta noticia'
                  )}
                </small>
              </div>
            </div>

            {/* Footer */}
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <small className="text-muted">
                  Publicado el {formatearFecha(noticia.fecha_publicacion)}
                </small>
              </div>
              <Link href="/noticias" className="btn btn-primary">
                Ver más noticias
              </Link>
            </div>
          </div>
        </div>

        {/* Compartir / Acciones */}
        <div className="card mt-3">
          <div className="card-body">
            <h6 className="card-title">Compartir esta noticia</h6>
            <div className="d-flex gap-2">
              <button
                className="btn btn-sm btn-outline-primary"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Link copiado al portapapeles');
                }}
              >
                🔗 Copiar Link
              </button>
              <button
                className="btn btn-sm btn-outline-success"
                onClick={() => {
                  const text = `${noticia.titulo} - ${window.location.href}`;
                  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                }}
              >
                💬 WhatsApp
              </button>
              <button
                className="btn btn-sm btn-outline-info"
                onClick={() => {
                  const mailto = `mailto:?subject=${encodeURIComponent(noticia.titulo)}&body=${encodeURIComponent(window.location.href)}`;
                  window.location.href = mailto;
                }}
              >
                📧 Email
              </button>
            </div>
          </div>
        </div>
      </article>

      {/* Modal de Imagen en Grande */}
      {showImageModal && noticia.imagen_url && (
        <div
          className="image-modal"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.95)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            cursor: 'pointer',
            animation: 'fadeIn 0.2s ease'
          }}
          onClick={() => setShowImageModal(false)}
        >
          <button
            style={{
              position: 'absolute',
              top: '1.5rem',
              right: '1.5rem',
              background: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '50px',
              height: '50px',
              fontSize: '1.5rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              transition: 'transform 0.2s ease',
              zIndex: 10000
            }}
            onClick={(e) => {
              e.stopPropagation();
              setShowImageModal(false);
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            ✕
          </button>
          <img
            src={noticia.imagen_url}
            alt={noticia.titulo}
            style={{
              maxWidth: '95%',
              maxHeight: '95%',
              objectFit: 'contain',
              borderRadius: '8px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
            }}
            onClick={(e) => e.stopPropagation()}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '2rem',
              left: '50%',
              transform: 'translateX(-50%)',
              color: 'white',
              background: 'rgba(0,0,0,0.7)',
              padding: '0.75rem 1.5rem',
              borderRadius: '30px',
              fontSize: '0.9rem',
              backdropFilter: 'blur(10px)'
            }}
          >
            Click en cualquier lugar para cerrar
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .noticia-hero-image:hover {
          transform: scale(1.02);
        }

        .image-overlay:hover {
          opacity: 1 !important;
        }

        /* Efecto hover en el contenedor */
        .mb-4:hover .image-overlay {
          opacity: 1;
        }

        /* Efectos hover para botones de reacción */
        .btn-reaccion:not(:disabled):hover {
          transform: scale(1.08) !important;
          box-shadow: 0 6px 20px rgba(0,0,0,0.15) !important;
        }

        .btn-reaccion:not(:disabled):active {
          transform: scale(1.02) !important;
        }

        /* Responsividad para reacciones */
        .reacciones-buttons {
          display: flex;
          justify-content: center;
          gap: 1.25rem;
          flex-wrap: wrap;
        }

        .reacciones-buttons .btn-reaccion {
          width: 100%;
          justify-content: center;
        }

        @media (max-width: 768px) {
          .reacciones-buttons {
            flex-direction: column;
            align-items: stretch;
          }

          .btn-reaccion {
            padding: 0.85rem 1.25rem !important;
            font-size: 1rem !important;
            border-radius: 32px !important;
          }
        }

        @media (max-width: 480px) {
          .btn-reaccion {
            font-size: 0.95rem !important;
            gap: 0.4rem !important;
          }

          .btn-reaccion span:first-child {
            font-size: 1.3rem !important;
          }

          .btn-reaccion .badge {
            font-size: 0.8rem !important;
          }
        }

        /* Estilos para contenido HTML rico */
        :global(.noticia-contenido) {
          width: 100%;
        }

        :global(.noticia-contenido p) {
          margin-bottom: 1rem;
          line-height: 1.8;
        }

        :global(.noticia-contenido p:has(img)) {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        :global(.noticia-contenido img),
        :global(.noticia-contenido p img) {
          width: 100% !important;
          max-width: 680px;
          height: auto !important;
          border-radius: 16px;
          margin: 1.25rem auto;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
          display: block;
          object-fit: cover;
        }

        :global(.noticia-contenido img[data-align='left']) {
          margin-left: 0;
          margin-right: auto;
        }

        :global(.noticia-contenido img[data-align='right']) {
          margin-right: 0;
          margin-left: auto;
        }

        :global(.noticia-contenido h1) {
          font-size: 2em;
          font-weight: 700;
          margin-top: 2rem;
          margin-bottom: 1rem;
          color: #154765;
        }

        :global(.noticia-contenido h2) {
          font-size: 1.5em;
          font-weight: 600;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          color: #154765;
        }

        :global(.noticia-contenido h3) {
          font-size: 1.25em;
          font-weight: 600;
          margin-top: 1.25rem;
          margin-bottom: 0.5rem;
          color: #154765;
        }

        :global(.noticia-contenido ul),
        :global(.noticia-contenido ol) {
          padding-left: 2rem;
          margin-bottom: 1rem;
        }

        :global(.noticia-contenido li) {
          margin-bottom: 0.5rem;
          line-height: 1.6;
        }

        :global(.noticia-contenido a) {
          color: #2563eb;
          text-decoration: underline;
        }

        :global(.noticia-contenido a:hover) {
          color: #1d4ed8;
        }

        :global(.noticia-contenido strong) {
          font-weight: 700;
        }

        :global(.noticia-contenido em) {
          font-style: italic;
        }

        :global(.noticia-contenido u) {
          text-decoration: underline;
        }

        :global(.noticia-contenido s) {
          text-decoration: line-through;
        }

        @media (max-width: 768px) {
          :global(.noticia-contenido img) {
            max-width: 100%;
            margin: 1rem 0;
          }
        }
      `}</style>
    </div>
  );
}
