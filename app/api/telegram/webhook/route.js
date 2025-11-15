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
        message: 'Bot de Telegram no configurado',
        bot_available: false,
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }

    // Intentar configurar webhook si estamos en producción
    let webhookSetup = null;
    if (process.env.NODE_ENV === 'production') {
      try {
        webhookSetup = await setupWebhook();
      } catch (error) {
        console.error('Error configurando webhook:', error);
        return NextResponse.json({
          status: 'error',
          message: 'Error configurando webhook',
          error: error.message,
          timestamp: new Date().toISOString()
        }, { status: 500 });
      }
    }

    // Obtener info del webhook
    const webhookInfo = await bot.getWebHookInfo();

    return NextResponse.json({
      status: 'ok',
      bot_available: true,
      mode: process.env.NODE_ENV === 'development' ? 'polling' : 'webhook',
      webhook_setup: webhookSetup,
      webhook_info: webhookInfo,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error en GET webhook:', error);
    return NextResponse.json({
      status: 'error',
      message: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
