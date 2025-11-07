/**
 * Helper para consultar logs de actividad del sistema
 *
 * Este archivo proporciona funciones para obtener y filtrar logs
 * desde la tabla logs_actividad de Supabase.
 *
 * USO:
 * import { getLogs, getLogsByEntidad, getLogsByUsuario } from '@/lib/logs/getLogs';
 *
 * const logs = await getLogs({ limit: 100 });
 * const logsUsuario = await getLogsByUsuario(usuarioId);
 */

import { createClient } from '@/lib/supabase/client';

/**
 * Obtiene logs con filtros opcionales
 *
 * @param {Object} options - Opciones de consulta
 * @param {number} [options.limit=100] - Límite de resultados
 * @param {number} [options.offset=0] - Offset para paginación
 * @param {string} [options.usuarioId] - Filtrar por ID de usuario
 * @param {string} [options.accion] - Filtrar por tipo de acción
 * @param {string} [options.entidad] - Filtrar por tipo de entidad
 * @param {string} [options.entidadId] - Filtrar por ID de entidad específica
 * @param {string} [options.busqueda] - Búsqueda en nombre de usuario o email
 * @param {Date} [options.fechaDesde] - Filtrar desde fecha
 * @param {Date} [options.fechaHasta] - Filtrar hasta fecha
 * @returns {Promise<Object>} - {data, count, error}
 */
export async function getLogs(options = {}) {
  try {
    const {
      limit = 100,
      offset = 0,
      usuarioId,
      accion,
      entidad,
      entidadId,
      busqueda,
      fechaDesde,
      fechaHasta
    } = options;

    const supabase = createClient();

    let query = supabase
      .from('logs_actividad')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    // Aplicar filtros
    if (usuarioId) {
      query = query.eq('usuario_id', usuarioId);
    }

    if (accion) {
      query = query.eq('accion', accion);
    }

    if (entidad) {
      query = query.eq('entidad', entidad);
    }

    if (entidadId) {
      query = query.eq('entidad_id', entidadId);
    }

    if (busqueda) {
      query = query.or(`usuario_nombre.ilike.%${busqueda}%,usuario_email.ilike.%${busqueda}%`);
    }

    if (fechaDesde) {
      query = query.gte('created_at', fechaDesde.toISOString());
    }

    if (fechaHasta) {
      query = query.lte('created_at', fechaHasta.toISOString());
    }

    // Aplicar paginación
    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;

    if (error) {
      console.error('Error al obtener logs:', error);
      return { data: null, count: 0, error };
    }

    return { data, count, error: null };

  } catch (error) {
    console.error('Error en getLogs:', error);
    return { data: null, count: 0, error: error.message };
  }
}

/**
 * Obtiene logs de un usuario específico
 *
 * @param {string} usuarioId - ID del usuario
 * @param {number} [limit=50] - Límite de resultados
 * @returns {Promise<Object>} - {data, error}
 */
export async function getLogsByUsuario(usuarioId, limit = 50) {
  return getLogs({ usuarioId, limit });
}

/**
 * Obtiene logs de una entidad específica
 *
 * @param {string} entidad - Tipo de entidad ('usuario', 'solicitud', etc.)
 * @param {string} [entidadId] - ID específico de la entidad (opcional)
 * @param {number} [limit=50] - Límite de resultados
 * @returns {Promise<Object>} - {data, error}
 */
export async function getLogsByEntidad(entidad, entidadId = null, limit = 50) {
  const options = { entidad, limit };
  if (entidadId) {
    options.entidadId = entidadId;
  }
  return getLogs(options);
}

/**
 * Obtiene logs de una acción específica
 *
 * @param {string} accion - Tipo de acción ('crear', 'editar', 'eliminar', etc.)
 * @param {number} [limit=50] - Límite de resultados
 * @returns {Promise<Object>} - {data, error}
 */
export async function getLogsByAccion(accion, limit = 50) {
  return getLogs({ accion, limit });
}

/**
 * Obtiene los últimos N logs del sistema
 *
 * @param {number} [limit=20] - Número de logs a obtener
 * @returns {Promise<Object>} - {data, error}
 */
export async function getLogsRecientes(limit = 20) {
  return getLogs({ limit });
}

/**
 * Obtiene logs dentro de un rango de fechas
 *
 * @param {Date} fechaDesde - Fecha inicial
 * @param {Date} fechaHasta - Fecha final
 * @param {number} [limit=100] - Límite de resultados
 * @returns {Promise<Object>} - {data, error}
 */
export async function getLogsPorFecha(fechaDesde, fechaHasta, limit = 100) {
  return getLogs({ fechaDesde, fechaHasta, limit });
}

/**
 * Obtiene estadísticas de logs
 *
 * @returns {Promise<Object>} - Estadísticas agrupadas
 */
export async function getEstadisticasLogs() {
  try {
    const supabase = createClient();

    // Obtener contadores por acción
    const { data: porAccion, error: errorAccion } = await supabase
      .from('logs_actividad')
      .select('accion', { count: 'exact' });

    // Obtener contadores por entidad
    const { data: porEntidad, error: errorEntidad } = await supabase
      .from('logs_actividad')
      .select('entidad', { count: 'exact' });

    // Obtener logs de hoy
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const { count: logsHoy, error: errorHoy } = await supabase
      .from('logs_actividad')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', hoy.toISOString());

    // Obtener total de logs
    const { count: totalLogs, error: errorTotal } = await supabase
      .from('logs_actividad')
      .select('*', { count: 'exact', head: true });

    if (errorAccion || errorEntidad || errorHoy || errorTotal) {
      return {
        error: errorAccion || errorEntidad || errorHoy || errorTotal
      };
    }

    // Agrupar contadores
    const contadoresPorAccion = {};
    if (porAccion) {
      porAccion.forEach(log => {
        contadoresPorAccion[log.accion] = (contadoresPorAccion[log.accion] || 0) + 1;
      });
    }

    const contadoresPorEntidad = {};
    if (porEntidad) {
      porEntidad.forEach(log => {
        contadoresPorEntidad[log.entidad] = (contadoresPorEntidad[log.entidad] || 0) + 1;
      });
    }

    return {
      totalLogs: totalLogs || 0,
      logsHoy: logsHoy || 0,
      porAccion: contadoresPorAccion,
      porEntidad: contadoresPorEntidad,
      error: null
    };

  } catch (error) {
    console.error('Error en getEstadisticasLogs:', error);
    return { error: error.message };
  }
}

/**
 * Obtiene el historial completo de cambios de un registro
 * Útil para mostrar timeline de cambios
 *
 * @param {string} entidad - Tipo de entidad
 * @param {string} entidadId - ID del registro
 * @returns {Promise<Object>} - {data, error}
 */
export async function getHistorialRegistro(entidad, entidadId) {
  return getLogsByEntidad(entidad, entidadId, 1000); // Sin límite práctico
}
