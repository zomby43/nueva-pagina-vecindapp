'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function NoticiaDetallePage() {
  const params = useParams();
  const router = useRouter();
  const [noticia, setNoticia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (params.id) {
      fetchNoticia();
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

      {/* Contenido de la noticia */}
      <article>
        <div className="card">
          <div className="card-body">
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

            {/* Imagen (si existe) */}
            {noticia.imagen_url && (
              <div className="mb-4">
                <img
                  src={noticia.imagen_url}
                  alt={noticia.titulo}
                  className="img-fluid rounded"
                  style={{ maxHeight: '500px', width: '100%', objectFit: 'cover' }}
                />
              </div>
            )}

            {/* Contenido */}
            <div className="noticia-contenido" style={{ fontSize: '1.1rem', lineHeight: '1.8' }}>
              {noticia.contenido.split('\n').map((parrafo, index) => (
                parrafo.trim() ? (
                  <p key={index} className="mb-3">{parrafo}</p>
                ) : null
              ))}
            </div>

            <hr className="my-4" />

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
    </div>
  );
}
