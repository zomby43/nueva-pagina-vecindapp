import { NextResponse } from 'next/server';
import { enviarNotificacionTelegramNoticia } from '@/lib/telegram/notifications';

export async function POST(request) {
  try {
    const { tituloNoticia, resumen, categoria, idNoticia } = await request.json();

    if (!tituloNoticia || !idNoticia) {
      return NextResponse.json(
        { success: false, error: 'Faltan datos para enviar la notificación' },
        { status: 400 }
      );
    }

    const result = await enviarNotificacionTelegramNoticia(
      tituloNoticia,
      resumen,
      categoria,
      idNoticia
    );

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('❌ Error enviando notificación de noticia por Telegram:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Error al enviar notificación por Telegram',
      },
      { status: 500 }
    );
  }
}
