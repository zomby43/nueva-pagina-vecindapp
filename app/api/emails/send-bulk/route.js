import { NextResponse } from 'next/server';
import { plantillas } from '@/lib/emails/templates';
import { createAdminClient } from '@/lib/supabase/admin';
import sgMail from '@sendgrid/mail';

/**
 * API Route para envío masivo de correos a todos los vecinos activos
 *
 * Este endpoint se encarga de:
 * 1. Obtener todos los vecinos activos de la BD
 * 2. Generar el correo personalizado para cada vecino
 * 3. Enviar los correos de forma masiva
 */

export async function POST(request) {
  try {
    console.log('🔵 API /send-bulk llamada - Inicio');
    const body = await request.json();
    console.log('🔵 Body recibido:', JSON.stringify(body, null, 2));

    const { tipo, tituloNoticia, resumen, categoria, idNoticia, tituloAviso, mensajeAviso, tipoAviso, prioridad, idAviso } = body;

    // Validar datos requeridos
    if (!tipo) {
      console.log('❌ Error: Falta el tipo de correo');
      return NextResponse.json(
        { error: 'Falta el tipo de correo' },
        { status: 400 }
      );
    }

    // Crear cliente de Supabase con service role para evitar restricciones RLS
    const supabase = createAdminClient();

    // Obtener todos los vecinos con rol='vecino' y estado='activo'
    const { data: vecinos, error: vecinosError } = await supabase
      .from('usuarios')
      .select('id, email, nombres, apellidos')
      .eq('rol', 'vecino')
      .eq('estado', 'activo');

    if (vecinosError) {
      console.error('Error obteniendo vecinos:', vecinosError);
      return NextResponse.json(
        { error: 'Error al obtener la lista de vecinos' },
        { status: 500 }
      );
    }

    if (!vecinos || vecinos.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No hay vecinos activos para notificar',
        sent_count: 0
      });
    }

    // Construir URL base para los enlaces
    const baseURL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    let plantilla;
    let urlDestino;

    // Generar plantilla según el tipo
    if (tipo === 'nueva_noticia') {
      if (!tituloNoticia || !idNoticia) {
        return NextResponse.json(
          { error: 'Faltan datos de la noticia' },
          { status: 400 }
        );
      }
      urlDestino = `${baseURL}/noticias/${idNoticia}`;
    } else if (tipo === 'nuevo_aviso') {
      if (!tituloAviso || !mensajeAviso || !idAviso) {
        return NextResponse.json(
          { error: 'Faltan datos del aviso' },
          { status: 400 }
        );
      }
      urlDestino = `${baseURL}/avisos`;
    } else {
      return NextResponse.json(
        { error: 'Tipo de correo no válido' },
        { status: 400 }
      );
    }

    // ============================================================
    // MODO DESARROLLO (Log en consola)
    // ============================================================
    if (!process.env.EMAIL_SERVICE_ENABLED || process.env.EMAIL_SERVICE_ENABLED !== 'true') {
      console.log('📧 ========================================');
      console.log('📧 ENVÍO MASIVO DE CORREOS (Modo Desarrollo)');
      console.log('📧 ========================================');
      console.log('Tipo:', tipo);
      console.log('Total de vecinos a notificar:', vecinos.length);
      console.log('----------------------------------------');

      // Mostrar un ejemplo del correo que se enviaría
      const vecinoEjemplo = vecinos[0];
      const nombreCompleto = `${vecinoEjemplo.nombres} ${vecinoEjemplo.apellidos}`;

      if (tipo === 'nueva_noticia') {
        plantilla = plantillas.nueva_noticia(nombreCompleto, tituloNoticia, resumen, categoria, urlDestino);
      } else if (tipo === 'nuevo_aviso') {
        plantilla = plantillas.nuevo_aviso(nombreCompleto, tituloAviso, mensajeAviso, tipoAviso, prioridad, urlDestino);
      }

      console.log('Ejemplo de correo:');
      console.log('Para:', vecinoEjemplo.email);
      console.log('Asunto:', plantilla.asunto);
      console.log('----------------------------------------');
      console.log(plantilla.texto);
      console.log('📧 ========================================\n');

      return NextResponse.json({
        success: true,
        message: 'Correos registrados en consola (modo desarrollo)',
        dev_mode: true,
        sent_count: vecinos.length,
        recipients_sample: vecinos.slice(0, 3).map(v => ({ email: v.email, nombre: `${v.nombres} ${v.apellidos}` }))
      });
    }

    // ============================================================
    // SENDGRID - ENVÍO REAL DE CORREOS MASIVOS
    // ============================================================

    // Verificar que SendGrid esté configurado
    if (!process.env.SENDGRID_API_KEY || !process.env.SENDGRID_FROM_EMAIL) {
      console.error('❌ SendGrid no está configurado correctamente');
      return NextResponse.json(
        { error: 'Servicio de correo no configurado correctamente' },
        { status: 500 }
      );
    }

    // Configurar SendGrid
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    console.log('📧 Iniciando envío masivo de correos...');
    console.log('📧 Total de destinatarios:', vecinos.length);

    // Preparar los correos para todos los vecinos
    const emails = vecinos.map((vecino, index) => {
      const nombreCompleto = `${vecino.nombres} ${vecino.apellidos}`;

      // Generar plantilla personalizada para cada vecino
      if (tipo === 'nueva_noticia') {
        plantilla = plantillas.nueva_noticia(nombreCompleto, tituloNoticia, resumen, categoria, urlDestino);
      } else if (tipo === 'nuevo_aviso') {
        plantilla = plantillas.nuevo_aviso(nombreCompleto, tituloAviso, mensajeAviso, tipoAviso, prioridad, urlDestino);
      }

      return {
        to: vecino.email,
        from: {
          email: process.env.SENDGRID_FROM_EMAIL,
          name: 'VecindApp - Junta de Vecinos'
        },
        replyTo: process.env.SENDGRID_FROM_EMAIL, // Para que puedan responder
        subject: plantilla.asunto,
        text: plantilla.texto,
        html: plantilla.html,
        // Headers anti-spam
        headers: {
          'X-Entity-Ref-ID': `vecindapp-${tipo}-${Date.now()}`,
          'List-Unsubscribe': `<${baseURL}/perfil>`, // Link para darse de baja
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click'
        },
        // Categorías para analytics de SendGrid
        categories: [tipo, 'notificacion-vecinal'],
        customArgs: {
          usuario_id: vecino.id,
          indice_envio: index,
          tipo_notificacion: tipo
        },
        // Tracking (desactiva si quieres menos señales de spam)
        trackingSettings: {
          clickTracking: {
            enable: false, // Desactivar tracking de clicks reduce score de spam
            enableText: false
          },
          openTracking: {
            enable: false // Desactivar tracking de aperturas reduce score de spam
          },
          subscriptionTracking: {
            enable: true,
            text: 'Si no deseas recibir estos correos, puedes actualizar tus preferencias en tu perfil.',
            html: '<p>Si no deseas recibir estos correos, puedes <a href="' + baseURL + '/perfil">actualizar tus preferencias</a>.</p>',
            substitutionTag: '<%unsubscribe%>'
          }
        }
      };
    });

    let sentCount = 0;
    let errorCount = 0;
    const sendErrors = [];

    for (const email of emails) {
      try {
        await sgMail.send(email);
        sentCount += 1;
        console.log(`✅ Correo enviado a ${email.to}`);
      } catch (sendError) {
        errorCount += 1;
        sendErrors.push({
          to: email.to,
          message: sendError.message,
          response: sendError.response?.body
        });
        console.error(`❌ Error enviando correo a ${email.to}:`, sendError);
        if (sendError.response) {
          console.error('SendGrid Error Body:', sendError.response.body);
        }
      }
    }

    console.log('✅ Envío masivo completado');
    console.log(`📧 Total enviados: ${sentCount}/${vecinos.length}`);
    if (errorCount > 0) {
      console.log(`⚠️ Total con errores: ${errorCount}/${vecinos.length}`);
      return NextResponse.json(
        {
          success: false,
          message: sentCount > 0
            ? 'Algunos correos no pudieron enviarse'
            : 'No se pudo enviar ningún correo',
          sent_count: sentCount,
          error_count: errorCount,
          total_recipients: vecinos.length,
          errors: sendErrors
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Correos enviados exitosamente',
      sent_count: sentCount,
      error_count: errorCount,
      total_recipients: vecinos.length
    });

  } catch (error) {
    console.error('❌ Error en API de envío masivo de emails:', error);
    return NextResponse.json(
      {
        error: 'Error interno del servidor',
        details: error.message
      },
      { status: 500 }
    );
  }
}
