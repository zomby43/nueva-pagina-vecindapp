import { createClient } from '@/lib/supabase/server';
import {
  sendWhatsAppTemplate,
  sendWhatsAppText,
  whatsappReady,
} from './client';
import { wantsChannel } from '@/lib/notifications/preferences';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || '';
const noticiaTemplate = process.env.WHATSAPP_TEMPLATE_NOTICIA || '';
const avisoTemplate = process.env.WHATSAPP_TEMPLATE_AVISO || '';

async function sendTemplateOrText(to, templateName, templateComponents, fallbackText) {
  if (templateName) {
    const templateResult = await sendWhatsAppTemplate(to, templateName, templateComponents);
    if (templateResult.success) return templateResult;
    console.warn('⚠️ WhatsApp template falló, usando mensaje de texto. Error:', templateResult.error);
  }
  return sendWhatsAppText(to, fallbackText, { preview_url: true });
}

async function getDestinatariosWhatsApp() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('usuarios')
    .select('id, nombres, apellidos, whatsapp_phone, preferencia_notificacion')
    .eq('rol', 'vecino')
    .eq('estado', 'activo')
    .not('whatsapp_phone', 'is', null);

  if (error) throw error;
  return (data || []).filter((usuario) =>
    wantsChannel(usuario.preferencia_notificacion, 'whatsapp')
  );
}

export async function enviarNotificacionWhatsAppNoticia(titulo, resumen, categoria, noticiaId) {
  if (!whatsappReady()) {
    console.log('⚠️ WhatsApp API no configurada. Notificación omitida.');
    return { success: false, sent: 0, errors: 0, message: 'WhatsApp no configurado' };
  }

  try {
    const destinatarios = await getDestinatariosWhatsApp();
    if (!destinatarios.length) {
      console.log('📱 No hay vecinos con WhatsApp habilitado.');
      return { success: true, sent: 0, errors: 0, message: 'Sin destinatarios' };
    }

    let enviados = 0;
    let errores = 0;

    for (const usuario of destinatarios) {
      try {
        const textoFallback = `📰 Nueva noticia\n\n${titulo}\n${resumen || ''}\n\n${siteUrl ? `${siteUrl}/noticias/${noticiaId}` : ''}`.trim();

        await sendTemplateOrText(
          usuario.whatsapp_phone,
          noticiaTemplate,
          [
            {
              type: 'body',
              parameters: [
                { type: 'text', text: titulo },
                { type: 'text', text: categoria || 'general' },
                { type: 'text', text: resumen || 'Revisa los detalles en VecindApp' },
              ],
            },
            ...(siteUrl
              ? [
                  {
                    type: 'button',
                    sub_type: 'url',
                    index: '0',
                    parameters: [
                      { type: 'text', text: `${siteUrl}/noticias/${noticiaId}` },
                    ],
                  },
                ]
              : []),
          ],
          textoFallback
        );

        enviados++;
        await new Promise((resolve) => setTimeout(resolve, 800));
      } catch (error) {
        console.error('Error enviando WhatsApp (noticia):', error);
        errores++;
      }
    }

    return {
      success: true,
      sent: enviados,
      errors: errores,
      total: destinatarios.length,
    };
  } catch (error) {
    console.error('Error general en WhatsApp noticia:', error);
    return { success: false, error: error.message, sent: 0, errors: 0 };
  }
}

export async function enviarNotificacionWhatsAppAviso(titulo, mensaje, tipo, prioridad, avisoId) {
  if (!whatsappReady()) {
    console.log('⚠️ WhatsApp API no configurada. Notificación omitida.');
    return { success: false, sent: 0, errors: 0, message: 'WhatsApp no configurado' };
  }

  try {
    const destinatarios = await getDestinatariosWhatsApp();
    if (!destinatarios.length) {
      console.log('📱 No hay vecinos con WhatsApp habilitado.');
      return { success: true, sent: 0, errors: 0, message: 'Sin destinatarios' };
    }

    let enviados = 0;
    let errores = 0;

    for (const usuario of destinatarios) {
      try {
        const textoFallback = `📢 Nuevo aviso (${tipo})\n\n${titulo}\n${mensaje}\n\n${siteUrl ? `${siteUrl}/avisos` : ''}`.trim();

        await sendTemplateOrText(
          usuario.whatsapp_phone,
          avisoTemplate,
          [
            {
              type: 'body',
              parameters: [
                { type: 'text', text: titulo },
                { type: 'text', text: tipo || 'general' },
                { type: 'text', text: prioridad || 'media' },
                { type: 'text', text: mensaje },
              ],
            },
            ...(siteUrl
              ? [
                  {
                    type: 'button',
                    sub_type: 'url',
                    index: '0',
                    parameters: [
                      { type: 'text', text: `${siteUrl}/avisos` },
                    ],
                  },
                ]
              : []),
          ],
          textoFallback
        );

        enviados++;
        await new Promise((resolve) => setTimeout(resolve, 800));
      } catch (error) {
        console.error('Error enviando WhatsApp (aviso):', error);
        errores++;
      }
    }

    return {
      success: true,
      sent: enviados,
      errors: errores,
      total: destinatarios.length,
    };
  } catch (error) {
    console.error('Error general en WhatsApp aviso:', error);
    return { success: false, error: error.message, sent: 0, errors: 0 };
  }
}
