// lib/telegram/client.js
import TelegramBot from 'node-telegram-bot-api';

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  console.warn('⚠️ TELEGRAM_BOT_TOKEN no configurado. El bot de Telegram no funcionará.');
}

// Variable global para evitar múltiples instancias en desarrollo (hot reload)
if (typeof globalThis.telegramBot === 'undefined') {
  globalThis.telegramBot = null;
  globalThis.telegramBotInitialized = false;
}

/**
 * Obtiene o crea la instancia del bot de Telegram
 * En desarrollo: usa polling
 * En producción: NO usa polling (se maneja vía webhook)
 */
function getBot() {
  // Si ya existe una instancia, retornarla
  if (globalThis.telegramBot) {
    return globalThis.telegramBot;
  }

  // Si no hay token, retornar null
  if (!token) {
    return null;
  }

  // Crear nueva instancia
  const isDevelopment = process.env.NODE_ENV === 'development';

  try {
    const bot = new TelegramBot(token, {
      polling: isDevelopment ? {
        interval: 1000,
        autoStart: true,
        params: {
          timeout: 10
        }
      } : false,
    });

    // Guardar en global para reutilizar
    globalThis.telegramBot = bot;

    if (isDevelopment) {
      console.log('📱 Telegram Bot iniciado en modo POLLING (desarrollo)');

      // Manejar errores de polling para evitar crashes
      bot.on('polling_error', (error) => {
        if (error.code === 'ETELEGRAM' && error.message.includes('409 Conflict')) {
          console.warn('⚠️ Conflicto de polling detectado (normal en hot reload). Ignorando...');
        } else {
          console.error('❌ Error de polling:', error.message);
        }
      });
    } else {
      console.log('📱 Telegram Bot iniciado en modo WEBHOOK (producción)');
    }

    return bot;
  } catch (error) {
    console.error('❌ Error inicializando bot de Telegram:', error);
    return null;
  }
}

/**
 * Configura el webhook de Telegram (solo para producción)
 * Debe ser llamado desde el endpoint de webhook al recibir la primera petición
 */
export async function setupWebhook() {
  if (process.env.NODE_ENV === 'development') {
    console.log('⏭️ Webhook no necesario en desarrollo (usando polling)');
    return { ok: true, message: 'Polling mode in development' };
  }

  const bot = getBot();
  if (!bot) {
    throw new Error('Bot de Telegram no disponible');
  }

  // Solo configurar webhook una vez
  if (globalThis.telegramBotInitialized) {
    console.log('✅ Webhook ya configurado anteriormente');
    return { ok: true, message: 'Webhook already configured' };
  }

  const webhookUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/telegram/webhook`;

  if (!webhookUrl.startsWith('https://')) {
    throw new Error(`Webhook URL debe ser HTTPS: ${webhookUrl}`);
  }

  try {
    // Eliminar webhook anterior si existe
    await bot.deleteWebHook({ drop_pending_updates: true });
    console.log('🗑️ Webhook anterior eliminado');

    // Configurar nuevo webhook
    await bot.setWebHook(webhookUrl);
    console.log(`✅ Webhook configurado: ${webhookUrl}`);

    globalThis.telegramBotInitialized = true;

    // Verificar que se configuró correctamente
    const webhookInfo = await bot.getWebHookInfo();
    console.log('📋 Info del webhook:', webhookInfo);

    return { ok: true, message: 'Webhook configured', info: webhookInfo };
  } catch (error) {
    console.error('❌ Error configurando webhook:', error);
    throw error;
  }
}

// Exportar función getter en lugar de instancia directa
export { getBot };
export default getBot;
