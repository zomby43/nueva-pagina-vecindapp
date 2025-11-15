// app/api/telegram/webhook/route.js
import { NextResponse } from 'next/server';
import { telegramApi, setupWebhook } from '@/lib/telegram/client';
import { handleTelegramUpdate } from '@/lib/telegram/handlers';

/**
 * Webhook para recibir actualizaciones de Telegram
 * Usa fetch API en lugar de TelegramBot para evitar timeouts en Vercel
 */
export async function POST(request) {
  try {
    const update = await request.json();

    console.log('📨 Telegram update recibido');

    // Procesar el update usando handlers (sin TelegramBot que causa timeout)
    await handleTelegramUpdate(update);

    return NextResponse.json({ ok: true });

  } catch (error) {
    console.error('❌ Error en webhook Telegram:', error);
    return NextResponse.json(
      { ok: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Endpoint GET para verificar y configurar el webhook
 */
export async function GET(request) {
  try {
    if (!process.env.TELEGRAM_BOT_TOKEN) {
      return NextResponse.json({
        status: 'error',
        message: 'TELEGRAM_BOT_TOKEN no configurado',
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }

    const botInfo = await telegramApi.getMe();

    let webhookSetup = null;
    if (process.env.NODE_ENV === 'production') {
      webhookSetup = await setupWebhook();
    }

    const webhookInfo = await telegramApi.getWebhookInfo();

    return NextResponse.json({
      status: 'ok',
      bot_info: botInfo,
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
