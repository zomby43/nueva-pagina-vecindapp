import { NextResponse } from 'next/server';
import { plantillas } from '@/lib/emails/templates';
import sgMail from '@sendgrid/mail';

/**
 * API Route para enviar correos electrónicos usando SendGrid
 * 
 * Configuración requerida en .env.local:
 * - SENDGRID_API_KEY: Tu API key de SendGrid
 * - SENDGRID_FROM_EMAIL: Email verificado en SendGrid (ej: noreply@tudominio.com)
 * - EMAIL_SERVICE_ENABLED: true para activar envío real
 */

export async function POST(request) {
  try {
    const { tipo, destinatario, nombreCompleto, tipoSolicitud, motivo, espacio, fechaReserva, bloqueHorario, tituloProyecto, tituloActividad, fechaInicio, categoria, ubicacion, enlaceVideollamada } = await request.json();

    // Validar datos requeridos
    if (!tipo || !destinatario || !nombreCompleto) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos' },
        { status: 400 }
      );
    }

    // Obtener plantilla según el tipo
    let plantilla;
    switch (tipo) {
      case 'aprobacion_registro':
        plantilla = plantillas.aprobacion_registro(nombreCompleto);
        break;
      case 'aprobacion_solicitud':
        plantilla = plantillas.aprobacion_solicitud(nombreCompleto, tipoSolicitud);
        break;
      case 'rechazo_solicitud':
        plantilla = plantillas.rechazo_solicitud(nombreCompleto, tipoSolicitud, motivo);
        break;
      case 'solicitud_reserva':
        plantilla = plantillas.solicitud_reserva(nombreCompleto, espacio, fechaReserva, bloqueHorario);
        break;
      case 'aprobacion_reserva':
        plantilla = plantillas.aprobacion_reserva(nombreCompleto, espacio, fechaReserva, bloqueHorario);
        break;
      case 'rechazo_reserva':
        plantilla = plantillas.rechazo_reserva(nombreCompleto, espacio, fechaReserva, bloqueHorario, motivo);
        break;
      case 'aprobacion_proyecto':
        plantilla = plantillas.aprobacion_proyecto(nombreCompleto, tituloProyecto);
        break;
      case 'rechazo_proyecto':
        plantilla = plantillas.rechazo_proyecto(nombreCompleto, tituloProyecto, motivo);
        break;
      case 'inscripcion_actividad':
        plantilla = plantillas.inscripcion_actividad(nombreCompleto, tituloActividad, fechaInicio, categoria);
        break;
      case 'aprobacion_inscripcion_actividad':
        plantilla = plantillas.aprobacion_inscripcion_actividad(nombreCompleto, tituloActividad, fechaInicio, ubicacion, enlaceVideollamada);
        break;
      case 'rechazo_inscripcion_actividad':
        plantilla = plantillas.rechazo_inscripcion_actividad(nombreCompleto, tituloActividad, motivo);
        break;
      default:
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
      console.log('📧 CORREO ELECTRÓNICO (Modo Desarrollo)');
      console.log('📧 ========================================');
      console.log('Para:', destinatario);
      console.log('Asunto:', plantilla.asunto);
      console.log('----------------------------------------');
      console.log(plantilla.texto);
      console.log('📧 ========================================\n');

      return NextResponse.json({
        success: true,
        message: 'Correo registrado en consola (modo desarrollo)',
        dev_mode: true
      });
    }

    // ============================================================
    // SENDGRID - ENVÍO REAL DE CORREOS
    // ============================================================
    
    // Verificar que SendGrid esté configurado
    if (!process.env.SENDGRID_API_KEY) {
      console.error('❌ SENDGRID_API_KEY no está configurado en .env.local');
      return NextResponse.json(
        { error: 'Servicio de correo no configurado correctamente' },
        { status: 500 }
      );
    }

    if (!process.env.SENDGRID_FROM_EMAIL) {
      console.error('❌ SENDGRID_FROM_EMAIL no está configurado en .env.local');
      return NextResponse.json(
        { error: 'Email de origen no configurado' },
        { status: 500 }
      );
    }

    // Configurar SendGrid
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    // Preparar mensaje
    const msg = {
      to: destinatario,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL,
        name: 'VecindApp - Junta de Vecinos'
      },
      subject: plantilla.asunto,
      text: plantilla.texto,
      html: plantilla.html,
    };

    console.log('📧 Enviando correo a:', destinatario);
    console.log('📧 Asunto:', plantilla.asunto);

    // Enviar correo
    try {
      await sgMail.send(msg);
      
      console.log('✅ Correo enviado exitosamente a:', destinatario);
      
      return NextResponse.json({
        success: true,
        message: 'Correo enviado exitosamente',
        destinatario: destinatario
      });
      
    } catch (sendError) {
      console.error('❌ Error enviando email con SendGrid:', sendError);
      
      // Detalles del error de SendGrid
      if (sendError.response) {
        console.error('SendGrid Error Body:', sendError.response.body);
      }
      
      return NextResponse.json(
        { 
          error: 'Error al enviar el correo',
          details: sendError.message 
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('❌ Error en API de emails:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
