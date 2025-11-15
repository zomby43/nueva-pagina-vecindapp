// app/api/avisos/publicar/route.js
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { enviarCorreoNuevoAviso } from '@/lib/emails/sendEmail';

export async function POST(request) {
  try {
    const { avisoId } = await request.json();

    if (!avisoId) {
      return NextResponse.json(
        { error: 'ID de aviso requerido' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Obtener el aviso
    const { data: aviso, error: fetchError } = await supabase
      .from('avisos')
      .select('*')
      .eq('id', avisoId)
      .single();

    if (fetchError || !aviso) {
      return NextResponse.json(
        { error: 'Aviso no encontrado' },
        { status: 404 }
      );
    }

    // Enviar notificaciones (email + Telegram)
    const resultadoNotificaciones = await enviarCorreoNuevoAviso(
      aviso.titulo || 'Aviso sin título',
      aviso.mensaje || '',
      aviso.tipo || 'informativo',
      aviso.prioridad || 'media',
      avisoId
    );

    return NextResponse.json({
      success: true,
      message: 'Notificaciones de aviso enviadas exitosamente',
      notificaciones: resultadoNotificaciones
    });

  } catch (error) {
    console.error('Error enviando notificaciones de aviso:', error);
    return NextResponse.json(
      { error: error.message || 'Error al enviar notificaciones' },
      { status: 500 }
    );
  }
}
