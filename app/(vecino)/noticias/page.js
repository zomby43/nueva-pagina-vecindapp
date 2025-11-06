'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { getReaccionesMultiples } from '@/lib/reacciones/noticiasReacciones';

export default function NoticiasPage() {
  const [noticias, setNoticias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('todas');
  const [reaccionesStats, setReaccionesStats] = useState({});

  useEffect(() => {
    fetchNoticias();
  }, []);

  const fetchNoticias = async () => {
    try {
      setLoading(true);
      setError('');
      const supabase = createClient();

      const { data, error } = await supabase
        .from('noticias')
        .select('*')
        .eq('estado', 'publicado')
        .order('destacado', { ascending: false })
        .order('fecha_publicacion', { ascending: false });

      if (error) {
        console.error('Error fetching noticias:', error);
        throw error;
      }

      setNoticias(data || []);

      // Cargar estadísticas de reacciones para todas las noticias
      if (data && data.length > 0) {
        const ids = data.map(n => n.id);
        const stats = await getReaccionesMultiples(ids);
        setReaccionesStats(stats);
      }
    } catch (error) {
      console.error('Error completo:', error);
      setError('Error al cargar las noticias');
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
      day: 'numeric'
    });
  };

  // Función para extraer texto plano del HTML (sin etiquetas) preservando saltos de línea
  const extractPlainText = (html) => {
    if (!html) return '';

    // Reemplazar etiquetas de bloque con saltos de línea antes de extraer texto
    let processedHtml = html
      .replace(/<\/p>/gi, '\n')           // Párrafos
      .replace(/<br\s*\/?>/gi, '\n')       // Saltos de línea
      .replace(/<\/div>/gi, '\n')          // Divs
      .replace(/<\/h[1-6]>/gi, '\n')       // Títulos
      .replace(/<\/li>/gi, '\n')           // Items de lista
      .replace(/<\/tr>/gi, '\n')           // Filas de tabla
      .replace(/<\/blockquote>/gi, '\n');  // Citas

    // Crear un elemento temporal para parsear el HTML
    const temp = document.createElement('div');
    temp.innerHTML = processedHtml;

    // Obtener solo el texto sin etiquetas
    let text = temp.textContent || temp.innerText || '';

    // Limpiar múltiples saltos de línea consecutivos
    text = text.replace(/\n\s*\n\s*\n/g, '\n\n');

    // Limpiar espacios al inicio y final
    text = text.trim();

    return text;
  };

  const noticiasFiltradas = noticias.filter(noticia => {
    if (filtroCategoria !== 'todas' && noticia.categoria !== filtroCategoria) return false;
    return true;
  });

  const noticiasDestacadas = noticiasFiltradas.filter(n => n.destacado).slice(0, 3);
  const noticiasRegulares = noticiasFiltradas.filter(n => !n.destacado);

  if (loading) {
    return (
      <div className="page-container">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="text-center">
            <div className="spinner-border mb-3" role="status"></div>
            <p>Cargando noticias...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', maxWidth: '100%', padding: '2rem', background: '#f4f8f9', borderRadius: '16px' }}>
      <div className="text-center mb-5">
        <h1 className="display-5 fw-bold mb-3">Noticias de la Junta de Vecinos</h1>
        <p className="lead text-muted">Mantente informado sobre las novedades de nuestra comunidad</p>
      </div>

      {error && (
        <div className="alert alert-danger mb-5">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Filtro de categorías */}
      <div className="card shadow-sm border-0 mb-5">
        <div className="card-body p-4">
          <div className="row align-items-center g-3">
            <div className="col-md-8">
              <label htmlFor="filtroCategoria" className="form-label fw-semibold mb-2">
                Filtrar por categoría:
              </label>
              <select
                id="filtroCategoria"
                className="form-select form-select-lg"
                value={filtroCategoria}
                onChange={(e) => setFiltroCategoria(e.target.value)}
              >
                <option value="todas">Todas las categorías</option>
                <option value="general">General</option>
                <option value="eventos">Eventos</option>
                <option value="obras">Obras</option>
                <option value="seguridad">Seguridad</option>
                <option value="medio_ambiente">Medio Ambiente</option>
                <option value="cultura">Cultura</option>
                <option value="deportes">Deportes</option>
                <option value="otro">Otro</option>
              </select>
            </div>
            <div className="col-md-4 text-md-end">
              <div className="badge bg-light text-dark fs-6 p-3">
                {noticiasFiltradas.length} {noticiasFiltradas.length === 1 ? 'noticia' : 'noticias'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {noticiasFiltradas.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-5">
            <div className="empty-icon mb-3" style={{ fontSize: '3rem' }}>📰</div>
            <h5>No hay noticias disponibles</h5>
            <p className="text-muted">
              {filtroCategoria === 'todas'
                ? 'Aún no se han publicado noticias'
                : `No hay noticias en la categoría "${getCategoriaTexto(filtroCategoria)}"`
              }
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Noticias Destacadas */}
          {noticiasDestacadas.length > 0 && (
            <div className="mb-5">
              <h3 className="mb-4 d-flex align-items-center">
                <span className="badge bg-warning text-dark me-2 px-3 py-2">⭐</span>
                <span>Noticias Destacadas</span>
              </h3>
              <div className="row g-4">
                {noticiasDestacadas.map((noticia) => (
                  <div
                    key={noticia.id}
                    className={`col-12 ${
                      noticiasDestacadas.length === 1 ? 'col-lg-12' :
                      noticiasDestacadas.length === 2 ? 'col-lg-6' :
                      'col-md-6 col-lg-4'
                    }`}
                  >
                    <div className="card h-100 shadow border-warning noticia-card-destacada" style={{ borderWidth: '3px', transition: 'transform 0.2s, box-shadow 0.2s', padding: 0, overflow: 'hidden' }}>
                      {/* Imagen de portada */}
                      {noticia.imagen_url && (
                        <div style={{ position: 'relative', overflow: 'hidden' }}>
                          <img
                            src={noticia.imagen_url}
                            alt={noticia.titulo}
                            className="noticia-card-image"
                            style={{
                              width: '100%',
                              aspectRatio: '16/9',
                              objectFit: 'cover',
                              display: 'block',
                              margin: 0,
                              transition: 'transform 0.3s ease'
                            }}
                            loading="lazy"
                          />
                        </div>
                      )}
                      <div className="card-body d-flex flex-column p-4">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <span className={`badge ${getCategoriaBadge(noticia.categoria)} px-3 py-2`}>
                            {getCategoriaTexto(noticia.categoria)}
                          </span>
                          <span className="badge bg-warning text-dark px-3 py-2">⭐ Destacada</span>
                        </div>
                        <h5 className="card-title fw-bold mb-3">{noticia.titulo}</h5>
                        {noticia.resumen && (
                          <p className="card-text text-muted mb-3" style={{ fontSize: '0.95rem' }}>
                            {noticia.resumen}
                          </p>
                        )}
                        <p className="card-text mb-4 flex-grow-1" style={{ fontSize: '0.9rem', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                          {(() => {
                            const plainText = extractPlainText(noticia.contenido);
                            return plainText.length > 150
                              ? `${plainText.substring(0, 150)}...`
                              : plainText;
                          })()}
                        </p>
                        {/* Reacciones preview */}
                        {reaccionesStats[noticia.id] && reaccionesStats[noticia.id].total > 0 && (
                          <div className="mb-3 d-flex gap-3" style={{ fontSize: '0.9rem' }}>
                            <span className="d-flex align-items-center gap-1" style={{ color: '#10b981' }}>
                              👍 <strong>{reaccionesStats[noticia.id].meGusta}</strong>
                            </span>
                            <span className="d-flex align-items-center gap-1" style={{ color: '#ef4444' }}>
                              👎 <strong>{reaccionesStats[noticia.id].noMeGusta}</strong>
                            </span>
                            <span className="text-muted">
                              · {reaccionesStats[noticia.id].total} {reaccionesStats[noticia.id].total === 1 ? 'reacción' : 'reacciones'}
                            </span>
                          </div>
                        )}
                        <div className="d-flex justify-content-between align-items-center mt-auto pt-3 border-top">
                          <small className="text-muted">
                            📅 {formatearFecha(noticia.fecha_publicacion)}
                          </small>
                          <Link
                            href={`/noticias/${noticia.id}`}
                            className="btn btn-primary"
                          >
                            Leer más
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Noticias Regulares */}
          {noticiasRegulares.length > 0 && (
            <div>
              <h3 className="mb-4 d-flex align-items-center">
                <span className="badge bg-primary me-2 px-3 py-2">📰</span>
                <span>Todas las Noticias</span>
              </h3>
              <div className="row g-4">
                {noticiasRegulares.map((noticia) => (
                  <div key={noticia.id} className="col-12 col-lg-6">
                    <div className="card h-100 shadow-sm border-0 noticia-card-regular" style={{ transition: 'transform 0.2s, box-shadow 0.2s', padding: 0, overflow: 'hidden' }}>
                      {/* Imagen de portada */}
                      {noticia.imagen_url && (
                        <div style={{ position: 'relative', overflow: 'hidden' }}>
                          <img
                            src={noticia.imagen_url}
                            alt={noticia.titulo}
                            className="noticia-card-image"
                            style={{
                              width: '100%',
                              aspectRatio: '16/9',
                              objectFit: 'cover',
                              display: 'block',
                              margin: 0,
                              transition: 'transform 0.3s ease'
                            }}
                            loading="lazy"
                          />
                        </div>
                      )}
                      <div className="card-body d-flex flex-column p-4">
                        <div className="mb-3">
                          <span className={`badge ${getCategoriaBadge(noticia.categoria)} px-3 py-2`}>
                            {getCategoriaTexto(noticia.categoria)}
                          </span>
                        </div>
                        <h5 className="card-title fw-bold mb-3">{noticia.titulo}</h5>
                        {noticia.resumen && (
                          <p className="card-text text-muted mb-3" style={{ fontSize: '0.95rem' }}>
                            {noticia.resumen}
                          </p>
                        )}
                        <p className="card-text mb-4 flex-grow-1" style={{ fontSize: '0.9rem', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                          {(() => {
                            const plainText = extractPlainText(noticia.contenido);
                            return plainText.length > 120
                              ? `${plainText.substring(0, 120)}...`
                              : plainText;
                          })()}
                        </p>
                        {/* Reacciones preview */}
                        {reaccionesStats[noticia.id] && reaccionesStats[noticia.id].total > 0 && (
                          <div className="mb-3 d-flex gap-3" style={{ fontSize: '0.9rem' }}>
                            <span className="d-flex align-items-center gap-1" style={{ color: '#10b981' }}>
                              👍 <strong>{reaccionesStats[noticia.id].meGusta}</strong>
                            </span>
                            <span className="d-flex align-items-center gap-1" style={{ color: '#ef4444' }}>
                              👎 <strong>{reaccionesStats[noticia.id].noMeGusta}</strong>
                            </span>
                            <span className="text-muted">
                              · {reaccionesStats[noticia.id].total} {reaccionesStats[noticia.id].total === 1 ? 'reacción' : 'reacciones'}
                            </span>
                          </div>
                        )}
                        <div className="d-flex justify-content-between align-items-center mt-auto pt-3 border-top">
                          <small className="text-muted">
                            📅 {formatearFecha(noticia.fecha_publicacion)}
                          </small>
                          <Link
                            href={`/noticias/${noticia.id}`}
                            className="btn btn-outline-primary"
                          >
                            Leer más
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <style jsx>{`
        /* Efectos hover para cards de noticias */
        .noticia-card-destacada:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 32px rgba(0,0,0,0.15) !important;
        }

        .noticia-card-regular:hover {
          transform: translateY(-6px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.12) !important;
        }

        .noticia-card-destacada:hover .noticia-card-image,
        .noticia-card-regular:hover .noticia-card-image {
          transform: scale(1.08);
        }

        /* Animación suave en cards */
        .noticia-card-destacada,
        .noticia-card-regular {
          cursor: pointer;
        }

        /* Mejora visual en hover de badges */
        .card:hover .badge {
          transform: scale(1.05);
          transition: transform 0.2s ease;
        }
      `}</style>
    </div>
  );
}
