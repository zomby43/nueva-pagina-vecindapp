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
      deportiva: 'bi-trophy-fill',
      cultural: 'bi-palette-fill',
      educativa: 'bi-book-fill',
      social: 'bi-people-fill',
      ambiental: 'bi-tree-fill',
      salud: 'bi-heart-pulse-fill',
      recreativa: 'bi-balloon-fill',
      otro: 'bi-pin-fill'
    };
    return iconos[categoria] || 'bi-pin-fill';
  };

  const getEstadoBadge = (estado) => {
    const badges = {
      publicada: { bg: '#0dcaf0', text: 'white', label: 'Publicada', icon: 'bi-megaphone-fill' },
      en_curso: { bg: '#198754', text: 'white', label: 'En Curso', icon: 'bi-arrow-repeat' }
    };
    return badges[estado] || { bg: '#6c757d', text: 'white', label: estado, icon: 'bi-circle-fill' };
  };

  const getTipoIcon = (tipo) => {
    const iconos = {
      presencial: 'bi-geo-alt-fill',
      virtual: 'bi-laptop-fill',
      hibrida: 'bi-arrow-left-right'
    };
    return iconos[tipo] || 'bi-geo-alt-fill';
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
      <div className="text-center mb-5 vecino-page-header">
        <h1 className="fw-bold mb-3"><i className="bi bi-calendar-event me-2"></i>Actividades Vecinales</h1>
        <p className="text-muted vecino-text-base">Participa en las actividades de nuestra comunidad</p>
      </div>

      {error && (
        <div className="alert alert-danger mb-5 vecino-alert">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Estadísticas rápidas */}
      <div className="row g-3 mb-5">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm text-center vecino-card">
            <div className="card-body py-4">
              <div className="vecino-text-lg fw-bold text-primary" style={{ fontSize: '2.5rem' }}>{actividadesFiltradas.length}</div>
              <span className="text-dark fw-semibold vecino-text-sm">Total Actividades</span>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm text-center vecino-card">
            <div className="card-body py-4">
              <div className="vecino-text-lg fw-bold" style={{ color: '#0dcaf0', fontSize: '2.5rem' }}>{actividadesPublicadas.length}</div>
              <span className="text-dark fw-semibold vecino-text-sm">Publicadas</span>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm text-center vecino-card">
            <div className="card-body py-4">
              <div className="vecino-text-lg fw-bold text-success" style={{ fontSize: '2.5rem' }}>{actividadesEnCurso.length}</div>
              <span className="text-dark fw-semibold vecino-text-sm">En Curso</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="card shadow-sm border-0 mb-5 vecino-card">
        <div className="card-body">
          <div className="row align-items-center g-4">
            <div className="col-12 col-md-6">
              <div className="vecino-form-group">
                <label htmlFor="busqueda" className="form-label vecino-form-label">
                  <i className="bi bi-search me-2"></i>Buscar:
                </label>
                <input
                  type="text"
                  id="busqueda"
                  className="form-control vecino-form-control"
                  placeholder="Buscar actividad..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>
            </div>
            <div className="col-12 col-md-6">
              <div className="vecino-form-group">
                <label htmlFor="filtroCategoria" className="form-label vecino-form-label">
                  <i className="bi bi-folder me-2"></i>Categoría:
                </label>
                <select
                  id="filtroCategoria"
                  className="form-select vecino-form-select"
                  value={filtroCategoria}
                  onChange={(e) => setFiltroCategoria(e.target.value)}
                >
                  <option value="todas">Todas las categorías</option>
                  <option value="deportiva">Deportiva</option>
                  <option value="cultural">Cultural</option>
                  <option value="educativa">Educativa</option>
                  <option value="social">Social</option>
                  <option value="ambiental">Ambiental</option>
                  <option value="salud">Salud</option>
                  <option value="recreativa">Recreativa</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
            </div>
            <div className="col-12 text-center">
              <Link href="/actividades/mis-inscripciones" className="btn btn-primary vecino-btn">
                <i className="bi bi-clipboard-check me-2"></i>Mis Inscripciones
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Actividades */}
      {actividadesFiltradas.length === 0 ? (
        <div className="card border-0 shadow-sm text-center py-5 vecino-card">
          <div className="card-body">
            <div className="vecino-icon-lg mb-3" style={{ fontSize: '3rem' }}>
              <i className="bi bi-search"></i>
            </div>
            <h3 className="vecino-text-base">No hay actividades disponibles</h3>
            <p className="text-muted vecino-text-base">
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
                  className="card h-100 shadow border-0 vecino-card"
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
                        className="badge vecino-badge"
                        style={{
                          backgroundColor: categoriaColor,
                          color: 'white',
                          padding: '0.5rem 1rem'
                        }}
                      >
                        <i className={`bi ${getCategoriaIcon(actividad.categoria)} me-1`}></i>{getCategoriaTexto(actividad.categoria)}
                      </span>
                      <span
                        className="badge vecino-badge"
                        style={{
                          backgroundColor: estadoBadge.bg,
                          color: estadoBadge.text
                        }}
                      >
                        <i className={`bi ${estadoBadge.icon} me-1`}></i>{estadoBadge.label}
                      </span>
                    </div>

                    {/* Título */}
                    <h3 className="card-title fw-bold mb-3 vecino-text-lg">
                      {actividad.titulo}
                    </h3>

                    {/* Descripción */}
                    <p className="card-text text-muted mb-4 vecino-text-base">
                      {actividad.descripcion.length > 120
                        ? actividad.descripcion.substring(0, 120) + '...'
                        : actividad.descripcion}
                    </p>

                    {/* Información de la actividad */}
                    <div className="mb-4 vecino-text-sm">
                      <div className="d-flex align-items-center mb-2">
                        <i className="bi bi-calendar3 me-2"></i>
                        <span><strong>Inicio:</strong> {formatearFecha(actividad.fecha_inicio)}</span>
                      </div>
                      <div className="d-flex align-items-center mb-2">
                        <i className={`bi ${getTipoIcon(actividad.tipo)} me-2`}></i>
                        <span><strong>Modalidad:</strong> {getTipoTexto(actividad.tipo)}</span>
                      </div>
                      {actividad.ubicacion && (
                        <div className="d-flex align-items-center mb-2">
                          <i className="bi bi-geo-alt-fill me-2"></i>
                          <span><strong>Lugar:</strong> {actividad.ubicacion}</span>
                        </div>
                      )}
                    </div>

                    {/* Cupos disponibles */}
                    <div className="mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="text-muted vecino-text-sm">Cupos</span>
                        <span className="fw-semibold vecino-text-sm">
                          {cuposDisponibles} de {cupoMaximo} disponibles
                        </span>
                      </div>
                      <div className="progress" style={{ height: '10px' }}>
                        <div
                          className={`progress-bar ${porcentajeOcupacion >= 90 ? 'bg-danger' : porcentajeOcupacion >= 70 ? 'bg-warning' : 'bg-success'}`}
                          role="progressbar"
                          style={{ width: `${porcentajeOcupacion}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Costo */}
                    {!actividad.es_gratuita && actividad.costo > 0 && (
                      <div className="alert alert-warning py-2 mb-3 vecino-text-sm">
                        <i className="bi bi-cash-coin me-1"></i><strong>Costo:</strong> ${actividad.costo.toLocaleString('es-CL')}
                      </div>
                    )}
                    {actividad.es_gratuita && (
                      <div className="alert alert-success py-2 mb-3 vecino-text-sm">
                        <i className="bi bi-check-circle-fill me-1"></i><strong>Actividad gratuita</strong>
                      </div>
                    )}

                    {/* Botón ver detalle */}
                    <Link
                      href={`/actividades/${actividad.id}`}
                      className="btn btn-primary w-100 vecino-btn"
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
