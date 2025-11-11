'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function ActividadesPage() {
  const [actividades, setActividades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('todas');
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    fetchActividades();
  }, []);

  const fetchActividades = async () => {
    try {
      setLoading(true);
      setError('');
      const supabase = createClient();

      const { data, error } = await supabase
        .from('actividades')
        .select(`
          *,
          organizador:organizador_id (
            nombres,
            apellidos
          )
        `)
        .in('estado', ['publicada', 'en_curso'])
        .order('fecha_inicio', { ascending: true });

      if (error) throw error;
      setActividades(data || []);
    } catch (error) {
      console.error('Error fetching actividades:', error);
      setError('Error al cargar las actividades');
    } finally {
      setLoading(false);
    }
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-CL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCategoriaColor = (categoria) => {
    const colores = {
      deportiva: '#dc3545',
      cultural: '#6f42c1',
      educativa: '#0dcaf0',
      social: '#20c997',
      ambiental: '#198754',
      salud: '#fd7e14',
      recreativa: '#ffc107',
      otro: '#6c757d'
    };
    return colores[categoria] || '#6c757d';
  };

  const getCategoriaTexto = (categoria) => {
    const textos = {
      deportiva: 'Deportiva',
      cultural: 'Cultural',
      educativa: 'Educativa',
      social: 'Social',
      ambiental: 'Ambiental',
      salud: 'Salud',
      recreativa: 'Recreativa',
      otro: 'Otro'
    };
    return textos[categoria] || categoria;
  };

  const getCategoriaIcon = (categoria) => {
    const iconos = {
      deportiva: '⚽',
      cultural: '🎨',
      educativa: '📚',
      social: '🤝',
      ambiental: '🌱',
      salud: '❤️',
      recreativa: '🎉',
      otro: '📌'
    };
    return iconos[categoria] || '📌';
  };

  const getEstadoBadge = (estado) => {
    const badges = {
      publicada: { bg: '#0dcaf0', text: 'white', label: '📢 Publicada' },
      en_curso: { bg: '#198754', text: 'white', label: '🔄 En Curso' }
    };
    return badges[estado] || { bg: '#6c757d', text: 'white', label: estado };
  };

  const getTipoIcon = (tipo) => {
    const iconos = {
      presencial: '📍',
      virtual: '💻',
      hibrida: '🔄'
    };
    return iconos[tipo] || '📍';
  };

  const getTipoTexto = (tipo) => {
    const textos = {
      presencial: 'Presencial',
      virtual: 'Virtual',
      hibrida: 'Híbrida'
    };
    return textos[tipo] || tipo;
  };

  const actividadesFiltradas = actividades.filter(actividad => {
    if (filtroCategoria !== 'todas' && actividad.categoria !== filtroCategoria) return false;
    if (busqueda && !actividad.titulo.toLowerCase().includes(busqueda.toLowerCase()) &&
        !actividad.descripcion.toLowerCase().includes(busqueda.toLowerCase())) return false;
    return true;
  });

  const actividadesPublicadas = actividadesFiltradas.filter(a => a.estado === 'publicada');
  const actividadesEnCurso = actividadesFiltradas.filter(a => a.estado === 'en_curso');

  if (loading) {
    return (
      <div style={{ width: '100%', maxWidth: '100%', padding: '2rem', background: '#f4f8f9', borderRadius: '16px' }}>
        <div className="text-center py-5">
          <div className="spinner-border mb-3" role="status"></div>
          <p>Cargando actividades...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', maxWidth: '100%', padding: '2rem', background: '#f4f8f9', borderRadius: '16px' }}>
      <div className="text-center mb-5">
        <h1 className="display-5 fw-bold mb-3"><i className="bi bi-calendar-event me-2"></i>Actividades Vecinales</h1>
        <p className="lead text-muted">Participa en las actividades de nuestra comunidad</p>
      </div>

      {error && (
        <div className="alert alert-danger mb-5">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Estadísticas rápidas */}
      <div className="row g-3 mb-5">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm text-center">
            <div className="card-body py-4">
              <div className="fs-1 fw-bold text-primary">{actividadesFiltradas.length}</div>
              <small className="text-muted">Total Actividades</small>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm text-center">
            <div className="card-body py-4">
              <div className="fs-1 fw-bold" style={{ color: '#0dcaf0' }}>{actividadesPublicadas.length}</div>
              <small className="text-muted">Publicadas</small>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm text-center">
            <div className="card-body py-4">
              <div className="fs-1 fw-bold text-success">{actividadesEnCurso.length}</div>
              <small className="text-muted">En Curso</small>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="card shadow-sm border-0 mb-5">
        <div className="card-body p-4">
          <div className="row align-items-center g-3">
            <div className="col-md-4">
              <label htmlFor="busqueda" className="form-label fw-semibold mb-2">
                🔍 Buscar:
              </label>
              <input
                type="text"
                id="busqueda"
                className="form-control form-control-lg"
                placeholder="Buscar actividad..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <label htmlFor="filtroCategoria" className="form-label fw-semibold mb-2">
                📂 Categoría:
              </label>
              <select
                id="filtroCategoria"
                className="form-select form-select-lg"
                value={filtroCategoria}
                onChange={(e) => setFiltroCategoria(e.target.value)}
              >
                <option value="todas">Todas las categorías</option>
                <option value="deportiva">⚽ Deportiva</option>
                <option value="cultural">🎨 Cultural</option>
                <option value="educativa">📚 Educativa</option>
                <option value="social">🤝 Social</option>
                <option value="ambiental">🌱 Ambiental</option>
                <option value="salud">❤️ Salud</option>
                <option value="recreativa">🎉 Recreativa</option>
                <option value="otro">📌 Otro</option>
              </select>
            </div>
            <div className="col-md-4 text-md-end mt-auto">
              <Link href="/actividades/mis-inscripciones" className="btn btn-primary btn-lg">
                📋 Mis Inscripciones
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Actividades */}
      {actividadesFiltradas.length === 0 ? (
        <div className="card border-0 shadow-sm text-center py-5">
          <div className="card-body">
            <div className="fs-1 mb-3">🔍</div>
            <h3>No hay actividades disponibles</h3>
            <p className="text-muted">
              {busqueda || filtroCategoria !== 'todas'
                ? 'Intenta cambiar los filtros de búsqueda'
                : 'Por el momento no hay actividades publicadas'}
            </p>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          {actividadesFiltradas.map((actividad) => {
            const estadoBadge = getEstadoBadge(actividad.estado);
            const categoriaColor = getCategoriaColor(actividad.categoria);
            const cuposDisponibles = actividad.cupo_disponible || 0;
            const cupoMaximo = actividad.cupo_maximo || 0;
            const porcentajeOcupacion = cupoMaximo > 0 ? ((cupoMaximo - cuposDisponibles) / cupoMaximo) * 100 : 0;

            return (
              <div key={actividad.id} className="col-lg-6">
                <div
                  className="card h-100 shadow border-0"
                  style={{
                    borderLeft: `6px solid ${categoriaColor}`,
                    transition: 'transform 0.2s, box-shadow 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.12)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
                  }}
                >
                  <div className="card-body p-4">
                    {/* Header con categoría y estado */}
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <span
                        className="badge"
                        style={{
                          backgroundColor: categoriaColor,
                          color: 'white',
                          fontSize: '0.85rem',
                          padding: '0.5rem 1rem'
                        }}
                      >
                        {getCategoriaIcon(actividad.categoria)} {getCategoriaTexto(actividad.categoria)}
                      </span>
                      <span
                        className="badge"
                        style={{
                          backgroundColor: estadoBadge.bg,
                          color: estadoBadge.text,
                          fontSize: '0.8rem'
                        }}
                      >
                        {estadoBadge.label}
                      </span>
                    </div>

                    {/* Título */}
                    <h3 className="card-title fw-bold mb-3" style={{ fontSize: '1.4rem' }}>
                      {actividad.titulo}
                    </h3>

                    {/* Descripción */}
                    <p className="card-text text-muted mb-4" style={{ fontSize: '0.95rem' }}>
                      {actividad.descripcion.length > 120
                        ? actividad.descripcion.substring(0, 120) + '...'
                        : actividad.descripcion}
                    </p>

                    {/* Información de la actividad */}
                    <div className="mb-4" style={{ fontSize: '0.9rem' }}>
                      <div className="d-flex align-items-center mb-2">
                        <span className="me-2">📅</span>
                        <span><strong>Inicio:</strong> {formatearFecha(actividad.fecha_inicio)}</span>
                      </div>
                      <div className="d-flex align-items-center mb-2">
                        <span className="me-2">{getTipoIcon(actividad.tipo)}</span>
                        <span><strong>Modalidad:</strong> {getTipoTexto(actividad.tipo)}</span>
                      </div>
                      {actividad.ubicacion && (
                        <div className="d-flex align-items-center mb-2">
                          <span className="me-2">📍</span>
                          <span><strong>Lugar:</strong> {actividad.ubicacion}</span>
                        </div>
                      )}
                    </div>

                    {/* Cupos disponibles */}
                    <div className="mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <small className="text-muted">Cupos</small>
                        <small className="fw-semibold">
                          {cuposDisponibles} de {cupoMaximo} disponibles
                        </small>
                      </div>
                      <div className="progress" style={{ height: '8px' }}>
                        <div
                          className={`progress-bar ${porcentajeOcupacion >= 90 ? 'bg-danger' : porcentajeOcupacion >= 70 ? 'bg-warning' : 'bg-success'}`}
                          role="progressbar"
                          style={{ width: `${porcentajeOcupacion}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Costo */}
                    {!actividad.es_gratuita && actividad.costo > 0 && (
                      <div className="alert alert-warning py-2 mb-3" style={{ fontSize: '0.9rem' }}>
                        💰 <strong>Costo:</strong> ${actividad.costo.toLocaleString('es-CL')}
                      </div>
                    )}
                    {actividad.es_gratuita && (
                      <div className="alert alert-success py-2 mb-3" style={{ fontSize: '0.9rem' }}>
                        ✅ <strong>Actividad gratuita</strong>
                      </div>
                    )}

                    {/* Botón ver detalle */}
                    <Link
                      href={`/actividades/${actividad.id}`}
                      className="btn btn-primary w-100"
                      style={{ backgroundColor: categoriaColor, border: 'none' }}
                    >
                      Ver Detalles e Inscribirse
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
