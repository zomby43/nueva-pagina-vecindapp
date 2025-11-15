const API_VERSION = process.env.WHATSAPP_API_VERSION || 'v18.0';
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

function isConfigured() {
  return Boolean(PHONE_NUMBER_ID && ACCESS_TOKEN);
}

export function sanitizeWhatsAppNumber(number) {
  if (!number) return null;
  return number.replace(/[^\d]/g, '');
}

async function sendWhatsAppMessage(payload) {
  if (!isConfigured()) {
    console.warn('⚠️ WhatsApp API no está configurada. Mensaje omitido.');
    return {
      success: false,
      error: 'WhatsApp no configurado',
    };
  }

  const url = `https://graph.facebook.com/${API_VERSION}/${PHONE_NUMBER_ID}/messages`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        ...payload,
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error('❌ Error enviando mensaje de WhatsApp:', data);
      return {
        success: false,
        error: data?.error?.message || 'Error enviando mensaje',
        details: data,
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('❌ Error inesperado enviando mensaje de WhatsApp:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

export function sendWhatsAppText(to, body, options = {}) {
  const formatted = sanitizeWhatsAppNumber(to);
  if (!formatted) {
    return Promise.resolve({ success: false, error: 'Número de WhatsApp inválido' });
  }

  return sendWhatsAppMessage({
    to: formatted,
    type: 'text',
    text: {
      preview_url: Boolean(options.preview_url),
      body,
    },
  });
}

export function sendWhatsAppTemplate(to, templateName, components = []) {
  const formatted = sanitizeWhatsAppNumber(to);
  if (!formatted) {
    return Promise.resolve({ success: false, error: 'Número de WhatsApp inválido' });
  }

  return sendWhatsAppMessage({
    to: formatted,
    type: 'template',
    template: {
      name: templateName,
      language: {
        code: process.env.WHATSAPP_TEMPLATE_LANG || 'es',
      },
      ...(components.length ? { components } : {}),
    },
  });
}

export function whatsappReady() {
  return isConfigured();
}
