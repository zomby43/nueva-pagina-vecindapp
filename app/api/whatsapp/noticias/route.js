import { NextResponse } from 'next/server';
import { enviarNotificacionWhatsAppNoticia } from '@/lib/whatsapp/notifications';

export async function POST(request) {
  try {
    const { tituloNoticia, resumen, categoria, idNoticia } = await request.json();

    if (!tituloNoticia || !idNoticia) {
      return NextResponse.json(
        { success: false, error: 'Datos insuficientes para notificar por WhatsApp' },
        { status: 400 }
      );
    }

    const result = await enviarNotificacionWhatsAppNoticia(
      tituloNoticia,
      resumen,
      categoria,
      idNoticia
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ Error en WhatsApp/noticias:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error al enviar WhatsApp' },
      { status: 500 }
    );
  }
}
