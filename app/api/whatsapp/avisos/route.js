import { NextResponse } from 'next/server';
import { enviarNotificacionWhatsAppAviso } from '@/lib/whatsapp/notifications';

export async function POST(request) {
  try {
    const { tituloAviso, mensajeAviso, tipo, prioridad, idAviso } = await request.json();

    if (!tituloAviso || !mensajeAviso || !idAviso) {
      return NextResponse.json(
        { success: false, error: 'Datos insuficientes para notificar por WhatsApp' },
        { status: 400 }
      );
    }

    const result = await enviarNotificacionWhatsAppAviso(
      tituloAviso,
      mensajeAviso,
      tipo,
      prioridad,
      idAviso
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ Error en WhatsApp/avisos:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error al enviar WhatsApp' },
      { status: 500 }
    );
  }
}
