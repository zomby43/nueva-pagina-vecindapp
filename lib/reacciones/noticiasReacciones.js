/**
 * Helper para gestionar reacciones en noticias
 *
 * Proporciona funciones para crear, actualizar, eliminar y consultar
 * reacciones (me gusta / no me gusta) en noticias.
 *
 * USO:
 * import { toggleReaccion, getReaccionesNoticia, getReaccionUsuario } from '@/lib/reacciones/noticiasReacciones';
 */

import { createClient } from '@/lib/supabase/client';

/**
 * Toggle de reacción: Crea, actualiza o elimina la reacción de un usuario
 *
 * @param {string} noticiaId - ID de la noticia
 * @param {string} usuarioId - ID del usuario (opcional, se detecta automáticamente)
 * @param {string} tipoReaccion - 'me_gusta' o 'no_me_gusta'
 * @returns {Promise<Object>} - {success, data, error, action}
 */
export async function toggleReaccion(noticiaId, tipoReaccion, usuarioId = null) {
  try {
    const supabase = createClient();

    // Detectar usuario actual si no se proporciona
    let userId = usuarioId;
    if (!userId) {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        return {
          success: false,
          error: 'Usuario no autenticado',
          action: null
        };
      }
      userId = user.id;
    }

    // Validar tipo de reacción
    if (!['me_gusta', 'no_me_gusta'].includes(tipoReaccion)) {
      return {
        success: false,
        error: 'Tipo de reacción inválido',
        action: null
      };
    }

    // Verificar si el usuario ya tiene una reacción
    const { data: reaccionExistente, error: fetchError } = await supabase
      .from('noticias_reacciones')
      .select('*')
      .eq('noticia_id', noticiaId)
      .eq('usuario_id', userId)
      .maybeSingle();

    if (fetchError) {
      console.error('Error al verificar reacción existente:', fetchError);
      return {
        success: false,
        error: fetchError.message,
        action: null
      };
    }

    // Caso 1: No existe reacción previa → CREAR nueva reacción
    if (!reaccionExistente) {
      const { data, error } = await supabase
        .from('noticias_reacciones')
        .insert({
          noticia_id: noticiaId,
          usuario_id: userId,
          tipo_reaccion: tipoReaccion
        })
        .select()
        .single();

      if (error) {
        console.error('Error al crear reacción:', error);
        return {
          success: false,
          error: error.message,
          action: null
        };
      }

      return {
        success: true,
        data: data,
        error: null,
        action: 'created'
      };
    }

    // Caso 2: Existe reacción igual → ELIMINAR (toggle off)
    if (reaccionExistente.tipo_reaccion === tipoReaccion) {
      const { error } = await supabase
        .from('noticias_reacciones')
        .delete()
        .eq('id', reaccionExistente.id);

      if (error) {
        console.error('Error al eliminar reacción:', error);
        return {
          success: false,
          error: error.message,
          action: null
        };
      }

      return {
        success: true,
        data: null,
        error: null,
        action: 'deleted'
      };
    }

    // Caso 3: Existe reacción diferente → ACTUALIZAR (cambiar tipo)
    const { data, error } = await supabase
      .from('noticias_reacciones')
      .update({ tipo_reaccion: tipoReaccion })
      .eq('id', reaccionExistente.id)
      .select()
      .single();

    if (error) {
      console.error('Error al actualizar reacción:', error);
      return {
        success: false,
        error: error.message,
        action: null
      };
    }

    return {
      success: true,
      data: data,
      error: null,
      action: 'updated'
    };

  } catch (error) {
    console.error('Error en toggleReaccion:', error);
    return {
      success: false,
      error: error.message,
      action: null
    };
  }
}

/**
 * Obtiene las estadísticas de reacciones de una noticia
 *
 * @param {string} noticiaId - ID de la noticia
 * @returns {Promise<Object>} - {meGusta, noMeGusta, total}
 */
