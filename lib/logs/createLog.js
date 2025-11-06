/**
 * Helper para crear logs de actividad en el sistema
 *
 * Este archivo proporciona funciones para registrar acciones importantes
 * en la tabla logs_actividad de Supabase.
 *
 * USO:
 * import { createLog } from '@/lib/logs/createLog';
 *
 * await createLog({
 *   accion: 'cambiar_rol',
 *   entidad: 'usuario',
 *   entidad_id: usuarioId,
 *   detalles: { rol_anterior: 'vecino', rol_nuevo: 'secretaria' }
 * });
 */

import { createClient } from '@/lib/supabase/client';

/**
 * Crea un log de actividad en la base de datos
 *
 * @param {Object} params - Parámetros del log
 * @param {string} params.accion - Tipo de acción ('crear', 'editar', 'eliminar', 'login', 'logout', 'cambiar_rol', etc.)
 * @param {string} params.entidad - Tipo de entidad afectada ('usuario', 'solicitud', 'proyecto', 'noticia', etc.)
 * @param {string} [params.entidad_id] - ID del registro afectado (opcional para acciones globales)
 * @param {Object} [params.detalles={}] - Información adicional en formato objeto (se guardará como JSONB)
 * @param {Object} [params.usuario] - Información del usuario (opcional, se obtiene automáticamente si no se proporciona)
 * @returns {Promise<Object>} - Resultado de la inserción
 */
export async function createLog({
  accion,
  entidad,
  entidad_id = null,
  detalles = {},
  usuario = null
}) {
  try {
    const supabase = createClient();

    // Si no se proporcionó usuario, obtener el usuario actual
    let usuarioData = usuario;
    if (!usuarioData) {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Obtener perfil completo del usuario
        const { data: perfil } = await supabase
          .from('usuarios')
          .select('id, email, nombres, apellidos')
          .eq('email', user.email)
          .single();

        if (perfil) {
          usuarioData = {
            id: perfil.id,
            email: perfil.email,
            nombre: `${perfil.nombres} ${perfil.apellidos}`
          };
        }
      }
    }

    // Obtener IP del cliente (solo disponible en el lado del servidor)
    let ip_address = null;
    try {
      // Intentar obtener la IP desde el cliente (no siempre disponible)
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      ip_address = data.ip;
    } catch (e) {
      // Si falla, dejarlo como null
      ip_address = null;
    }

    // Obtener user agent
    const user_agent = typeof navigator !== 'undefined' ? navigator.userAgent : null;

    // Crear el log
    const logData = {
      usuario_id: usuarioData?.id || null,
      usuario_email: usuarioData?.email || null,
      usuario_nombre: usuarioData?.nombre || null,
      accion,
      entidad,
      entidad_id,
      detalles: detalles || {},
      ip_address,
      user_agent
    };

    const { data, error } = await supabase
      .from('logs_actividad')
      .insert([logData])
      .select()
      .single();

    if (error) {
      console.error('Error al crear log:', error);
      // No lanzamos error para no interrumpir la operación principal
      return { success: false, error };
    }

    console.log('📝 Log creado:', {
      accion,
      entidad,
      usuario: usuarioData?.nombre || 'Sistema'
    });

    return { success: true, data };

  } catch (error) {
    console.error('Error en createLog:', error);
    // No lanzamos error para no interrumpir la operación principal
    return { success: false, error: error.message };
  }
}

/**
 * Funciones helper específicas para acciones comunes
 */

export async function logLogin(usuario) {
  return createLog({
    accion: 'login',
    entidad: 'sistema',
    detalles: {
      exitoso: true,
      timestamp: new Date().toISOString()
    },
    usuario
  });
}

export async function logLogout(usuario) {
  return createLog({
    accion: 'logout',
    entidad: 'sistema',
    detalles: {
      timestamp: new Date().toISOString()
    },
    usuario
  });
}

export async function logCambioRol(usuarioModificadoId, usuarioModificadoNombre, rolAnterior, rolNuevo) {
  return createLog({
    accion: 'cambiar_rol',
    entidad: 'usuario',
    entidad_id: usuarioModificadoId,
    detalles: {
      usuario_modificado: usuarioModificadoNombre,
      rol_anterior: rolAnterior,
      rol_nuevo: rolNuevo
    }
  });
}

export async function logCambioEstadoUsuario(usuarioModificadoId, usuarioModificadoNombre, estadoAnterior, estadoNuevo) {
  return createLog({
    accion: 'cambiar_estado',
    entidad: 'usuario',
    entidad_id: usuarioModificadoId,
    detalles: {
      usuario_modificado: usuarioModificadoNombre,
      estado_anterior: estadoAnterior,
      estado_nuevo: estadoNuevo
    }
  });
}

export async function logEdicionUsuario(usuarioModificadoId, usuarioModificadoNombre, cambios) {
  return createLog({
    accion: 'editar',
    entidad: 'usuario',
    entidad_id: usuarioModificadoId,
    detalles: {
      usuario_modificado: usuarioModificadoNombre,
      cambios
    }
  });
}

export async function logEliminacion(entidad, entidadId, entidadNombre, datosAdicionales = {}) {
  return createLog({
    accion: 'eliminar',
    entidad,
    entidad_id: entidadId,
    detalles: {
      nombre: entidadNombre,
      ...datosAdicionales
    }
  });
}

export async function logCreacion(entidad, entidadId, entidadNombre, datosAdicionales = {}) {
  return createLog({
    accion: 'crear',
    entidad,
    entidad_id: entidadId,
    detalles: {
      nombre: entidadNombre,
      ...datosAdicionales
    }
  });
}

export async function logCambioEstado(entidad, entidadId, entidadNombre, estadoAnterior, estadoNuevo, datosAdicionales = {}) {
  return createLog({
    accion: 'cambiar_estado',
    entidad,
    entidad_id: entidadId,
    detalles: {
      nombre: entidadNombre,
      estado_anterior: estadoAnterior,
      estado_nuevo: estadoNuevo,
      ...datosAdicionales
    }
  });
}
