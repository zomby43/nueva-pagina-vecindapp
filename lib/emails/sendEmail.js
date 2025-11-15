/**
 * Utilidad para enviar correos electrónicos usando Supabase
 *
 * Nota: Supabase tiene limitaciones para enviar emails personalizados.
 * Para producción, considera usar servicios como Resend, SendGrid o Mailgun.
 *
 * Esta implementación usa una API route que puede ser configurada
 * con cualquier servicio de email.
 */

/**
 * Envía un correo de aprobación de registro
 */
export async function enviarCorreoAprobacionRegistro(destinatario, nombreCompleto) {
  try {
    const response = await fetch('/api/emails/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tipo: 'aprobacion_registro',
        destinatario,
        nombreCompleto,
      }),
    });

    if (!response.ok) {
      throw new Error('Error al enviar el correo');
    }

    return await response.json();
  } catch (error) {
    console.error('Error enviando correo de aprobación de registro:', error);
    throw error;
  }
}

/**
 * Envía un correo de aprobación de solicitud de certificado
 */
export async function enviarCorreoAprobacionSolicitud(destinatario, nombreCompleto, tipoSolicitud) {
  try {
    const response = await fetch('/api/emails/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tipo: 'aprobacion_solicitud',
        destinatario,
        nombreCompleto,
        tipoSolicitud,
      }),
    });

    if (!response.ok) {
      throw new Error('Error al enviar el correo');
    }

    return await response.json();
  } catch (error) {
    console.error('Error enviando correo de aprobación de solicitud:', error);
    throw error;
  }
}

/**
 * Envía un correo de rechazo de solicitud
 */
export async function enviarCorreoRechazoSolicitud(destinatario, nombreCompleto, tipoSolicitud, motivo) {
  try {
    const response = await fetch('/api/emails/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tipo: 'rechazo_solicitud',
        destinatario,
        nombreCompleto,
        tipoSolicitud,
        motivo,
      }),
    });

    if (!response.ok) {
      throw new Error('Error al enviar el correo');
    }

    return await response.json();
  } catch (error) {
    console.error('Error enviando correo de rechazo de solicitud:', error);
    throw error;
  }
}

/**
 * Envía un correo cuando se crea una nueva solicitud de reserva
 */
export async function enviarCorreoSolicitudReserva(destinatario, nombreCompleto, espacio, fechaReserva, bloqueHorario) {
  try {
    const response = await fetch('/api/emails/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tipo: 'solicitud_reserva',
        destinatario,
        nombreCompleto,
        espacio,
        fechaReserva,
        bloqueHorario,
      }),
    });

    if (!response.ok) {
      throw new Error('Error al enviar el correo');
    }

    return await response.json();
  } catch (error) {
    console.error('Error enviando correo de solicitud de reserva:', error);
    throw error;
  }
}

/**
 * Envía un correo cuando se aprueba una reserva
 */
export async function enviarCorreoAprobacionReserva(destinatario, nombreCompleto, espacio, fechaReserva, bloqueHorario) {
  try {
    const response = await fetch('/api/emails/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tipo: 'aprobacion_reserva',
        destinatario,
        nombreCompleto,
        espacio,
        fechaReserva,
        bloqueHorario,
      }),
    });

    if (!response.ok) {
      throw new Error('Error al enviar el correo');
    }

    return await response.json();
  } catch (error) {
    console.error('Error enviando correo de aprobación de reserva:', error);
    throw error;
  }
}

/**
 * Envía un correo cuando se rechaza una reserva
 */
export async function enviarCorreoRechazoReserva(destinatario, nombreCompleto, espacio, fechaReserva, bloqueHorario, motivo) {
  try {
    const response = await fetch('/api/emails/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tipo: 'rechazo_reserva',
        destinatario,
        nombreCompleto,
        espacio,
        fechaReserva,
        bloqueHorario,
        motivo,
      }),
    });

    if (!response.ok) {
      throw new Error('Error al enviar el correo');
    }

    return await response.json();
  } catch (error) {
    console.error('Error enviando correo de rechazo de reserva:', error);
    throw error;
  }
}

/**
 * Envía un correo cuando se aprueba un proyecto vecinal
 */
export async function enviarCorreoAprobacionProyecto(destinatario, nombreCompleto, tituloProyecto) {
  try {
    const response = await fetch('/api/emails/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tipo: 'aprobacion_proyecto',
        destinatario,
        nombreCompleto,
        tituloProyecto,
      }),
    });

    if (!response.ok) {
      throw new Error('Error al enviar el correo');
    }

    return await response.json();
  } catch (error) {
    console.error('Error enviando correo de aprobación de proyecto:', error);
    throw error;
  }
}

/**
 * Envía un correo cuando se rechaza un proyecto vecinal
 */
