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
  }
};
