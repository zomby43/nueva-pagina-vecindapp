// app/api/telegram/webhook/route.js
import { NextResponse } from 'next/server';
import getBot, { setupWebhook } from '@/lib/telegram/client';
import { registerCommands } from '@/lib/telegram/commands';

/**
 * Webhook para recibir actualizaciones de Telegram
 * Solo usado en producción (en desarrollo se usa polling)
 */
export async function POST(request) {
  try {
    const bot = getBot();

    if (!bot) {
      console.warn('⚠️ Bot de Telegram no disponible');
      return NextResponse.json({ ok: false, error: 'Bot not configured' }, { status: 500 });
    }

    // Registrar comandos si es la primera vez
    registerCommands();

    const update = await request.json();

    // Procesar update de Telegram
    await bot.processUpdate(update);

    return NextResponse.json({ ok: true });

  } catch (error) {
    console.error('Error en webhook Telegram:', error);
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Endpoint GET para verificar y configurar el webhook
 */
export async function GET(request) {
  try {
    const bot = getBot();

    if (!bot) {
      return NextResponse.json({
        status: 'error',
        message: 'Bot de Telegram no configurado. Verifica TELEGRAM_BOT_TOKEN.',
        bot_available: false,
        env_check: {
          token_set: !!process.env.TELEGRAM_BOT_TOKEN,
          site_url: process.env.NEXT_PUBLIC_SITE_URL || 'NOT_SET',
          node_env: process.env.NODE_ENV
        },
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }

    // Obtener info del bot
    let botInfo = null;
    try {
      botInfo = await bot.getMe();
    } catch (error) {
      console.error('Error obteniendo info del bot:', error);
      return NextResponse.json({
        status: 'error',
        message: 'Token de Telegram inválido',
        error: error.message,
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }

    // Intentar configurar webhook si estamos en producción
    let webhookSetup = null;
    if (process.env.NODE_ENV === 'production') {
      try {
        webhookSetup = await setupWebhook();
        // Registrar comandos después de configurar webhook
        registerCommands();
      } catch (error) {
        console.error('Error configurando webhook:', error);
        return NextResponse.json({
          status: 'error',
          message: 'Error configurando webhook',
          error: error.message,
          site_url: process.env.NEXT_PUBLIC_SITE_URL,
          timestamp: new Date().toISOString()
        }, { status: 500 });
      }
    }

    // Obtener info del webhook
    const webhookInfo = await bot.getWebHookInfo();

    return NextResponse.json({
      status: 'ok',
      bot_available: true,
      bot_info: {
        id: botInfo.id,
        username: botInfo.username,
        first_name: botInfo.first_name
      },
      mode: process.env.NODE_ENV === 'development' ? 'polling' : 'webhook',
      webhook_setup: webhookSetup,
      webhook_info: {
        url: webhookInfo.url,
        has_custom_certificate: webhookInfo.has_custom_certificate,
        pending_update_count: webhookInfo.pending_update_count,
        last_error_date: webhookInfo.last_error_date,
        last_error_message: webhookInfo.last_error_message
      },
      env_check: {
        site_url: process.env.NEXT_PUBLIC_SITE_URL,
        node_env: process.env.NODE_ENV
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error en GET webhook:', error);
    return NextResponse.json({
      status: 'error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
