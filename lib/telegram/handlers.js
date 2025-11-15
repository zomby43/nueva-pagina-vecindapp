// lib/telegram/handlers.js
import { telegramApi } from './client';
import { createClient } from '@/lib/supabase/server';

/**
 * Maneja actualizaciones de Telegram sin usar TelegramBot
 * Evita timeouts en funciones serverless de Vercel
 */
export async function handleTelegramUpdate(update) {
  // Extraer mensaje o callback query
  const message = update.message || update.callback_query?.message;
  const callbackQuery = update.callback_query;
  const chatId = message?.chat?.id || callbackQuery?.from?.id;
  const text = message?.text || '';

  if (!chatId) {
    console.warn('Update sin chatId:', update);
    return;
  }

  try {
    // Manejar comandos
    if (text.startsWith('/')) {
      await handleCommand(chatId, text, message);
      return;
    }

    // Manejar callback queries (botones)
    if (callbackQuery) {
      await handleCallbackQuery(callbackQuery);
      return;
    }

    // Mensaje normal (no comando)
    await telegramApi.sendMessage(
      chatId,
      'Usa /ayuda para ver los comandos disponibles.'
    );

  } catch (error) {
    console.error('Error manejando update:', error);
    await telegramApi.sendMessage(
      chatId,
      '❌ Hubo un error procesando tu mensaje. Intenta de nuevo más tarde.'
    ).catch(e => console.error('Error enviando mensaje de error:', e));
  }
}

/**
 * Maneja comandos de Telegram
 */
async function handleCommand(chatId, text, message) {
  const command = text.split(' ')[0].toLowerCase();
  const args = text.split(' ').slice(1);

  console.log(`📝 Comando recibido: ${command} de chat ${chatId}`);

  switch (command) {
    case '/start':
      await handleStartCommand(chatId, message.from);
      break;

    case '/ayuda':
      await handleHelpCommand(chatId);
      break;

    case '/vincular':
      await handleVincularCommand(chatId, args, message.from);
      break;

    case '/perfil':
      await handlePerfilCommand(chatId, message.from);
      break;

    case '/noticias':
      await handleNoticiasCommand(chatId);
      break;

    case '/avisos':
      await handleAvisosCommand(chatId);
      break;

    default:
      await telegramApi.sendMessage(
        chatId,
        `Comando no reconocido: ${command}\n\nUsa /ayuda para ver los comandos disponibles.`
      );
  }
}

/**
 * Comando /start
 */
async function handleStartCommand(chatId, from) {
  const firstName = from.first_name || 'Vecino';

  const message = `¡Hola ${firstName}! 👋

Bienvenido al bot de *VecindApp*.

Para vincular tu cuenta y recibir notificaciones instantáneas, usa:
/vincular TU_RUT

Ejemplo:
\`/vincular 12345678-9\`

*Otros comandos disponibles:*
/ayuda - Ver todos los comandos
/noticias - Ver últimas 2 noticias
/avisos - Ver avisos activos
/perfil - Ver tu perfil`;

  await telegramApi.sendMessage(chatId, message, {
    parse_mode: 'Markdown'
  });
}

/**
 * Comando /ayuda
 */
async function handleHelpCommand(chatId) {
  const message = `*Comandos Disponibles:*

/start - Mensaje de bienvenida
/ayuda - Ver esta lista de comandos
/vincular RUT - Vincular tu cuenta de VecindApp
/perfil - Ver información de tu perfil
/noticias - Ver las últimas 2 noticias
/avisos - Ver avisos activos de la junta

*¿Necesitas ayuda?*
Visita la plataforma web o contacta a la directiva de tu junta de vecinos.`;

  await telegramApi.sendMessage(chatId, message, {
    parse_mode: 'Markdown'
  });
}

/**
 * Comando /vincular
 */
