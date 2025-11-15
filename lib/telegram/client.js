// lib/telegram/client.js
import TelegramBot from 'node-telegram-bot-api';

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  console.warn('⚠️ TELEGRAM_BOT_TOKEN no configurado. El bot de Telegram no funcionará.');
}

let bot = null;

// Variable global para evitar múltiples instancias en desarrollo (hot reload)
if (typeof globalThis.telegramBot === 'undefined') {
  globalThis.telegramBot = null;
}

// Reutilizar instancia existente si ya hay una
if (globalThis.telegramBot) {
  bot = globalThis.telegramBot;
  console.log('♻️ Reutilizando instancia existente del bot de Telegram');
} else if (token) {
  // Crear nueva instancia solo si no existe
  const usePolling = process.env.NODE_ENV === 'development';

  try {
    bot = new TelegramBot(token, {
      polling: usePolling ? {
        interval: 1000,
        autoStart: true,
        params: {
          timeout: 10
        }
      } : false,
    });

    // Guardar en global para reutilizar en hot reload
    globalThis.telegramBot = bot;

    if (usePolling) {
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

      // Configurar webhook en producción
      const webhookUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/telegram/webhook`;
      bot.setWebHook(webhookUrl).then(() => {
        console.log(`✅ Webhook configurado: ${webhookUrl}`);
      }).catch(error => {
        console.error('❌ Error configurando webhook:', error);
      });
    }
  } catch (error) {
    console.error('❌ Error inicializando bot de Telegram:', error);
  }
}

export { bot };
export default bot;
