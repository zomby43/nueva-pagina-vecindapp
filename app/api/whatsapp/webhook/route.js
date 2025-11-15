import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  addChannelToPreference,
  formatPreferenceLabel,
  removeChannelFromPreference,
} from '@/lib/notifications/preferences';
import { sanitizeWhatsAppNumber, sendWhatsAppText } from '@/lib/whatsapp/client';

export async function GET(request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new Response(challenge || '', { status: 200 });
  }

  return new Response('Error de verificación', { status: 403 });
}

function buildHelpMessage(rut) {
  const rutExample = rut || '12345678-9';
  return `👋 ¡Hola! Para vincular tu cuenta VecindApp responde con:

VINCULAR ${rutExample}

Si deseas dejar de recibir avisos, escribe:
DESVINCULAR`;
}

async function handleVincularCommand(from, rutInput) {
  const supabase = createClient();
  const rut = (rutInput || '').trim();

  if (!rut) {
    await sendWhatsAppText(from, '❌ Debes incluir tu RUT. Ejemplo: VINCULAR 12345678-9');
    return;
  }

  const { data: usuario, error } = await supabase
    .from('usuarios')
    .select('id, nombres, apellidos, preferencia_notificacion, estado')
    .eq('rut', rut)
    .single();

  if (error || !usuario || usuario.estado !== 'activo') {
    await sendWhatsAppText(
      from,
      '❌ No encontramos una cuenta activa con ese RUT. Asegúrate de que tu cuenta esté aprobada.'
    );
    return;
  }

  const newPreference = addChannelToPreference(usuario.preferencia_notificacion, 'whatsapp');

  const { error: updateError } = await supabase
    .from('usuarios')
    .update({
      whatsapp_phone: from,
      whatsapp_opt_in: true,
      preferencia_notificacion: newPreference,
    })
    .eq('id', usuario.id);

  if (updateError) {
    console.error('Error actualizando WhatsApp del usuario:', updateError);
    await sendWhatsAppText(from, '⚠️ Hubo un error al vincular tu cuenta. Intenta más tarde.');
    return;
  }

  await sendWhatsAppText(
    from,
    `✅ Vinculación exitosa, ${usuario.nombres}.\n\nRecibirás avisos y noticias por WhatsApp.\nPreferencias actuales: ${formatPreferenceLabel(
      newPreference
    )}`
  );
}

async function handleDesvincular(from) {
  const supabase = createClient();

  const { data: usuario, error } = await supabase
    .from('usuarios')
    .select('id, preferencia_notificacion')
    .eq('whatsapp_phone', from)
    .single();

  if (error || !usuario) {
    await sendWhatsAppText(from, '⚠️ No encontramos tu cuenta vinculada.');
    return;
  }

  const newPreference = removeChannelFromPreference(usuario.preferencia_notificacion, 'whatsapp');

  const { error: updateError } = await supabase
    .from('usuarios')
    .update({
      whatsapp_phone: null,
      whatsapp_opt_in: false,
      preferencia_notificacion: newPreference,
    })
    .eq('id', usuario.id);

  if (updateError) {
    console.error('Error desvinculando WhatsApp:', updateError);
    await sendWhatsAppText(from, '⚠️ No pudimos desvincular tu número. Intenta más tarde.');
    return;
  }

  await sendWhatsAppText(from, '✅ Dejaste de recibir notificaciones por WhatsApp.');
}

export async function POST(request) {
  try {
    const body = await request.json();
    const entries = body.entry || [];

    for (const entry of entries) {
      const changes = entry.changes || [];
      for (const change of changes) {
        const value = change.value || {};
        const messages = value.messages || [];

        for (const message of messages) {
          const from = sanitizeWhatsAppNumber(message.from);
          if (!from) continue;

          if (message.type !== 'text') {
            await sendWhatsAppText(from, '📬 Gracias por tu mensaje. Usa VINCULAR o DESVINCULAR.');
            continue;
          }

          const textBody = message.text?.body?.trim() || '';
          const [command, ...rest] = textBody.split(/\s+/);
          const upper = command?.toUpperCase();

          if (upper === 'VINCULAR') {
            await handleVincularCommand(from, rest.join(' '));
          } else if (upper === 'DESVINCULAR') {
            await handleDesvincular(from);
          } else {
            await sendWhatsAppText(from, buildHelpMessage(rest[0]));
          }
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Error en webhook de WhatsApp:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
