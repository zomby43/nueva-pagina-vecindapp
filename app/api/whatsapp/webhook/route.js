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

function buildHelpMessage() {
  return `👋 ¡Hola! Bienvenido a VecindApp.

*Comandos disponibles:*

📱 *VINCULAR [RUT]* - Vincular tu cuenta
   Ejemplo: VINCULAR 12345678-9

📰 *NOTICIAS* - Ver últimas noticias

📢 *AVISOS* - Ver avisos activos

👤 *PERFIL* - Ver tu información

🔕 *DESVINCULAR* - Dejar de recibir notificaciones

❓ *AYUDA* - Ver este mensaje

_Nota: Los comandos no distinguen mayúsculas/minúsculas_`;
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

async function handleNoticias(from) {
  const supabase = createClient();

  const { data: noticias, error } = await supabase
    .from('noticias')
    .select('titulo, resumen, categoria, fecha_publicacion')
    .eq('estado', 'publicado')
    .order('fecha_publicacion', { ascending: false })
    .limit(3);

  if (error || !noticias || noticias.length === 0) {
    await sendWhatsAppText(from, '📰 No hay noticias publicadas en este momento.');
    return;
  }

  let mensaje = '*📰 Últimas Noticias*\n\n';

  noticias.forEach((noticia, index) => {
    const fecha = new Date(noticia.fecha_publicacion).toLocaleDateString('es-CL');
    mensaje += `${index + 1}. *${noticia.titulo}*\n`;
    mensaje += `📂 ${noticia.categoria} | 📅 ${fecha}\n`;
    if (noticia.resumen) {
      mensaje += `${noticia.resumen.substring(0, 100)}...\n`;
    }
    mensaje += `\n`;
  });

  mensaje += '_Visita la plataforma web para ver más detalles_';
  await sendWhatsAppText(from, mensaje);
}

async function handleAvisos(from) {
  const supabase = createClient();

  const { data: avisos, error } = await supabase
    .from('avisos')
    .select('titulo, mensaje, tipo, prioridad, fecha_inicio')
    .eq('estado', 'activo')
    .order('prioridad', { ascending: false })
    .order('fecha_inicio', { ascending: false })
    .limit(5);

  if (error || !avisos || avisos.length === 0) {
    await sendWhatsAppText(from, '📢 No hay avisos activos en este momento.');
    return;
  }

  let mensaje = '*📢 Avisos Activos*\n\n';

  avisos.forEach((aviso, index) => {
    const fecha = new Date(aviso.fecha_inicio).toLocaleDateString('es-CL');
    const emoji = aviso.prioridad === 'alta' ? '🔴' : aviso.prioridad === 'media' ? '🟡' : '🟢';
    mensaje += `${emoji} *${aviso.titulo}*\n`;
    mensaje += `${aviso.mensaje.substring(0, 80)}...\n`;
    mensaje += `📅 ${fecha}\n\n`;
  });

  mensaje += '_Visita la plataforma web para más información_';
  await sendWhatsAppText(from, mensaje);
}

async function handlePerfil(from) {
  const supabase = createClient();

  const { data: usuario, error } = await supabase
    .from('usuarios')
    .select('nombres, apellidos, rut, email, direccion, rol, estado, preferencia_notificacion')
    .eq('whatsapp_phone', from)
    .single();

  if (error || !usuario) {
    await sendWhatsAppText(
      from,
      '❌ No tienes una cuenta vinculada.\n\nUsa VINCULAR para conectar tu cuenta.'
    );
    return;
  }

  const mensaje = `*👤 Tu Perfil*

*Nombre:* ${usuario.nombres} ${usuario.apellidos}
*RUT:* ${usuario.rut}
*Email:* ${usuario.email}
*Dirección:* ${usuario.direccion || 'No especificada'}
*Estado:* ${usuario.estado}
*Notificaciones:* ${formatPreferenceLabel(usuario.preferencia_notificacion)}`;

  await sendWhatsAppText(from, mensaje);
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

          switch (upper) {
            case 'VINCULAR':
              await handleVincularCommand(from, rest.join(' '));
              break;

            case 'DESVINCULAR':
              await handleDesvincular(from);
              break;

            case 'NOTICIAS':
              await handleNoticias(from);
              break;

            case 'AVISOS':
              await handleAvisos(from);
              break;

            case 'PERFIL':
              await handlePerfil(from);
              break;

            case 'AYUDA':
            case 'HELP':
            case 'HOLA':
            case 'START':
              await sendWhatsAppText(from, buildHelpMessage());
              break;

            default:
              await sendWhatsAppText(
                from,
                `No entendí el comando "${command}". Usa *AYUDA* para ver los comandos disponibles.`
              );
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
