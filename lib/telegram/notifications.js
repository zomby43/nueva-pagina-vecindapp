// lib/telegram/notifications.js
import bot from './client';
import { createClient } from '@/lib/supabase/server';
import { wantsChannel } from '@/lib/notifications/preferences';

/**
 * Enviar notificación de nueva noticia a usuarios con Telegram
 */
export async function enviarNotificacionTelegramNoticia(
  tituloNoticia,
  resumen,
  categoria,
  idNoticia
) {
  if (!bot) {
    console.log('⚠️ Bot de Telegram no disponible. Notificación omitida.');
    return { success: false, sent: 0, errors: 0, message: 'Bot no disponible' };
  }

  try {
    const supabase = createClient();

    // Obtener usuarios con Telegram configurado
    const { data: usuarios, error } = await supabase
      .from('usuarios')
      .select('telegram_chat_id, nombres, apellidos, preferencia_notificacion')
      .eq('rol', 'vecino')
      .eq('estado', 'activo')
      .not('telegram_chat_id', 'is', null);

    if (error) throw error;

    if (!usuarios || usuarios.length === 0) {
      console.log('📱 No hay usuarios con Telegram configurado');
      return { success: true, sent: 0, errors: 0, message: 'No hay usuarios Telegram' };
    }

    const destinatarios = (usuarios || []).filter((usuario) =>
      wantsChannel(usuario.preferencia_notificacion, 'telegram')
    );

    if (!destinatarios.length) {
      console.log('📱 No hay vecinos con Telegram habilitado en sus preferencias');
      return { success: true, sent: 0, errors: 0, message: 'Sin destinatarios' };
    }

    console.log(`📱 Enviando notificación Telegram a ${destinatarios.length} usuarios`);

    const categoriaEmoji = {
      'eventos': '🎉',
      'obras': '🏗️',
      'seguridad': '🔒',
      'general': '📢',
      'medio_ambiente': '🌱',
      'cultura': '🎭',
      'deportes': '⚽',
      'otro': '📌',
    };

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || '';
    const isLocalhost = siteUrl.includes('localhost') || !siteUrl;

    let enviados = 0;
    let errores = 0;

    // Enviar a cada usuario (con rate limiting)
    for (const usuario of destinatarios) {
      try {
        // Preparar keyboard según si es localhost o no
        const keyboard = [];
        if (!isLocalhost) {
          keyboard.push([{ text: '📖 Leer Noticia Completa', url: `${siteUrl}/noticias/${idNoticia}` }]);
          keyboard.push([{ text: '📰 Ver Todas las Noticias', url: `${siteUrl}/noticias` }]);
        }

        let mensaje = `${categoriaEmoji[categoria] || '📰'} *Nueva Noticia*\n\n` +
          `*${tituloNoticia}*\n\n` +
          `${resumen || 'Sin resumen disponible'}\n\n` +
          `📂 Categoría: ${categoria}\n` +
          `📅 ${new Date().toLocaleDateString('es-CL')}`;

        if (isLocalhost) {
          mensaje += '\n\n💡 _Para ver el contenido completo, visita la plataforma web_';
        }

        await bot.sendMessage(
          usuario.telegram_chat_id,
          mensaje,
          {
            parse_mode: 'Markdown',
            reply_markup: keyboard.length > 0 ? { inline_keyboard: keyboard } : undefined
          }
        );

        enviados++;

        // Rate limiting: 1 mensaje por segundo (30/segundo permitido, pero seamos conservadores)
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`Error enviando a ${usuario.telegram_chat_id}:`, error.message);
        errores++;
      }
    }

    console.log(`✅ Telegram: ${enviados} enviados, ${errores} errores`);

    return {
      success: true,
      sent: enviados,
      errors: errores,
      total: destinatarios.length
    };

  } catch (error) {
    console.error('Error en enviarNotificacionTelegramNoticia:', error);
    return {
      success: false,
      sent: 0,
      errors: 0,
      error: error.message
    };
  }
}

/**
 * Enviar notificación de nuevo aviso a usuarios con Telegram
 */