export async function getReaccionesNoticia(noticiaId) {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('noticias_reacciones')
      .select('tipo_reaccion')
      .eq('noticia_id', noticiaId);

    if (error) {
      console.error('Error al obtener reacciones:', error);
      return {
        meGusta: 0,
        noMeGusta: 0,
        total: 0,
        error: error.message
      };
    }

    const meGusta = data.filter(r => r.tipo_reaccion === 'me_gusta').length;
    const noMeGusta = data.filter(r => r.tipo_reaccion === 'no_me_gusta').length;

    return {
      meGusta,
      noMeGusta,
      total: data.length,
      error: null
    };

  } catch (error) {
    console.error('Error en getReaccionesNoticia:', error);
    return {
      meGusta: 0,
      noMeGusta: 0,
      total: 0,
      error: error.message
    };
  }
}

/**
 * Obtiene la reacción específica de un usuario para una noticia
 *
 * @param {string} noticiaId - ID de la noticia
 * @param {string} usuarioId - ID del usuario (opcional, se detecta automáticamente)
 * @returns {Promise<Object>} - {reaccion: 'me_gusta' | 'no_me_gusta' | null}
 */
export async function getReaccionUsuario(noticiaId, usuarioId = null) {
  try {
    const supabase = createClient();

    // Detectar usuario actual si no se proporciona
    let userId = usuarioId;
    if (!userId) {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        return { reaccion: null, error: 'Usuario no autenticado' };
      }
      userId = user.id;
    }

    const { data, error } = await supabase
      .from('noticias_reacciones')
      .select('tipo_reaccion')
      .eq('noticia_id', noticiaId)
      .eq('usuario_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error al obtener reacción del usuario:', error);
      return { reaccion: null, error: error.message };
    }

    return {
      reaccion: data ? data.tipo_reaccion : null,
      error: null
    };

  } catch (error) {
    console.error('Error en getReaccionUsuario:', error);
    return { reaccion: null, error: error.message };
  }
}

/**
 * Obtiene estadísticas de reacciones para múltiples noticias
 * Útil para mostrar contadores en lista de noticias
 *
 * @param {Array<string>} noticiasIds - Array de IDs de noticias
 * @returns {Promise<Object>} - Objeto con estadísticas por noticia { [noticiaId]: {meGusta, noMeGusta, total} }
 */
export async function getReaccionesMultiples(noticiasIds) {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('noticias_reacciones')
      .select('noticia_id, tipo_reaccion')
      .in('noticia_id', noticiasIds);

    if (error) {
      console.error('Error al obtener reacciones múltiples:', error);
      return {};
    }

    // Agrupar por noticia
    const stats = {};
    noticiasIds.forEach(id => {
      stats[id] = { meGusta: 0, noMeGusta: 0, total: 0 };
    });

    data.forEach(reaccion => {
      if (stats[reaccion.noticia_id]) {
        stats[reaccion.noticia_id].total++;
        if (reaccion.tipo_reaccion === 'me_gusta') {
          stats[reaccion.noticia_id].meGusta++;
        } else {
          stats[reaccion.noticia_id].noMeGusta++;
        }
      }
    });

    return stats;

  } catch (error) {
    console.error('Error en getReaccionesMultiples:', error);
    return {};
  }
}

/**
 * Obtiene las reacciones del usuario autenticado para múltiples noticias
 * Útil para mostrar qué noticias ya reaccionó el usuario
 *
 * @param {Array<string>} noticiasIds - Array de IDs de noticias
 * @returns {Promise<Object>} - Objeto { [noticiaId]: 'me_gusta' | 'no_me_gusta' | null }
 */
export async function getReaccionesUsuarioMultiples(noticiasIds) {
  try {
    const supabase = createClient();

    // Obtener usuario actual
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return {};
    }

    const { data, error } = await supabase
      .from('noticias_reacciones')
      .select('noticia_id, tipo_reaccion')
      .eq('usuario_id', user.id)
      .in('noticia_id', noticiasIds);

    if (error) {
      console.error('Error al obtener reacciones del usuario:', error);
      return {};
    }

    // Convertir a objeto
    const reacciones = {};
    data.forEach(r => {
      reacciones[r.noticia_id] = r.tipo_reaccion;
    });

    return reacciones;

  } catch (error) {
    console.error('Error en getReaccionesUsuarioMultiples:', error);
    return {};
  }
}