async function handleVincularCommand(chatId, args, from) {
  if (args.length === 0) {
    await telegramApi.sendMessage(
      chatId,
      `❌ Debes proporcionar tu RUT.

Ejemplo:
\`/vincular 12345678-9\``,
      { parse_mode: 'Markdown' }
    );
    return;
  }

  const rut = args[0].trim();

  try {
    const supabase = createClient();

    // Buscar usuario por RUT
    const { data: usuario, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('rut', rut)
      .eq('estado', 'activo')
      .single();

    if (error || !usuario) {
      await telegramApi.sendMessage(
        chatId,
        `❌ No se encontró un usuario activo con el RUT: ${rut}

Asegúrate de:
• Estar registrado en VecindApp
• Tu cuenta esté aprobada por la secretaría
• El RUT sea correcto (con guión)`
      );
      return;
    }

    // Actualizar telegram_chat_id
    const { error: updateError } = await supabase
      .from('usuarios')
      .update({
        telegram_chat_id: chatId.toString(),
        preferencia_notificacion: 'telegram'
      })
      .eq('id', usuario.id);

    if (updateError) {
      throw updateError;
    }

    await telegramApi.sendMessage(
      chatId,
      `✅ *¡Cuenta vinculada exitosamente!*

Hola *${usuario.nombres} ${usuario.apellidos}*

Ahora recibirás notificaciones de:
• Nuevas noticias de la junta
• Avisos importantes
• Actualizaciones de tus solicitudes

Usa /perfil para ver tu información.`,
      { parse_mode: 'Markdown' }
    );

  } catch (error) {
    console.error('Error en /vincular:', error);
    await telegramApi.sendMessage(
      chatId,
      '❌ Hubo un error al vincular tu cuenta. Intenta de nuevo más tarde.'
    );
  }
}

/**
 * Comando /perfil
 */
async function handlePerfilCommand(chatId, from) {
  try {
    const supabase = createClient();

    const { data: usuario, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('telegram_chat_id', chatId.toString())
      .single();

    if (error || !usuario) {
      await telegramApi.sendMessage(
        chatId,
        `❌ No tienes una cuenta vinculada.

Usa /vincular para conectar tu cuenta de VecindApp.`
      );
      return;
    }

    const message = `👤 *Tu Perfil*

*Nombre:* ${usuario.nombres} ${usuario.apellidos}
*RUT:* ${usuario.rut}
*Email:* ${usuario.email}
*Dirección:* ${usuario.direccion || 'No especificada'}
*Rol:* ${usuario.rol}
*Estado:* ${usuario.estado}
*Notificaciones:* ${usuario.preferencia_notificacion || 'email'}`;

    await telegramApi.sendMessage(chatId, message, {
      parse_mode: 'Markdown'
    });

  } catch (error) {
    console.error('Error en /perfil:', error);
    await telegramApi.sendMessage(
      chatId,
      '❌ Hubo un error al obtener tu perfil.'
    );
  }
}

/**
 * Comando /noticias
 */
async function handleNoticiasCommand(chatId) {
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
      await telegramApi.sendMessage(
        chatId,
        '📰 No hay noticias publicadas en este momento.'
      );
      return;
    }

    let mensaje = '*📰 Últimas Noticias*\n\n';

    noticias.forEach((noticia, index) => {
      const fecha = new Date(noticia.fecha_publicacion).toLocaleDateString('es-CL');
      mensaje += `*${index + 1}. ${noticia.titulo}*\n`;
      mensaje += `📂 ${noticia.categoria} | 📅 ${fecha}\n`;
      if (noticia.resumen) {
        mensaje += `${noticia.resumen}\n`;
      }
      mensaje += `\n`;
    });

    mensaje += '💡 _Visita la plataforma web para ver el contenido completo_';

    await telegramApi.sendMessage(chatId, mensaje, {
      parse_mode: 'Markdown'
    });

  } catch (error) {
    console.error('Error en /noticias:', error);
    await telegramApi.sendMessage(
      chatId,
      '❌ Hubo un error al obtener las noticias.'
    );
  }
}

/**
 * Comando /avisos
 */
async function handleAvisosCommand(chatId) {
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
      await telegramApi.sendMessage(
        chatId,
        '📢 No hay avisos activos en este momento.'
      );
      return;
    }

    let mensaje = '*📢 Avisos Activos*\n\n';

    avisos.forEach((aviso, index) => {
      const fecha = new Date(aviso.fecha_inicio).toLocaleDateString('es-CL');
      const emoji = aviso.prioridad === 'alta' ? '🔴' : aviso.prioridad === 'media' ? '🟡' : '🟢';
      mensaje += `${emoji} *${aviso.titulo}*\n`;
      mensaje += `${aviso.mensaje.substring(0, 100)}...\n`;
      mensaje += `📅 ${fecha}\n\n`;
    });

    mensaje += '💡 _Visita la plataforma web para ver más detalles_';

    await telegramApi.sendMessage(chatId, mensaje, {
      parse_mode: 'Markdown'
    });

  } catch (error) {
    console.error('Error en /avisos:', error);
    await telegramApi.sendMessage(
      chatId,
      '❌ Hubo un error al obtener los avisos.'
    );
  }
}

/**
 * Maneja callback queries (botones)
 */
async function handleCallbackQuery(callbackQuery) {
  const { data, message, from } = callbackQuery;
  const chatId = message.chat.id;

  console.log(`🔘 Callback query: ${data} de chat ${chatId}`);

  // Responder al callback para quitar el "loading" del botón
  // (esto requiere usar el callback_query_id, pero por ahora lo omitimos)

  switch (data) {
    case 'vincular_info':
      await handleStartCommand(chatId, from);
      break;

    case 'noticias':
      await handleNoticiasCommand(chatId);
      break;

    case 'avisos':
      await handleAvisosCommand(chatId);
      break;

    default:
      console.log('Callback query no manejado:', data);
  }
}
