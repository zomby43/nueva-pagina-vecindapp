import { NextResponse } from 'next/server';
import { enviarNotificacionTelegramAviso } from '@/lib/telegram/notifications';

export async function POST(request) {
  try {
    const { tituloAviso, mensajeAviso, tipo, prioridad, idAviso } = await request.json();

    if (!tituloAviso || !mensajeAviso || !idAviso) {
      return NextResponse.json(
        { success: false, error: 'Faltan datos para enviar la notificación' },
        { status: 400 }
      );
    }

    const result = await enviarNotificacionTelegramAviso(
      tituloAviso,
      mensajeAviso,
      tipo,
      prioridad,
      idAviso
    );

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('❌ Error enviando aviso por Telegram:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Error al enviar aviso por Telegram',
      },
      { status: 500 }
    );
  }
}
