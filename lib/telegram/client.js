// lib/telegram/client.js
import TelegramBot from 'node-telegram-bot-api';

const token = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API_URL = `https://api.telegram.org/bot${token}`;

if (!token) {
  console.warn('⚠️ TELEGRAM_BOT_TOKEN no configurado. El bot de Telegram no funcionará.');
}

// Variable global para evitar múltiples instancias en desarrollo (hot reload)
if (typeof globalThis.telegramBot === 'undefined') {
  globalThis.telegramBot = null;
  globalThis.telegramBotInitialized = false;
}

/**
 * Cliente ligero de Telegram usando fetch (sin polling)
 * Ideal para funciones serverless en Vercel
 */
export const telegramApi = {
  async sendMessage(chatId, text, options = {}) {
    if (!token) throw new Error('TELEGRAM_BOT_TOKEN no configurado');

    const response = await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        ...options
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Telegram API error: ${error.description}`);
    }

    return response.json();
  },

  async getMe() {
    if (!token) throw new Error('TELEGRAM_BOT_TOKEN no configurado');

    const response = await fetch(`${TELEGRAM_API_URL}/getMe`);
    const data = await response.json();

    if (!data.ok) {
      throw new Error(`Telegram API error: ${data.description}`);
    }

    return data.result;
  },

  async setWebhook(url) {
    if (!token) throw new Error('TELEGRAM_BOT_TOKEN no configurado');

    const response = await fetch(`${TELEGRAM_API_URL}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });

    const data = await response.json();

    if (!data.ok) {
      throw new Error(`Telegram API error: ${data.description}`);
    }

    return data.result;
  },

  async deleteWebhook(dropPendingUpdates = false) {
    if (!token) throw new Error('TELEGRAM_BOT_TOKEN no configurado');

    const response = await fetch(`${TELEGRAM_API_URL}/deleteWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ drop_pending_updates: dropPendingUpdates })
    });

    const data = await response.json();

    if (!data.ok) {
      throw new Error(`Telegram API error: ${data.description}`);
    }

    return data.result;
  },

  async getWebhookInfo() {
    if (!token) throw new Error('TELEGRAM_BOT_TOKEN no configurado');

    const response = await fetch(`${TELEGRAM_API_URL}/getWebhookInfo`);
    const data = await response.json();

    if (!data.ok) {
      throw new Error(`Telegram API error: ${data.description}`);
    }

    return data.result;
  }
};

/**
 * Obtiene o crea la instancia del bot de Telegram
 * SOLO para desarrollo con polling
 * En producción usa telegramApi en su lugar
 */
function getBot() {
  // En producción, NO crear instancia de bot (usar telegramApi)
  if (process.env.NODE_ENV === 'production') {
    console.warn('⚠️ getBot() no debe usarse en producción. Usa telegramApi en su lugar.');
    return null;
  }

  // Si ya existe una instancia, retornarla
  if (globalThis.telegramBot) {
    return globalThis.telegramBot;
  }

  // Si no hay token, retornar null
  if (!token) {
    return null;
  }

  // Crear nueva instancia SOLO en desarrollo
  try {
    const bot = new TelegramBot(token, {
      polling: {
        interval: 1000,
        autoStart: true,
        params: {
          timeout: 10
        }
      }
    });

    // Guardar en global para reutilizar
    globalThis.telegramBot = bot;

    console.log('📱 Telegram Bot iniciado en modo POLLING (desarrollo)');

    // Manejar errores de polling para evitar crashes
    bot.on('polling_error', (error) => {
      if (error.code === 'ETELEGRAM' && error.message.includes('409 Conflict')) {
        console.warn('⚠️ Conflicto de polling detectado (normal en hot reload). Ignorando...');
      } else {
        console.error('❌ Error de polling:', error.message);
      }
    });

    return bot;
  } catch (error) {
    console.error('❌ Error inicializando bot de Telegram:', error);
    return null;
  }
}

/**
 * Configura el webhook de Telegram (solo para producción)
 * Usa telegramApi (fetch) en lugar de TelegramBot para evitar timeouts en Vercel
 */
export async function setupWebhook() {
  if (process.env.NODE_ENV === 'development') {
    console.log('⏭️ Webhook no necesario en desarrollo (usando polling)');
    return { ok: true, message: 'Polling mode in development' };
  }

  // Solo configurar webhook una vez por instancia
  if (globalThis.telegramBotInitialized) {
    console.log('✅ Webhook ya configurado anteriormente');
    return { ok: true, message: 'Webhook already configured' };
  }

  const webhookUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/telegram/webhook`;

  if (!webhookUrl.startsWith('https://')) {
    throw new Error(`Webhook URL debe ser HTTPS: ${webhookUrl}`);
  }

  try {
    // Eliminar webhook anterior si existe (usando API fetch)
    await telegramApi.deleteWebhook(true);
    console.log('🗑️ Webhook anterior eliminado');

    // Configurar nuevo webhook (usando API fetch)
    await telegramApi.setWebhook(webhookUrl);
    console.log(`✅ Webhook configurado: ${webhookUrl}`);

    globalThis.telegramBotInitialized = true;

    // Verificar que se configuró correctamente
    const webhookInfo = await telegramApi.getWebhookInfo();
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
