// app/api/telegram/webhook/route.js
import { NextResponse } from 'next/server';
import bot from '@/lib/telegram/client';

/**
 * Webhook para recibir actualizaciones de Telegram
 * Solo usado en producción (en desarrollo se usa polling)
 */
export async function POST(request) {
  try {
    if (!bot) {
      console.warn('⚠️ Bot de Telegram no disponible');
      return NextResponse.json({ ok: false, error: 'Bot not configured' }, { status: 500 });
    }

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
 * Endpoint GET para verificar que el webhook está activo
 */
export async function GET(request) {
  return NextResponse.json({
    status: 'Telegram webhook active',
    bot_available: !!bot,
    timestamp: new Date().toISOString()
  });
}