export async function enviarNotificacionTelegramAviso(
  tituloAviso,
  mensajeAviso,
  tipo,
  prioridad,
  idAviso
) {
  if (!bot) {
    console.log('⚠️ Bot de Telegram no disponible. Notificación omitida.');
    return { success: false, sent: 0, errors: 0, message: 'Bot no disponible' };
  }

  try {
    const supabase = createClient();

    const { data: usuarios, error } = await supabase
      .from('usuarios')
      .select('telegram_chat_id, nombres, apellidos, preferencia_notificacion')
      .eq('rol', 'vecino')
      .eq('estado', 'activo')
      .not('telegram_chat_id', 'is', null);

    if (error) throw error;

    if (!usuarios || usuarios.length === 0) {
      console.log('📱 No hay usuarios con Telegram configurado');
      return { success: true, sent: 0, errors: 0, message: 'No hay usuarios Telegram' };
    }

    const destinatarios = (usuarios || []).filter((usuario) =>
      wantsChannel(usuario.preferencia_notificacion, 'telegram')
    );

    if (!destinatarios.length) {
      console.log('📱 No hay vecinos con Telegram habilitado en sus preferencias');
      return { success: true, sent: 0, errors: 0, message: 'Sin destinatarios' };
    }

    console.log(`📱 Enviando aviso Telegram a ${destinatarios.length} usuarios`);

    const tipoEmoji = {
      'urgente': '🚨',
      'informativo': '📢',
      'mantenimiento': '🔧',
      'seguridad': '🔒',
      'evento': '🎉',
      'corte_servicio': '⚠️',
      'otro': '📌',
    };

    const prioridadText = {
      'critica': '🔴 CRÍTICA',
      'alta': '🟠 ALTA',
      'media': '🟡 MEDIA',
      'baja': '🟢 BAJA',
    };

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || '';
    const isLocalhost = siteUrl.includes('localhost') || !siteUrl;

    let enviados = 0;
    let errores = 0;

    for (const usuario of destinatarios) {
      try {
        // Notificación silenciosa solo si es baja prioridad
        const disable_notification = prioridad === 'baja';

        // Preparar keyboard según si es localhost o no
        const keyboard = [];
        if (!isLocalhost) {
          keyboard.push([{ text: '📖 Ver Aviso Completo', url: `${siteUrl}/avisos` }]);
          keyboard.push([{ text: '📢 Ver Todos los Avisos', url: `${siteUrl}/avisos` }]);
        }

        let mensaje = `${tipoEmoji[tipo] || '📢'} *Nuevo Aviso*\n\n` +
          `*${tituloAviso}*\n\n` +
          `${mensajeAviso}\n\n` +
          `📌 Tipo: ${tipo}\n` +
          `⚡ Prioridad: ${prioridadText[prioridad] || prioridad}\n` +
          `📅 ${new Date().toLocaleDateString('es-CL')}`;

        if (isLocalhost) {
          mensaje += '\n\n💡 _Para ver el contenido completo, visita la plataforma web_';
        }

        await bot.sendMessage(
          usuario.telegram_chat_id,
          mensaje,
          {
            parse_mode: 'Markdown',
            disable_notification,
            reply_markup: keyboard.length > 0 ? { inline_keyboard: keyboard } : undefined
          }
        );

        enviados++;
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`Error enviando a ${usuario.telegram_chat_id}:`, error.message);
        errores++;
      }
    }

    console.log(`✅ Telegram: ${enviados} enviados, ${errores} errores`);

    return {
      success: true,
      sent: enviados,
      errors: errores,
      total: destinatarios.length
    };

  } catch (error) {
    console.error('Error en enviarNotificacionTelegramAviso:', error);
    return {
      success: false,
      sent: 0,
      errors: 0,
      error: error.message
    };
  }
}

/**
 * Enviar notificación de aprobación de reserva
 */
export async function enviarNotificacionTelegramReserva(
  telegramChatId,
  nombreCompleto,
  nombreEspacio,
  fecha,
  bloqueHorario
) {
  if (!bot) {
    console.log('⚠️ Bot de Telegram no disponible. Notificación omitida.');
    return { success: false };
  }

  if (!telegramChatId) {
    console.log('📱 Usuario no tiene Telegram configurado');
    return { success: false, message: 'No tiene Telegram' };
  }

  try {
    const bloqueTexto = {
      'manana': 'Mañana (9:00 - 13:00)',
      'tarde': 'Tarde (14:00 - 18:00)',
      'noche': 'Noche (19:00 - 23:00)',
      'dia_completo': 'Día Completo (9:00 - 23:00)'
    };

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || '';
    const isLocalhost = siteUrl.includes('localhost') || !siteUrl;

    // Preparar keyboard según si es localhost o no
    const keyboard = [];
    if (!isLocalhost) {
      keyboard.push([{ text: '📅 Ver Mis Reservas', url: `${siteUrl}/reservas` }]);
    }

    let mensaje = `✅ *Reserva Aprobada*\n\n` +
      `Hola ${nombreCompleto},\n\n` +
      `Tu reserva ha sido *aprobada* exitosamente.\n\n` +
      `📍 *Espacio:* ${nombreEspacio}\n` +
      `📅 *Fecha:* ${new Date(fecha).toLocaleDateString('es-CL')}\n` +
      `⏰ *Horario:* ${bloqueTexto[bloqueHorario] || bloqueHorario}\n\n` +
      `¡Nos vemos!`;

    if (isLocalhost) {
      mensaje += '\n\n💡 _Para ver tus reservas, visita la plataforma web_';
    }

    await bot.sendMessage(
      telegramChatId,
      mensaje,
      {
        parse_mode: 'Markdown',
        reply_markup: keyboard.length > 0 ? { inline_keyboard: keyboard } : undefined
      }
    );

    console.log(`✅ Notificación Telegram enviada a ${nombreCompleto}`);
    return { success: true };

  } catch (error) {
    console.error('Error enviando notificación de reserva:', error);
    return { success: false, error: error.message };
  }
}