export async function enviarCorreoRechazoProyecto(destinatario, nombreCompleto, tituloProyecto, motivo) {
  try {
    const response = await fetch('/api/emails/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tipo: 'rechazo_proyecto',
        destinatario,
        nombreCompleto,
        tituloProyecto,
        motivo,
      }),
    });

    if (!response.ok) {
      throw new Error('Error al enviar el correo');
    }

    return await response.json();
  } catch (error) {
    console.error('Error enviando correo de rechazo de proyecto:', error);
    throw error;
  }
}

// ============================================
// FUNCIONES PARA ACTIVIDADES VECINALES
// ============================================

/**
 * Envía un correo cuando un usuario se inscribe a una actividad
 */
export async function enviarCorreoInscripcionActividad(destinatario, nombreCompleto, tituloActividad, fechaInicio, categoria) {
  try {
    const response = await fetch('/api/emails/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tipo: 'inscripcion_actividad',
        destinatario,
        nombreCompleto,
        tituloActividad,
        fechaInicio,
        categoria,
      }),
    });

    if (!response.ok) {
      throw new Error('Error al enviar el correo');
    }

    return await response.json();
  } catch (error) {
    console.error('Error enviando correo de inscripción a actividad:', error);
    throw error;
  }
}

/**
 * Envía un correo cuando se aprueba una inscripción a una actividad
 */
export async function enviarCorreoAprobacionInscripcionActividad(destinatario, nombreCompleto, tituloActividad, fechaInicio, ubicacion, enlaceVideollamada = null) {
  try {
    const response = await fetch('/api/emails/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tipo: 'aprobacion_inscripcion_actividad',
        destinatario,
        nombreCompleto,
        tituloActividad,
        fechaInicio,
        ubicacion,
        enlaceVideollamada,
      }),
    });

    if (!response.ok) {
      throw new Error('Error al enviar el correo');
    }

    return await response.json();
  } catch (error) {
    console.error('Error enviando correo de aprobación de inscripción a actividad:', error);
    throw error;
  }
}

/**
 * Envía un correo cuando se rechaza una inscripción a una actividad
 */
export async function enviarCorreoRechazoInscripcionActividad(destinatario, nombreCompleto, tituloActividad, motivo) {
  try {
    const response = await fetch('/api/emails/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tipo: 'rechazo_inscripcion_actividad',
        destinatario,
        nombreCompleto,
        tituloActividad,
        motivo,
      }),
    });

    if (!response.ok) {
      throw new Error('Error al enviar el correo');
    }

    return await response.json();
  } catch (error) {
    console.error('Error enviando correo de rechazo de inscripción a actividad:', error);
    throw error;
  }
}

// ============================================
// FUNCIONES PARA NOTICIAS Y AVISOS
// ============================================

/**
 * Envía correos masivos a todos los vecinos activos cuando se publica una nueva noticia
 * TAMBIÉN envía notificaciones por Telegram a usuarios que lo tengan configurado
 */
export async function enviarCorreoNuevaNoticia(tituloNoticia, resumen, categoria, idNoticia) {
  try {
    // 1. Enviar correos (sistema existente)
    const baseURL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseURL}/api/emails/send-bulk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tipo: 'nueva_noticia',
        tituloNoticia,
        resumen,
        categoria,
        idNoticia,
      }),
    });

    const result = await response.json().catch(() => null);

    if (!response.ok) {
      const message = result?.message || 'Error al enviar los correos de noticia';
      throw new Error(message);
    }

    if (!result || typeof result.sent_count !== 'number') {
      throw new Error('No se pudo verificar el resultado del envío de noticia');
    }

    if (result.sent_count === 0) {
      throw new Error('No se envió ningún correo de noticia (sent_count=0)');
    }

    console.log(`📧 Emails: ${result.sent_count} exitosos`);

    let totalMensajeria = 0;

    // 2. Enviar notificaciones por Telegram (NUEVO) - No bloquear si falla
    try {
      const telegramResponse = await fetch(`${baseURL}/api/telegram/noticias`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tituloNoticia,
          resumen,
          categoria,
          idNoticia,
        }),
      });

      const telegramResult = await telegramResponse.json().catch(() => null);

      if (!telegramResponse.ok) {
        const message = telegramResult?.error || 'Error al enviar notificaciones por Telegram';
        throw new Error(message);
      }

      console.log(`📱 Telegram: ${telegramResult.sent || telegramResult.result?.sent || 0} enviados, ${telegramResult.errors || telegramResult.result?.errors || 0} errores`);

      // Agregar información de Telegram al resultado
      result.telegram = telegramResult;
      const enviadosTelegram = telegramResult.sent || telegramResult.result?.sent || 0;
      totalMensajeria += enviadosTelegram;
    } catch (telegramError) {
      console.error('⚠️ Error en notificaciones Telegram (no crítico):', telegramError.message);
      result.telegram = { success: false, error: telegramError.message };
    }

    // 3. Enviar notificaciones por WhatsApp
    try {
      const whatsappResponse = await fetch(`${baseURL}/api/whatsapp/noticias`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tituloNoticia,
          resumen,
          categoria,
          idNoticia,
        }),
      });

      const whatsappResult = await whatsappResponse.json().catch(() => null);

      if (!whatsappResponse.ok) {
        const message = whatsappResult?.error || 'Error al enviar notificaciones por WhatsApp';
        throw new Error(message);
      }

      console.log(
        `💬 WhatsApp: ${whatsappResult.sent || whatsappResult.result?.sent || 0} enviados, ${whatsappResult.errors || whatsappResult.result?.errors || 0} errores`
      );

      result.whatsapp = whatsappResult;
      const enviadosWhatsApp = whatsappResult.sent || whatsappResult.result?.sent || 0;
      totalMensajeria += enviadosWhatsApp;
    } catch (whatsAppError) {
      console.error('⚠️ Error en notificaciones WhatsApp (no crítico):', whatsAppError.message);
      result.whatsapp = { success: false, error: whatsAppError.message };
    }

    result.totalNotificaciones = result.sent_count + totalMensajeria;

    return result;
  } catch (error) {
    console.error('Error enviando correos de nueva noticia:', error);
    throw error;
  }
}

