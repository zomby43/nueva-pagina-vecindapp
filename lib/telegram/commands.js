// lib/telegram/commands.js
import getBot from './client';
import { createClient } from '@/lib/supabase/server';
import {
  addChannelToPreference,
  formatPreferenceLabel,
  removeChannelFromPreference,
} from '@/lib/notifications/preferences';

/**
 * Registra todos los comandos del bot de Telegram
 * Esta función debe ser llamada después de obtener la instancia del bot
 */
export function registerCommands() {
  const bot = getBot();

  if (!bot) {
    console.warn('⚠️ Bot de Telegram no disponible. Comandos no registrados.');
    return;
  }

  // Variable global para evitar registrar comandos múltiples veces
  if (typeof globalThis.telegramCommandsRegistered === 'undefined') {
    globalThis.telegramCommandsRegistered = false;
  }

  if (globalThis.telegramCommandsRegistered) {
    console.log('✅ Comandos de Telegram ya registrados anteriormente');
    return;
  }

  globalThis.telegramCommandsRegistered = true;
  console.log('📝 Registrando comandos de Telegram...');
  // ============================================================
  // COMANDO: /start
  // ============================================================
  bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const firstName = msg.from.first_name || 'Vecino';

    await bot.sendMessage(
      chatId,
      `¡Hola ${firstName}! 👋

Bienvenido al bot de *VecindApp*.

Para vincular tu cuenta y recibir notificaciones instantáneas, usa:
/vincular TU_RUT

Ejemplo:
\`/vincular 12345678-9\`

*Otros comandos disponibles:*
/ayuda - Ver todos los comandos
/noticias - Ver últimas 2 noticias
/avisos - Ver avisos activos
/perfil - Ver tu perfil`,
      {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔗 Instrucciones para Vincular', callback_data: 'vincular_info' }],
            [{ text: '📰 Ver Noticias', callback_data: 'noticias' }],
            [{ text: '📢 Ver Avisos', callback_data: 'avisos' }],
          ]
        }
      }
    );
  });

  // ============================================================
  // COMANDO: /vincular RUT
  // ============================================================
  bot.onText(/\/vincular (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const rutInput = match[1].trim();

    try {
      const supabase = createClient();

      // Buscar usuario por RUT
      const { data: usuario, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('rut', rutInput)
        .eq('estado', 'activo')
        .single();

      if (error || !usuario) {
        return bot.sendMessage(
          chatId,
          `❌ No se encontró una cuenta activa con ese RUT.

*Verifica que:*
- El RUT esté correcto (formato: 12345678-9)
- Tu cuenta esté aprobada
- Seas un vecino registrado

Si el problema persiste, contacta a la secretaría.`,
          { parse_mode: 'Markdown' }
        );
      }

      const newPreference = addChannelToPreference(usuario.preferencia_notificacion, 'telegram');

      // Actualizar chat_id del usuario
      const { error: updateError } = await supabase
        .from('usuarios')
        .update({
          telegram_chat_id: chatId.toString(),
          preferencia_notificacion: newPreference
        })
        .eq('id', usuario.id);

      if (updateError) throw updateError;

      await bot.sendMessage(
        chatId,
        `✅ *¡Cuenta vinculada exitosamente!*

👤 Usuario: ${usuario.nombres} ${usuario.apellidos}
📧 Email: ${usuario.email}

Ahora recibirás notificaciones de:
✅ Nuevas noticias
✅ Avisos importantes
✅ Actualizaciones de solicitudes
✅ Aprobaciones de reservas

Usa /ayuda para ver todos los comandos disponibles.`,
        {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [{ text: '📰 Ver Últimas Noticias', callback_data: 'noticias' }],
              [{ text: '📢 Ver Avisos Activos', callback_data: 'avisos' }],
            ]
          }
        }
      );

    } catch (error) {
      console.error('Error vinculando cuenta:', error);
      bot.sendMessage(
        chatId,
        '⚠️ Ocurrió un error al vincular tu cuenta. Por favor intenta nuevamente más tarde.'
      );
    }
  });

  // ============================================================
  // COMANDO: /ayuda
  // ============================================================
  bot.onText(/\/ayuda/, async (msg) => {
    const chatId = msg.chat.id;

    await bot.sendMessage(
      chatId,
      `📋 *Comandos Disponibles*

*Cuenta:*
/vincular RUT - Vincular cuenta de VecindApp
/perfil - Ver información de tu perfil
/desvincular - Desvincular cuenta

*Información:*
/noticias - Ver últimas 2 noticias
/avisos - Ver avisos activos
/horarios - Horarios de atención

*Otros:*
/ayuda - Ver este mensaje

💡 *Tip:* También puedes usar los botones de los mensajes para navegar más fácilmente.`,
      { parse_mode: 'Markdown' }
    );
  });

  // ============================================================
  // COMANDO: /noticias
  // ============================================================
  bot.onText(/\/noticias/, async (msg) => {
    const chatId = msg.chat.id;

    try {
      const supabase = createClient();

      const { data: noticias, error } = await supabase
        .from('noticias')
        .select('id, titulo, resumen, categoria, fecha_publicacion')
        .eq('estado', 'publicado')
        .order('fecha_publicacion', { ascending: false })
        .limit(2);

      if (error) throw error;

      if (!noticias || noticias.length === 0) {
        return bot.sendMessage(
          chatId,
          '📰 No hay noticias publicadas actualmente.',
          {
            reply_markup: {
              inline_keyboard: [
                [{ text: '🔄 Actualizar', callback_data: 'noticias' }]
              ]
            }
          }
        );
      }

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

      let mensaje = '📰 *Últimas 2 Noticias*\n\n';

      const keyboard = [];

      noticias.forEach((noticia, index) => {
        const fecha = new Date(noticia.fecha_publicacion).toLocaleDateString('es-CL');
        const emoji = categoriaEmoji[noticia.categoria] || '📌';

        mensaje += `${index + 1}. ${emoji} *${noticia.titulo}*\n`;
        mensaje += `   📅 ${fecha}\n`;
        mensaje += `   ${noticia.resumen ? noticia.resumen.substring(0, 100) + '...' : ''}\n\n`;

        // Solo agregar botones de URL si no es localhost
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || '';
        if (siteUrl && !siteUrl.includes('localhost')) {
          keyboard.push([{
            text: `📖 Leer "${noticia.titulo}"`,
            url: `${siteUrl}/noticias/${noticia.id}`
          }]);
        }
      });

      // Agregar botón de actualizar
      keyboard.push([{ text: '🔄 Actualizar', callback_data: 'noticias' }]);

      // Si estamos en localhost, agregar mensaje informativo
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || '';
      if (siteUrl.includes('localhost') || !siteUrl) {
        mensaje += '\n💡 _Para ver el contenido completo, visita la plataforma web_';
      }

      await bot.sendMessage(chatId, mensaje, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: keyboard
        }
      });

    } catch (error) {
      console.error('Error obteniendo noticias:', error);
      bot.sendMessage(chatId, '⚠️ Error al obtener noticias. Intenta nuevamente más tarde.');
    }
  });

  // ============================================================
  // COMANDO: /avisos
  // ============================================================
  bot.onText(/\/avisos/, async (msg) => {
    const chatId = msg.chat.id;

    try {
      const supabase = createClient();

      const { data: avisos, error } = await supabase
        .from('avisos')
        .select('id, titulo, mensaje, tipo, prioridad, fecha_inicio')
        .eq('estado', 'activo')
        .order('prioridad', { ascending: false })
        .order('fecha_inicio', { ascending: false })
        .limit(5);

      if (error) throw error;

      if (!avisos || avisos.length === 0) {
        return bot.sendMessage(
          chatId,
          '📢 No hay avisos activos actualmente.',
          {
            reply_markup: {
              inline_keyboard: [
                [{ text: '🔄 Actualizar', callback_data: 'avisos' }]
              ]
            }
          }
        );
      }

      const tipoEmoji = {
        'urgente': '🚨',
        'informativo': '📢',
        'mantenimiento': '🔧',
        'seguridad': '🔒',
        'evento': '🎉',
        'corte_servicio': '⚠️',
        'otro': '📌',
      };

      const prioridadEmoji = {
        'critica': '🔴',
        'alta': '🟠',
        'media': '🟡',
        'baja': '🟢',
      };

      let mensaje = '📢 *Avisos Activos*\n\n';

      const keyboard = [];

      avisos.forEach((aviso, index) => {
        const fecha = new Date(aviso.fecha_inicio).toLocaleDateString('es-CL');
        const tipoIcon = tipoEmoji[aviso.tipo] || '📌';
        const prioridadIcon = prioridadEmoji[aviso.prioridad] || '🟢';

        mensaje += `${index + 1}. ${tipoIcon} ${prioridadIcon} *${aviso.titulo}*\n`;
        mensaje += `   📅 ${fecha}\n`;
        mensaje += `   ${aviso.mensaje.substring(0, 80)}...\n\n`;
      });

      // Solo agregar botón de URL si no es localhost
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || '';
      if (siteUrl && !siteUrl.includes('localhost')) {
        keyboard.push([{
          text: '📢 Ver Todos los Avisos',
          url: `${siteUrl}/avisos`
        }]);
      }

      keyboard.push([{ text: '🔄 Actualizar', callback_data: 'avisos' }]);

      // Si estamos en localhost, agregar mensaje informativo
      if (siteUrl.includes('localhost') || !siteUrl) {
        mensaje += '\n💡 _Para ver el contenido completo, visita la plataforma web_';
      }

      await bot.sendMessage(chatId, mensaje, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: keyboard
        }
      });

    } catch (error) {
      console.error('Error obteniendo avisos:', error);
      bot.sendMessage(chatId, '⚠️ Error al obtener avisos. Intenta nuevamente más tarde.');
    }
  });

  // ============================================================
  // COMANDO: /perfil
  // ============================================================
  bot.onText(/\/perfil/, async (msg) => {
    const chatId = msg.chat.id;

    try {
      const supabase = createClient();

      const { data: usuario, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('telegram_chat_id', chatId.toString())
        .single();

      if (error || !usuario) {
        return bot.sendMessage(
          chatId,
          '❌ No tienes una cuenta vinculada.\n\nUsa /vincular TU_RUT para vincular tu cuenta.'
        );
      }

      const mensaje = `👤 *Tu Perfil*

*Nombre:* ${usuario.nombres} ${usuario.apellidos}
*RUT:* ${usuario.rut}
*Email:* ${usuario.email}
*Teléfono:* ${usuario.telefono || 'No registrado'}
*Dirección:* ${usuario.direccion || 'No registrada'}

*Estado:* ${usuario.estado === 'activo' ? '✅ Activo' : '⚠️ ' + usuario.estado}
*Rol:* ${usuario.rol}

*Notificaciones:* ${formatPreferenceLabel(usuario.preferencia_notificacion)}`;

      // Solo agregar botón de URL si no es localhost
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || '';
      const keyboard = [];

      if (siteUrl && !siteUrl.includes('localhost')) {
        keyboard.push([{ text: '🌐 Ver Perfil Completo', url: `${siteUrl}/perfil` }]);
      }
      keyboard.push([{ text: '🔗 Desvincular', callback_data: 'desvincular_confirm' }]);

      await bot.sendMessage(chatId, mensaje, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: keyboard
        }
      });

    } catch (error) {
      console.error('Error obteniendo perfil:', error);
      bot.sendMessage(chatId, '⚠️ Error al obtener tu perfil.');
    }
  });

  // ============================================================
  // COMANDO: /desvincular
  // ============================================================
  bot.onText(/\/desvincular/, async (msg) => {
    const chatId = msg.chat.id;

    await bot.sendMessage(
      chatId,
      '⚠️ *¿Estás seguro de desvincular tu cuenta?*\n\nDejarás de recibir notificaciones por Telegram.',
      {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              { text: '✅ Sí, desvincular', callback_data: 'desvincular_confirm' },
              { text: '❌ Cancelar', callback_data: 'cancel' },
            ]
          ]
        }
      }
    );
  });

  // ============================================================
  // CALLBACK QUERIES (Botones Inline)
  // ============================================================
  bot.on('callback_query', async (query) => {
    const chatId = query.message.chat.id;
    const data = query.data;
    const messageId = query.message.message_id;

    // Responder al callback para quitar loading
    await bot.answerCallbackQuery(query.id);

    switch (data) {
      case 'vincular_info':
        bot.sendMessage(
          chatId,
          `🔗 *Cómo vincular tu cuenta*

Para recibir notificaciones por Telegram, necesitas vincular tu cuenta de VecindApp.

*Paso 1:* Asegúrate de estar registrado en VecindApp y que tu cuenta esté aprobada.

*Paso 2:* Envía el comando:
\`/vincular TU_RUT\`

*Ejemplo:*
\`/vincular 12345678-9\`

*Paso 3:* Recibirás una confirmación y comenzarás a recibir notificaciones.

¿Necesitas ayuda? Usa /ayuda`,
          { parse_mode: 'Markdown' }
        );
        break;

      case 'noticias':
        // Simular comando /noticias
        bot.sendMessage(chatId, '/noticias');
        break;

      case 'avisos':
        // Simular comando /avisos
        bot.sendMessage(chatId, '/avisos');
        break;

      case 'desvincular_confirm':
        try {
          const supabase = createClient();

          const { data: usuario, error: fetchError } = await supabase
            .from('usuarios')
            .select('id, preferencia_notificacion')
            .eq('telegram_chat_id', chatId.toString())
            .single();

          if (fetchError || !usuario) {
            throw fetchError || new Error('Usuario no encontrado');
          }

          const newPreference = removeChannelFromPreference(usuario.preferencia_notificacion, 'telegram');

          const { error: updateError } = await supabase
            .from('usuarios')
            .update({
              telegram_chat_id: null,
              preferencia_notificacion: newPreference
            })
            .eq('id', usuario.id);

          if (updateError) throw updateError;

          bot.editMessageText(
            '✅ Cuenta desvinculada exitosamente.\n\nVolverás a recibir notificaciones por email.\n\nPuedes volver a vincular cuando quieras con /vincular',
            {
              chat_id: chatId,
              message_id: messageId
            }
          );

        } catch (error) {
          console.error('Error desvinculando cuenta:', error);
          bot.sendMessage(chatId, '⚠️ Error al desvincular la cuenta.');
        }
        break;

      case 'cancel':
        bot.editMessageText(
          'Operación cancelada.',
          {
            chat_id: chatId,
            message_id: messageId
          }
        );
        break;
    }
  });

  console.log('✅ Comandos de Telegram registrados');
}

// NO auto-registrar comandos - se debe llamar explícitamente desde donde se necesite
// En desarrollo: desde un punto de entrada dedicado
// En producción: desde el webhook al recibir mensajes
