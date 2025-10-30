/**
 * Plantillas de correos electrónicos para VecindApp
 */

export const plantillas = {
  aprobacion_registro: (nombreCompleto) => ({
    asunto: '✅ ¡Tu registro en VecindApp ha sido aprobado!',
    html: `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Registro Aprobado - VecindApp</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #154765 0%, #439fa4 100%); padding: 40px 20px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px;">VecindApp</h1>
                    <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px;">Plataforma Vecinal Digital</p>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                      <div style="font-size: 60px; margin-bottom: 20px;">✅</div>
                      <h2 style="color: #154765; margin: 0 0 10px 0; font-size: 24px;">¡Registro Aprobado!</h2>
                    </div>
                    
                    <p style="color: #333333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                      Hola <strong>${nombreCompleto}</strong>,
                    </p>
                    
                    <p style="color: #333333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                      Nos complace informarte que tu solicitud de registro en <strong>VecindApp</strong> ha sido <strong style="color: #28a745;">aprobada exitosamente</strong>.
                    </p>
                    
                    <p style="color: #333333; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                      Ya puedes acceder a la plataforma con tu usuario y disfrutar de todos los servicios disponibles:
                    </p>
                    
                    <ul style="color: #333333; font-size: 15px; line-height: 1.8; margin-bottom: 30px;">
                      <li>Solicitar certificados de residencia</li>
                      <li>Solicitar certificados de antigüedad</li>
                      <li>Ver noticias y avisos de la junta de vecinos</li>
                      <li>Participar en proyectos comunitarios</li>
                      <li>Reservar espacios comunes</li>
                    </ul>
                    
                    <div style="text-align: center; margin: 30px 0;">
                      <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/login" 
                         style="display: inline-block; background-color: #439fa4; color: #ffffff; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                        Iniciar Sesión
                      </a>
                    </div>
                    
                    <p style="color: #666666; font-size: 14px; line-height: 1.6; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eeeeee;">
                      Si tienes alguna duda o necesitas ayuda, no dudes en contactarnos.
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eeeeee;">
                    <p style="color: #666666; font-size: 13px; margin: 0;">
                      © ${new Date().getFullYear()} VecindApp - Junta de Vecinos
                    </p>
                    <p style="color: #999999; font-size: 12px; margin: 10px 0 0 0;">
                      Este es un correo automático, por favor no responder.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
    texto: `
Hola ${nombreCompleto},

¡Tu registro en VecindApp ha sido aprobado!

Ya puedes acceder a la plataforma con tu usuario y disfrutar de todos los servicios disponibles.

Inicia sesión en: ${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/login

Saludos,
Equipo VecindApp
    `.trim()
  }),

  aprobacion_solicitud: (nombreCompleto, tipoSolicitud) => {
    const tipoTexto = tipoSolicitud === 'certificado_residencia' 
      ? 'Certificado de Residencia' 
      : tipoSolicitud === 'certificado_antiguedad'
      ? 'Certificado de Antigüedad'
      : 'Solicitud';

    return {
      asunto: `✅ Tu solicitud de ${tipoTexto} ha sido aprobada`,
      html: `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Solicitud Aprobada - VecindApp</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #154765 0%, #439fa4 100%); padding: 40px 20px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 28px;">VecindApp</h1>
                      <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px;">Plataforma Vecinal Digital</p>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <div style="text-align: center; margin-bottom: 30px;">
                        <div style="font-size: 60px; margin-bottom: 20px;">📄✅</div>
                        <h2 style="color: #154765; margin: 0 0 10px 0; font-size: 24px;">¡Solicitud Aprobada!</h2>
                      </div>
                      
                      <p style="color: #333333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                        Hola <strong>${nombreCompleto}</strong>,
                      </p>
                      
                      <p style="color: #333333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                        Nos complace informarte que tu solicitud de <strong style="color: #439fa4;">${tipoTexto}</strong> ha sido <strong style="color: #28a745;">aprobada exitosamente</strong>.
                      </p>
                      
                      <div style="background-color: #e8f5e9; border-left: 4px solid #28a745; padding: 15px; margin: 25px 0; border-radius: 4px;">
                        <p style="color: #2e7d32; font-size: 15px; margin: 0; line-height: 1.6;">
                          <strong>📋 Estado:</strong> Aprobado<br>
                          <strong>📄 Tipo:</strong> ${tipoTexto}
                        </p>
                      </div>
                      
                      <p style="color: #333333; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                        Puedes descargar tu certificado ingresando a la plataforma en la sección de "Mis Solicitudes".
                      </p>
                      
                      <div style="text-align: center; margin: 30px 0;">
                        <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/solicitudes" 
                           style="display: inline-block; background-color: #439fa4; color: #ffffff; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                          Ver Mis Solicitudes
                        </a>
                      </div>
                      
                      <p style="color: #666666; font-size: 14px; line-height: 1.6; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eeeeee;">
                        Si tienes alguna duda, no dudes en contactarnos.
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eeeeee;">
                      <p style="color: #666666; font-size: 13px; margin: 0;">
                        © ${new Date().getFullYear()} VecindApp - Junta de Vecinos
                      </p>
                      <p style="color: #999999; font-size: 12px; margin: 10px 0 0 0;">
                        Este es un correo automático, por favor no responder.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
      texto: `
Hola ${nombreCompleto},

¡Tu solicitud de ${tipoTexto} ha sido aprobada!

Puedes descargar tu certificado ingresando a la plataforma en la sección de "Mis Solicitudes".

Ver solicitudes: ${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/solicitudes

Saludos,
Equipo VecindApp
      `.trim()
    };
  },

  rechazo_solicitud: (nombreCompleto, tipoSolicitud, motivo) => {
    const tipoTexto = tipoSolicitud === 'certificado_residencia' 
      ? 'Certificado de Residencia' 
      : tipoSolicitud === 'certificado_antiguedad'
      ? 'Certificado de Antigüedad'
      : 'Solicitud';

    return {
      asunto: `❌ Tu solicitud de ${tipoTexto} requiere atención`,
      html: `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Solicitud - VecindApp</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #154765 0%, #439fa4 100%); padding: 40px 20px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 28px;">VecindApp</h1>
                      <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px;">Plataforma Vecinal Digital</p>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <div style="text-align: center; margin-bottom: 30px;">
                        <div style="font-size: 60px; margin-bottom: 20px;">📄⚠️</div>
                        <h2 style="color: #154765; margin: 0 0 10px 0; font-size: 24px;">Actualización de Solicitud</h2>
                      </div>
                      
                      <p style="color: #333333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                        Hola <strong>${nombreCompleto}</strong>,
                      </p>
                      
                      <p style="color: #333333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                        Tu solicitud de <strong>${tipoTexto}</strong> requiere atención.
                      </p>
                      
                      ${motivo ? `
                      <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 25px 0; border-radius: 4px;">
                        <p style="color: #856404; font-size: 15px; margin: 0; line-height: 1.6;">
                          <strong>📝 Observación:</strong><br>
                          ${motivo}
                        </p>
                      </div>
                      ` : ''}
                      
                      <p style="color: #333333; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                        Por favor, comunícate con la secretaría para más información o presenta una nueva solicitud con los datos correctos.
                      </p>
                      
                      <div style="text-align: center; margin: 30px 0;">
                        <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/solicitudes" 
                           style="display: inline-block; background-color: #439fa4; color: #ffffff; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                          Ver Mis Solicitudes
                        </a>
                      </div>
                      
                      <p style="color: #666666; font-size: 14px; line-height: 1.6; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eeeeee;">
                        Si tienes dudas, no dudes en contactarnos.
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eeeeee;">
                      <p style="color: #666666; font-size: 13px; margin: 0;">
                        © ${new Date().getFullYear()} VecindApp - Junta de Vecinos
                      </p>
                      <p style="color: #999999; font-size: 12px; margin: 10px 0 0 0;">
                        Este es un correo automático, por favor no responder.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
      texto: `
Hola ${nombreCompleto},

Tu solicitud de ${tipoTexto} requiere atención.

${motivo ? `Observación: ${motivo}` : ''}

Por favor, comunícate con la secretaría para más información.

Ver solicitudes: ${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/solicitudes

Saludos,
Equipo VecindApp
      `.trim()
    };
  },

  solicitud_reserva: (nombreCompleto, espacio, fechaReserva, bloqueHorario) => {
    const bloques = {
      manana: 'Mañana (9:00 - 13:00)',
      tarde: 'Tarde (14:00 - 18:00)',
      noche: 'Noche (19:00 - 23:00)',
      dia_completo: 'Día Completo (9:00 - 23:00)'
    };
    const bloqueTexto = bloques[bloqueHorario] || bloqueHorario;
    const fechaFormateada = new Date(fechaReserva + 'T00:00:00').toLocaleDateString('es-CL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return {
      asunto: '🏟️ Solicitud de reserva recibida - ' + espacio,
      html: `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Solicitud de Reserva - VecindApp</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #154765 0%, #439fa4 100%); padding: 40px 20px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 28px;">VecindApp</h1>
                      <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px;">Plataforma Vecinal Digital</p>
                    </td>
                  </tr>

                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <div style="text-align: center; margin-bottom: 30px;">
                        <div style="font-size: 60px; margin-bottom: 20px;">🏟️📝</div>
                        <h2 style="color: #154765; margin: 0 0 10px 0; font-size: 24px;">Solicitud Recibida</h2>
                      </div>

                      <p style="color: #333333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                        Hola <strong>${nombreCompleto}</strong>,
                      </p>

                      <p style="color: #333333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                        Hemos recibido tu solicitud de reserva de <strong style="color: #439fa4;">${espacio}</strong>.
                      </p>

                      <div style="background-color: #e8f4f5; border-left: 4px solid #439fa4; padding: 15px; margin: 25px 0; border-radius: 4px;">
                        <p style="color: #154765; font-size: 15px; margin: 0; line-height: 1.6;">
                          <strong>📍 Espacio:</strong> ${espacio}<br>
                          <strong>📅 Fecha:</strong> ${fechaFormateada}<br>
                          <strong>🕐 Horario:</strong> ${bloqueTexto}<br>
                          <strong>📋 Estado:</strong> Pendiente de aprobación
                        </p>
                      </div>

                      <p style="color: #333333; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                        La directiva revisará tu solicitud y te notificaremos cuando sea aprobada o si requiere alguna modificación.
                      </p>

                      <div style="text-align: center; margin: 30px 0;">
                        <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/reservas/mis-reservas"
                           style="display: inline-block; background-color: #439fa4; color: #ffffff; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                          Ver Mis Reservas
                        </a>
                      </div>

                      <p style="color: #666666; font-size: 14px; line-height: 1.6; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eeeeee;">
                        Si tienes alguna duda, no dudes en contactarnos.
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eeeeee;">
                      <p style="color: #666666; font-size: 13px; margin: 0;">
                        © ${new Date().getFullYear()} VecindApp - Junta de Vecinos
                      </p>
                      <p style="color: #999999; font-size: 12px; margin: 10px 0 0 0;">
                        Este es un correo automático, por favor no responder.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
      texto: `
Hola ${nombreCompleto},

Hemos recibido tu solicitud de reserva de ${espacio}.

Detalles de la reserva:
- Espacio: ${espacio}
- Fecha: ${fechaFormateada}
- Horario: ${bloqueTexto}
- Estado: Pendiente de aprobación

La directiva revisará tu solicitud y te notificaremos cuando sea aprobada.

Ver mis reservas: ${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/reservas/mis-reservas

Saludos,
Equipo VecindApp
      `.trim()
    };
  },

  aprobacion_reserva: (nombreCompleto, espacio, fechaReserva, bloqueHorario) => {
    const bloques = {
      manana: 'Mañana (9:00 - 13:00)',
      tarde: 'Tarde (14:00 - 18:00)',
      noche: 'Noche (19:00 - 23:00)',
      dia_completo: 'Día Completo (9:00 - 23:00)'
    };
    const bloqueTexto = bloques[bloqueHorario] || bloqueHorario;
    const fechaFormateada = new Date(fechaReserva + 'T00:00:00').toLocaleDateString('es-CL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return {
      asunto: '✅ Reserva aprobada - ' + espacio,
      html: `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reserva Aprobada - VecindApp</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #154765 0%, #439fa4 100%); padding: 40px 20px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 28px;">VecindApp</h1>
                      <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px;">Plataforma Vecinal Digital</p>
                    </td>
                  </tr>

                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <div style="text-align: center; margin-bottom: 30px;">
                        <div style="font-size: 60px; margin-bottom: 20px;">🏟️✅</div>
                        <h2 style="color: #154765; margin: 0 0 10px 0; font-size: 24px;">¡Reserva Aprobada!</h2>
                      </div>

                      <p style="color: #333333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                        Hola <strong>${nombreCompleto}</strong>,
                      </p>

                      <p style="color: #333333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                        Nos complace informarte que tu solicitud de reserva ha sido <strong style="color: #28a745;">aprobada exitosamente</strong>.
                      </p>

                      <div style="background-color: #e8f5e9; border-left: 4px solid #28a745; padding: 15px; margin: 25px 0; border-radius: 4px;">
                        <p style="color: #2e7d32; font-size: 15px; margin: 0; line-height: 1.6;">
                          <strong>📍 Espacio:</strong> ${espacio}<br>
                          <strong>📅 Fecha:</strong> ${fechaFormateada}<br>
                          <strong>🕐 Horario:</strong> ${bloqueTexto}<br>
                          <strong>✅ Estado:</strong> Aprobada
                        </p>
                      </div>

                      <p style="color: #333333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                        Puedes descargar tu comprobante de reserva desde la plataforma.
                      </p>

                      <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; margin: 20px 0; border-radius: 4px;">
                        <p style="color: #856404; font-size: 14px; margin: 0; line-height: 1.5;">
                          <strong>📝 Recordatorio:</strong> Por favor llega 10 minutos antes y respeta los horarios asignados.
                        </p>
                      </div>

                      <div style="text-align: center; margin: 30px 0;">
                        <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/reservas/mis-reservas"
                           style="display: inline-block; background-color: #439fa4; color: #ffffff; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                          Ver Mis Reservas
                        </a>
                      </div>

                      <p style="color: #666666; font-size: 14px; line-height: 1.6; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eeeeee;">
                        Si necesitas cancelar o modificar tu reserva, contáctanos con anticipación.
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eeeeee;">
                      <p style="color: #666666; font-size: 13px; margin: 0;">
                        © ${new Date().getFullYear()} VecindApp - Junta de Vecinos
                      </p>
                      <p style="color: #999999; font-size: 12px; margin: 10px 0 0 0;">
                        Este es un correo automático, por favor no responder.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
      texto: `
Hola ${nombreCompleto},

¡Tu reserva ha sido aprobada!

Detalles de la reserva:
- Espacio: ${espacio}
- Fecha: ${fechaFormateada}
- Horario: ${bloqueTexto}
- Estado: Aprobada ✅

Puedes descargar tu comprobante desde la plataforma.

Recordatorio: Por favor llega 10 minutos antes y respeta los horarios asignados.

Ver mis reservas: ${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/reservas/mis-reservas

Saludos,
Equipo VecindApp
      `.trim()
    };
  },

  rechazo_reserva: (nombreCompleto, espacio, fechaReserva, bloqueHorario, motivo) => {
    const bloques = {
      manana: 'Mañana (9:00 - 13:00)',
      tarde: 'Tarde (14:00 - 18:00)',
      noche: 'Noche (19:00 - 23:00)',
      dia_completo: 'Día Completo (9:00 - 23:00)'
    };
    const bloqueTexto = bloques[bloqueHorario] || bloqueHorario;
    const fechaFormateada = new Date(fechaReserva + 'T00:00:00').toLocaleDateString('es-CL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return {
      asunto: '⚠️ Actualización de reserva - ' + espacio,
      html: `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Actualización de Reserva - VecindApp</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #154765 0%, #439fa4 100%); padding: 40px 20px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 28px;">VecindApp</h1>
                      <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px;">Plataforma Vecinal Digital</p>
                    </td>
                  </tr>

                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <div style="text-align: center; margin-bottom: 30px;">
                        <div style="font-size: 60px; margin-bottom: 20px;">🏟️⚠️</div>
                        <h2 style="color: #154765; margin: 0 0 10px 0; font-size: 24px;">Actualización de Reserva</h2>
                      </div>

                      <p style="color: #333333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                        Hola <strong>${nombreCompleto}</strong>,
                      </p>

                      <p style="color: #333333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                        Lamentamos informarte que tu solicitud de reserva no ha podido ser aprobada en este momento.
                      </p>

                      <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 25px 0; border-radius: 4px;">
                        <p style="color: #856404; font-size: 15px; margin: 0; line-height: 1.6;">
                          <strong>📍 Espacio:</strong> ${espacio}<br>
                          <strong>📅 Fecha:</strong> ${fechaFormateada}<br>
                          <strong>🕐 Horario:</strong> ${bloqueTexto}
                        </p>
                      </div>

                      ${motivo ? `
                      <div style="background-color: #ffebee; border-left: 4px solid #f44336; padding: 15px; margin: 25px 0; border-radius: 4px;">
                        <p style="color: #c62828; font-size: 15px; margin: 0; line-height: 1.6;">
                          <strong>📝 Motivo:</strong><br>
                          ${motivo}
                        </p>
                      </div>
                      ` : ''}

                      <p style="color: #333333; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                        Puedes intentar reservar en otra fecha u horario. Si tienes dudas, no dudes en contactarnos.
                      </p>

                      <div style="text-align: center; margin: 30px 0;">
                        <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/reservas"
                           style="display: inline-block; background-color: #439fa4; color: #ffffff; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                          Ver Espacios Disponibles
                        </a>
                      </div>

                      <p style="color: #666666; font-size: 14px; line-height: 1.6; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eeeeee;">
                        Si necesitas más información, contáctanos.
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eeeeee;">
                      <p style="color: #666666; font-size: 13px; margin: 0;">
                        © ${new Date().getFullYear()} VecindApp - Junta de Vecinos
                      </p>
                      <p style="color: #999999; font-size: 12px; margin: 10px 0 0 0;">
                        Este es un correo automático, por favor no responder.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
      texto: `
Hola ${nombreCompleto},

Lamentamos informarte que tu solicitud de reserva no ha podido ser aprobada.

Detalles de la solicitud:
- Espacio: ${espacio}
- Fecha: ${fechaFormateada}
- Horario: ${bloqueTexto}

${motivo ? `Motivo: ${motivo}` : ''}

Puedes intentar reservar en otra fecha u horario.

Ver espacios disponibles: ${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/reservas

Saludos,
Equipo VecindApp
      `.trim()
    };
  },

  aprobacion_proyecto: (nombreCompleto, tituloProyecto) => {
    return {
      asunto: '✅ Proyecto vecinal aprobado - ' + tituloProyecto,
      html: `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Proyecto Aprobado - VecindApp</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #154765 0%, #439fa4 100%); padding: 40px 20px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 28px;">VecindApp</h1>
                      <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px;">Plataforma Vecinal Digital</p>
                    </td>
                  </tr>

                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <div style="text-align: center; margin-bottom: 30px;">
                        <div style="font-size: 60px; margin-bottom: 20px;">🏗️✅</div>
                        <h2 style="color: #154765; margin: 0 0 10px 0; font-size: 24px;">¡Proyecto Aprobado!</h2>
                      </div>

                      <p style="color: #333333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                        Hola <strong>${nombreCompleto}</strong>,
                      </p>

                      <p style="color: #333333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                        Nos complace informarte que tu proyecto vecinal <strong style="color: #439fa4;">"${tituloProyecto}"</strong> ha sido <strong style="color: #28a745;">aprobado exitosamente</strong> por la directiva.
                      </p>

                      <div style="background-color: #e8f5e9; border-left: 4px solid #28a745; padding: 15px; margin: 25px 0; border-radius: 4px;">
                        <p style="color: #2e7d32; font-size: 15px; margin: 0; line-height: 1.6;">
                          <strong>🎉 Estado:</strong> Aprobado<br>
                          <strong>📋 Proyecto:</strong> ${tituloProyecto}
                        </p>
                      </div>

                      <p style="color: #333333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                        Tu proyecto ahora está visible para toda la comunidad y comenzará su proceso de ejecución. Puedes ver el estado y detalles en la plataforma.
                      </p>

                      <div style="background-color: #e3f2fd; border-left: 4px solid #2196f3; padding: 12px; margin: 20px 0; border-radius: 4px;">
                        <p style="color: #1565c0; font-size: 14px; margin: 0; line-height: 1.5;">
                          <strong>📝 Próximos pasos:</strong><br>
                          • Revisa el timeline del proyecto<br>
                          • La directiva coordinará la ejecución<br>
                          • Te mantendremos informado del progreso
                        </p>
                      </div>

                      <div style="text-align: center; margin: 30px 0;">
                        <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/proyectos/mis-postulaciones"
                           style="display: inline-block; background-color: #439fa4; color: #ffffff; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                          Ver Mi Proyecto
                        </a>
                      </div>

                      <p style="color: #666666; font-size: 14px; line-height: 1.6; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eeeeee;">
                        ¡Felicitaciones por tu iniciativa! Juntos construimos una mejor comunidad.
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eeeeee;">
                      <p style="color: #666666; font-size: 13px; margin: 0;">
                        © ${new Date().getFullYear()} VecindApp - Junta de Vecinos
                      </p>
                      <p style="color: #999999; font-size: 12px; margin: 10px 0 0 0;">
                        Este es un correo automático, por favor no responder.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
      texto: `
Hola ${nombreCompleto},

¡Tu proyecto vecinal "${tituloProyecto}" ha sido aprobado!

Tu proyecto ahora está visible para toda la comunidad y comenzará su proceso de ejecución.

Próximos pasos:
• Revisa el timeline del proyecto
• La directiva coordinará la ejecución
• Te mantendremos informado del progreso

Ver mi proyecto: ${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/proyectos/mis-postulaciones

¡Felicitaciones por tu iniciativa!

Saludos,
Equipo VecindApp
      `.trim()
    };
  },

  rechazo_proyecto: (nombreCompleto, tituloProyecto, motivo) => {
    return {
      asunto: '⚠️ Actualización de proyecto vecinal - ' + tituloProyecto,
      html: `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Actualización de Proyecto - VecindApp</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #154765 0%, #439fa4 100%); padding: 40px 20px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 28px;">VecindApp</h1>
                      <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px;">Plataforma Vecinal Digital</p>
                    </td>
                  </tr>

                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <div style="text-align: center; margin-bottom: 30px;">
                        <div style="font-size: 60px; margin-bottom: 20px;">🏗️⚠️</div>
                        <h2 style="color: #154765; margin: 0 0 10px 0; font-size: 24px;">Actualización de Proyecto</h2>
                      </div>

                      <p style="color: #333333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                        Hola <strong>${nombreCompleto}</strong>,
                      </p>

                      <p style="color: #333333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                        Lamentamos informarte que tu proyecto vecinal <strong>"${tituloProyecto}"</strong> requiere revisión y no ha podido ser aprobado en este momento.
                      </p>

                      <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 25px 0; border-radius: 4px;">
                        <p style="color: #856404; font-size: 15px; margin: 0; line-height: 1.6;">
                          <strong>📋 Proyecto:</strong> ${tituloProyecto}
                        </p>
                      </div>

                      ${motivo ? `
                      <div style="background-color: #ffebee; border-left: 4px solid #f44336; padding: 15px; margin: 25px 0; border-radius: 4px;">
                        <p style="color: #c62828; font-size: 15px; margin: 0; line-height: 1.6;">
                          <strong>📝 Observaciones de la Directiva:</strong><br>
                          ${motivo}
                        </p>
                      </div>
                      ` : ''}

                      <p style="color: #333333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                        Te invitamos a revisar las observaciones y realizar los ajustes necesarios. Puedes presentar una nueva propuesta incorporando las sugerencias de la directiva.
                      </p>

                      <div style="background-color: #e3f2fd; border-left: 4px solid #2196f3; padding: 12px; margin: 20px 0; border-radius: 4px;">
                        <p style="color: #1565c0; font-size: 14px; margin: 0; line-height: 1.5;">
                          <strong>💡 Recomendaciones:</strong><br>
                          • Revisa los comentarios de la directiva<br>
                          • Ajusta tu propuesta según las observaciones<br>
                          • Puedes presentar una nueva postulación<br>
                          • Contacta a la directiva si tienes dudas
                        </p>
                      </div>

                      <div style="text-align: center; margin: 30px 0;">
                        <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/proyectos/postular"
                           style="display: inline-block; background-color: #439fa4; color: #ffffff; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                          Postular Nuevo Proyecto
                        </a>
                      </div>

                      <p style="color: #666666; font-size: 14px; line-height: 1.6; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eeeeee;">
                        Valoramos tu iniciativa y compromiso con la comunidad. No dudes en contactarnos para cualquier consulta.
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eeeeee;">
                      <p style="color: #666666; font-size: 13px; margin: 0;">
                        © ${new Date().getFullYear()} VecindApp - Junta de Vecinos
                      </p>
                      <p style="color: #999999; font-size: 12px; margin: 10px 0 0 0;">
                        Este es un correo automático, por favor no responder.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
      texto: `
Hola ${nombreCompleto},

Tu proyecto vecinal "${tituloProyecto}" requiere revisión y no ha podido ser aprobado en este momento.

${motivo ? `Observaciones de la Directiva:\n${motivo}\n` : ''}

Recomendaciones:
• Revisa los comentarios de la directiva
• Ajusta tu propuesta según las observaciones
• Puedes presentar una nueva postulación
• Contacta a la directiva si tienes dudas

Postular nuevo proyecto: ${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/proyectos/postular

Valoramos tu iniciativa y compromiso con la comunidad.

Saludos,
Equipo VecindApp
      `.trim()
    };
  },

  // ============================================
  // TEMPLATES PARA ACTIVIDADES VECINALES
  // ============================================

  inscripcion_actividad: (nombreCompleto, tituloActividad, fechaInicio, categoria) => {
    const fechaFormateada = new Date(fechaInicio).toLocaleDateString('es-CL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    return {
      asunto: '🎯 Inscripción recibida - ' + tituloActividad,
      html: `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Inscripción a Actividad - VecindApp</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #154765 0%, #439fa4 100%); padding: 40px 20px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 28px;">VecindApp</h1>
                      <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px;">Plataforma Vecinal Digital</p>
                    </td>
                  </tr>

                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <div style="text-align: center; margin-bottom: 30px;">
                        <div style="font-size: 60px; margin-bottom: 20px;">🎯📝</div>
                        <h2 style="color: #154765; margin: 0 0 10px 0; font-size: 24px;">¡Inscripción Recibida!</h2>
                      </div>

                      <p style="color: #333333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                        Hola <strong>${nombreCompleto}</strong>,
                      </p>

                      <p style="color: #333333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                        Hemos recibido tu inscripción a la actividad <strong style="color: #439fa4;">"${tituloActividad}"</strong>.
                      </p>

                      <div style="background-color: #e8f4f5; border-left: 4px solid #439fa4; padding: 15px; margin: 25px 0; border-radius: 4px;">
                        <p style="color: #154765; font-size: 15px; margin: 0; line-height: 1.6;">
                          <strong>🎯 Actividad:</strong> ${tituloActividad}<br>
                          <strong>📂 Categoría:</strong> ${categoria}<br>
                          <strong>📅 Fecha:</strong> ${fechaFormateada}<br>
                          <strong>📋 Estado:</strong> Pendiente de confirmación
                        </p>
                      </div>

                      <p style="color: #333333; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                        La secretaría revisará tu inscripción y te notificaremos cuando sea confirmada. Te recordamos revisar los requisitos de la actividad antes de la fecha de inicio.
                      </p>

                      <div style="text-align: center; margin: 30px 0;">
                        <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/actividades/mis-inscripciones"
                           style="display: inline-block; background-color: #439fa4; color: #ffffff; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                          Ver Mis Inscripciones
                        </a>
                      </div>

                      <p style="color: #666666; font-size: 14px; line-height: 1.6; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eeeeee;">
                        Si tienes alguna duda, no dudes en contactarnos.
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eeeeee;">
                      <p style="color: #666666; font-size: 13px; margin: 0;">
                        © ${new Date().getFullYear()} VecindApp - Junta de Vecinos
                      </p>
                      <p style="color: #999999; font-size: 12px; margin: 10px 0 0 0;">
                        Este es un correo automático, por favor no responder.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
      texto: `
Hola ${nombreCompleto},

¡Hemos recibido tu inscripción a la actividad "${tituloActividad}"!

Detalles de la actividad:
- Actividad: ${tituloActividad}
- Categoría: ${categoria}
- Fecha: ${fechaFormateada}
- Estado: Pendiente de confirmación

La secretaría revisará tu inscripción y te notificaremos cuando sea confirmada.

Ver mis inscripciones: ${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/actividades/mis-inscripciones

Saludos,
Equipo VecindApp
      `.trim()
    };
  },

  aprobacion_inscripcion_actividad: (nombreCompleto, tituloActividad, fechaInicio, ubicacion, enlaceVideollamada = null) => {
    const fechaFormateada = new Date(fechaInicio).toLocaleDateString('es-CL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    return {
      asunto: '✅ Inscripción confirmada - ' + tituloActividad,
      html: `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Inscripción Confirmada - VecindApp</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #154765 0%, #439fa4 100%); padding: 40px 20px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 28px;">VecindApp</h1>
                      <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px;">Plataforma Vecinal Digital</p>
                    </td>
                  </tr>

                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <div style="text-align: center; margin-bottom: 30px;">
                        <div style="font-size: 60px; margin-bottom: 20px;">🎯✅</div>
                        <h2 style="color: #154765; margin: 0 0 10px 0; font-size: 24px;">¡Inscripción Confirmada!</h2>
                      </div>

                      <p style="color: #333333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                        Hola <strong>${nombreCompleto}</strong>,
                      </p>

                      <p style="color: #333333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                        Nos complace informarte que tu inscripción a <strong style="color: #439fa4;">"${tituloActividad}"</strong> ha sido <strong style="color: #28a745;">confirmada exitosamente</strong>.
                      </p>

                      <div style="background-color: #e8f5e9; border-left: 4px solid #28a745; padding: 15px; margin: 25px 0; border-radius: 4px;">
                        <p style="color: #2e7d32; font-size: 15px; margin: 0; line-height: 1.6;">
                          <strong>🎯 Actividad:</strong> ${tituloActividad}<br>
                          <strong>📅 Fecha:</strong> ${fechaFormateada}<br>
                          <strong>📍 Ubicación:</strong> ${ubicacion || 'Por confirmar'}<br>
                          ${enlaceVideollamada ? `<strong>💻 Enlace de Videollamada:</strong> <a href="${enlaceVideollamada}" style="color: #2e7d32; text-decoration: underline;">${enlaceVideollamada}</a><br>` : ''}
                          <strong>✅ Estado:</strong> Confirmada
                        </p>
                      </div>

                      ${enlaceVideollamada ? `
                      <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; margin: 20px 0; border-radius: 4px;">
                        <p style="color: #856404; font-size: 14px; margin: 0; line-height: 1.5;">
                          <strong>💻 Enlace de Videollamada:</strong><br>
                          Guarda este enlace para acceder a la actividad virtual:<br>
                          <a href="${enlaceVideollamada}" style="color: #856404; font-weight: bold; text-decoration: underline; word-break: break-all;">${enlaceVideollamada}</a>
                        </p>
                      </div>
                      ` : ''}

                      <div style="background-color: #e3f2fd; border-left: 4px solid #2196f3; padding: 12px; margin: 20px 0; border-radius: 4px;">
                        <p style="color: #1565c0; font-size: 14px; margin: 0; line-height: 1.5;">
                          <strong>📝 Recordatorios importantes:</strong><br>
                          ${enlaceVideollamada ? '• Guarda el enlace de videollamada<br>' : ''}
                          • Llega 10 minutos antes del inicio<br>
                          • Revisa los requisitos de la actividad<br>
                          • Trae los materiales necesarios (si aplica)<br>
                          • Si no puedes asistir, cancela tu inscripción con anticipación
                        </p>
                      </div>

                      <div style="text-align: center; margin: 30px 0;">
                        <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/actividades/mis-inscripciones"
                           style="display: inline-block; background-color: #439fa4; color: #ffffff; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                          Ver Mis Inscripciones
                        </a>
                      </div>

                      <p style="color: #666666; font-size: 14px; line-height: 1.6; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eeeeee;">
                        ¡Nos vemos pronto! Si tienes dudas, contáctanos.
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eeeeee;">
                      <p style="color: #666666; font-size: 13px; margin: 0;">
                        © ${new Date().getFullYear()} VecindApp - Junta de Vecinos
                      </p>
                      <p style="color: #999999; font-size: 12px; margin: 10px 0 0 0;">
                        Este es un correo automático, por favor no responder.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
      texto: `
Hola ${nombreCompleto},

¡Tu inscripción a "${tituloActividad}" ha sido confirmada!

Detalles de la actividad:
- Actividad: ${tituloActividad}
- Fecha: ${fechaFormateada}
- Ubicación: ${ubicacion || 'Por confirmar'}
${enlaceVideollamada ? `- Enlace de Videollamada: ${enlaceVideollamada}` : ''}
- Estado: Confirmada ✅

${enlaceVideollamada ? `IMPORTANTE - Enlace de Videollamada:\nGuarda este enlace para acceder a la actividad virtual:\n${enlaceVideollamada}\n` : ''}
Recordatorios importantes:
${enlaceVideollamada ? '• Guarda el enlace de videollamada\n' : ''}• Llega 10 minutos antes del inicio
• Revisa los requisitos de la actividad
• Trae los materiales necesarios (si aplica)
• Si no puedes asistir, cancela tu inscripción con anticipación

Ver mis inscripciones: ${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/actividades/mis-inscripciones

¡Nos vemos pronto!

Saludos,
Equipo VecindApp
      `.trim()
    };
  },

  rechazo_inscripcion_actividad: (nombreCompleto, tituloActividad, motivo) => {
    return {
      asunto: '⚠️ Actualización de inscripción - ' + tituloActividad,
      html: `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Actualización de Inscripción - VecindApp</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #154765 0%, #439fa4 100%); padding: 40px 20px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 28px;">VecindApp</h1>
                      <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px;">Plataforma Vecinal Digital</p>
                    </td>
                  </tr>

                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <div style="text-align: center; margin-bottom: 30px;">
                        <div style="font-size: 60px; margin-bottom: 20px;">🎯⚠️</div>
                        <h2 style="color: #154765; margin: 0 0 10px 0; font-size: 24px;">Actualización de Inscripción</h2>
                      </div>

                      <p style="color: #333333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                        Hola <strong>${nombreCompleto}</strong>,
                      </p>

                      <p style="color: #333333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                        Lamentamos informarte que tu inscripción a <strong>"${tituloActividad}"</strong> no ha podido ser confirmada en este momento.
                      </p>

                      <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 25px 0; border-radius: 4px;">
                        <p style="color: #856404; font-size: 15px; margin: 0; line-height: 1.6;">
                          <strong>🎯 Actividad:</strong> ${tituloActividad}
                        </p>
                      </div>

                      ${motivo ? `
                      <div style="background-color: #ffebee; border-left: 4px solid #f44336; padding: 15px; margin: 25px 0; border-radius: 4px;">
                        <p style="color: #c62828; font-size: 15px; margin: 0; line-height: 1.6;">
                          <strong>📝 Motivo:</strong><br>
                          ${motivo}
                        </p>
                      </div>
                      ` : ''}

                      <p style="color: #333333; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                        Te invitamos a explorar otras actividades disponibles o contactar a la secretaría si tienes dudas sobre este proceso.
                      </p>

                      <div style="text-align: center; margin: 30px 0;">
                        <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/actividades"
                           style="display: inline-block; background-color: #439fa4; color: #ffffff; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                          Ver Otras Actividades
                        </a>
                      </div>

                      <p style="color: #666666; font-size: 14px; line-height: 1.6; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eeeeee;">
                        Si necesitas más información, contáctanos.
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eeeeee;">
                      <p style="color: #666666; font-size: 13px; margin: 0;">
                        © ${new Date().getFullYear()} VecindApp - Junta de Vecinos
                      </p>
                      <p style="color: #999999; font-size: 12px; margin: 10px 0 0 0;">
                        Este es un correo automático, por favor no responder.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
      texto: `
Hola ${nombreCompleto},

Lamentamos informarte que tu inscripción a "${tituloActividad}" no ha podido ser confirmada en este momento.

${motivo ? `Motivo: ${motivo}\n` : ''}

Te invitamos a explorar otras actividades disponibles o contactar a la secretaría si tienes dudas.

Ver actividades: ${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/actividades

Saludos,
Equipo VecindApp
      `.trim()
    };
  }
};