/**
 * Envía correos masivos a todos los vecinos activos cuando se publica un nuevo aviso
 * TAMBIÉN envía notificaciones por Telegram a usuarios que lo tengan configurado
 */
export async function enviarCorreoNuevoAviso(tituloAviso, mensajeAviso, tipo, prioridad, idAviso) {
  try {
    // 1. Enviar correos (sistema existente)
    const baseURL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseURL}/api/emails/send-bulk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tipo: 'nuevo_aviso',
        tituloAviso,
        mensajeAviso,
        tipoAviso: tipo,
        prioridad,
        idAviso,
      }),
    });

    const result = await response.json().catch(() => null);

    if (!response.ok) {
      const message = result?.message || 'Error al enviar los correos de aviso';
      throw new Error(message);
    }

    if (!result || typeof result.sent_count !== 'number') {
      throw new Error('No se pudo verificar el resultado del envío de aviso');
    }

    if (result.sent_count === 0) {
      throw new Error('No se envió ningún correo de aviso (sent_count=0)');
    }

    console.log(`📧 Emails: ${result.sent_count} exitosos`);

    let totalMensajeria = 0;

    // 2. Enviar notificaciones por Telegram (NUEVO) - No bloquear si falla
    try {
      const telegramResponse = await fetch(`${baseURL}/api/telegram/avisos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tituloAviso,
          mensajeAviso,
          tipo,
          prioridad,
          idAviso,
        }),
      });

      const telegramResult = await telegramResponse.json().catch(() => null);

      if (!telegramResponse.ok) {
        const message = telegramResult?.error || 'Error al enviar avisos por Telegram';
        throw new Error(message);
      }

      console.log(`📱 Telegram: ${telegramResult.sent || telegramResult.result?.sent || 0} enviados, ${telegramResult.errors || telegramResult.result?.errors || 0} errores`);

      // Agregar información de Telegram al resultado
      result.telegram = telegramResult;
      const enviadosTelegram = telegramResult.sent || telegramResult.result?.sent || 0;
      totalMensajeria += enviadosTelegram;
    } catch (telegramError) {
      console.error('⚠️ Error en notificaciones Telegram (no crítico):', telegramError.message);
      result.telegram = { success: false, error: telegramError.message };
    }

    // 3. Enviar notificaciones por WhatsApp (NUEVO)
    try {
      const whatsappResponse = await fetch(`${baseURL}/api/whatsapp/avisos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tituloAviso,
          mensajeAviso,
          tipo,
          prioridad,
          idAviso,
        }),
      });

      const whatsappResult = await whatsappResponse.json().catch(() => null);

      if (!whatsappResponse.ok) {
        const message = whatsappResult?.error || 'Error al enviar avisos por WhatsApp';
        throw new Error(message);
      }

      console.log(
        `💬 WhatsApp: ${whatsappResult.sent || whatsappResult.result?.sent || 0} enviados, ${whatsappResult.errors || whatsappResult.result?.errors || 0} errores`
      );

      result.whatsapp = whatsappResult;
      const enviadosWhatsApp = whatsappResult.sent || whatsappResult.result?.sent || 0;
      totalMensajeria += enviadosWhatsApp;
    } catch (whatsAppError) {
      console.error('⚠️ Error en notificaciones WhatsApp (no crítico):', whatsAppError.message);
      result.whatsapp = { success: false, error: whatsAppError.message };
    }

    result.totalNotificaciones = result.sent_count + totalMensajeria;

    return result;
  } catch (error) {
    console.error('Error enviando correos de nuevo aviso:', error);
    throw error;
  }
}

export default {
  enviarCorreoNuevaNoticia,
  enviarCorreoNuevoAviso
};
