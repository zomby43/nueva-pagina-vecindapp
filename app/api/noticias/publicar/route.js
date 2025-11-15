// app/api/noticias/publicar/route.js
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { enviarCorreoNuevaNoticia } from '@/lib/emails/sendEmail';

export async function POST(request) {
  try {
    const { noticiaId } = await request.json();

    if (!noticiaId) {
      return NextResponse.json(
        { error: 'ID de noticia requerido' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Obtener la noticia
    const { data: noticia, error: fetchError } = await supabase
      .from('noticias')
      .select('*')
      .eq('id', noticiaId)
      .single();

    if (fetchError || !noticia) {
      return NextResponse.json(
        { error: 'Noticia no encontrada' },
        { status: 404 }
      );
    }

    // Actualizar estado a publicado
    const { error: updateError } = await supabase
      .from('noticias')
      .update({
        estado: 'publicado',
        fecha_publicacion: new Date().toISOString()
      })
      .eq('id', noticiaId);

    if (updateError) {
      throw updateError;
    }

    // Enviar notificaciones (email + Telegram)
    const resultadoNotificaciones = await enviarCorreoNuevaNoticia(
      noticia.titulo || 'Noticia sin título',
      noticia.resumen || '',
      noticia.categoria || 'general',
      noticiaId
    );

    return NextResponse.json({
      success: true,
      message: 'Noticia publicada exitosamente',
      notificaciones: resultadoNotificaciones
    });

  } catch (error) {
    console.error('Error publicando noticia:', error);
    return NextResponse.json(
      { error: error.message || 'Error al publicar la noticia' },
      { status: 500 }
    );
  }
}
