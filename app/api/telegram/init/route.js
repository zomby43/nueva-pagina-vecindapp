// app/api/telegram/init/route.js
import { NextResponse } from 'next/server';
import getBot from '@/lib/telegram/client';
import { registerCommands } from '@/lib/telegram/commands';

/**
 * Endpoint para inicializar el bot de Telegram en desarrollo
 * Solo debe usarse en desarrollo con polling
 *
 * En producción, esto no hace nada ya que el bot se inicializa
 * automáticamente al recibir webhooks
 */
export async function GET(request) {
  try {
    // Solo permitir en desarrollo
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json({
        status: 'info',
        message: 'Este endpoint solo funciona en desarrollo. En producción usa webhooks.',
        mode: 'production',
        timestamp: new Date().toISOString()
      });
    }

    const bot = getBot();

    if (!bot) {
      return NextResponse.json({
        status: 'error',
        message: 'Bot de Telegram no configurado. Verifica TELEGRAM_BOT_TOKEN.',
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }

    // Registrar comandos
    registerCommands();

    // Obtener info del bot
    const me = await bot.getMe();

    return NextResponse.json({
      status: 'ok',
      message: 'Bot de Telegram inicializado en modo desarrollo',
      mode: 'polling',
      bot_info: {
        id: me.id,
        username: me.username,
        first_name: me.first_name
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error inicializando bot:', error);
    return NextResponse.json({
      status: 'error',
      message: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
