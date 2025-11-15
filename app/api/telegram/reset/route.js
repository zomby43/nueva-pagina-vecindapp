// app/api/telegram/reset/route.js
import { NextResponse } from 'next/server';
import getBot, { setupWebhook } from '@/lib/telegram/client';
import { registerCommands } from '@/lib/telegram/commands';

/**
 * Endpoint para resetear y reconfigurar el webhook de Telegram
 * Útil cuando hay mensajes pendientes o problemas con el webhook
 */
export async function GET(request) {
  try {
    const bot = getBot();

    if (!bot) {
      return NextResponse.json({
        status: 'error',
        message: 'Bot de Telegram no configurado. Verifica TELEGRAM_BOT_TOKEN.',
        env_check: {
          token_set: !!process.env.TELEGRAM_BOT_TOKEN,
          site_url: process.env.NEXT_PUBLIC_SITE_URL || 'NOT_SET',
          node_env: process.env.NODE_ENV
        }
      }, { status: 500 });
    }

    const steps = [];

    // Paso 1: Obtener info del bot para verificar token
    let botInfo = null;
    try {
      botInfo = await bot.getMe();
      steps.push({ step: 1, action: 'Verificar token', status: 'ok', bot_username: botInfo.username });
    } catch (error) {
      steps.push({ step: 1, action: 'Verificar token', status: 'error', error: error.message });
      return NextResponse.json({
        status: 'error',
        message: 'Token de Telegram inválido',
        steps,
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }

    // Paso 2: Eliminar webhook anterior (con pending updates)
    try {
      await bot.deleteWebHook({ drop_pending_updates: true });
      steps.push({ step: 2, action: 'Eliminar webhook anterior', status: 'ok' });
    } catch (error) {
      steps.push({ step: 2, action: 'Eliminar webhook anterior', status: 'error', error: error.message });
    }

    // Paso 3: Configurar nuevo webhook (solo en producción)
    if (process.env.NODE_ENV === 'production') {
      try {
        // Resetear flag de inicialización
        globalThis.telegramBotInitialized = false;

        const webhookResult = await setupWebhook();
        steps.push({ step: 3, action: 'Configurar nuevo webhook', status: 'ok', result: webhookResult });
      } catch (error) {
        steps.push({ step: 3, action: 'Configurar nuevo webhook', status: 'error', error: error.message });
        return NextResponse.json({
          status: 'error',
          message: 'Error configurando webhook',
          steps,
          timestamp: new Date().toISOString()
        }, { status: 500 });
      }

      // Paso 4: Registrar comandos
      try {
        registerCommands();
        steps.push({ step: 4, action: 'Registrar comandos', status: 'ok' });
      } catch (error) {
        steps.push({ step: 4, action: 'Registrar comandos', status: 'warning', error: error.message });
      }
    } else {
      steps.push({ step: 3, action: 'Configurar webhook', status: 'skipped', reason: 'En desarrollo se usa polling' });
    }

    // Paso 5: Verificar estado final
    const webhookInfo = await bot.getWebHookInfo();
    steps.push({
      step: 5,
      action: 'Verificar estado final',
      status: 'ok',
      webhook_url: webhookInfo.url,
      pending_updates: webhookInfo.pending_update_count
    });

    return NextResponse.json({
      status: 'ok',
      message: 'Webhook reseteado y reconfigurado exitosamente',
      bot_info: {
        id: botInfo.id,
        username: botInfo.username,
        first_name: botInfo.first_name
      },
      steps,
      webhook_info: {
        url: webhookInfo.url,
        pending_update_count: webhookInfo.pending_update_count,
        last_error_message: webhookInfo.last_error_message
      },
      next_step: 'Envía /start a @' + botInfo.username + ' en Telegram para probar',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error en reset webhook:', error);
    return NextResponse.json({
      status: 'error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
