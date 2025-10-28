/**
 * Utilidad para enviar correos electrónicos usando Supabase
 * 
 * Nota: Supabase tiene limitaciones para enviar emails personalizados.
 * Para producción, considera usar servicios como Resend, SendGrid o Mailgun.
 * 
 * Esta implementación usa una API route que puede ser configurada
 * con cualquier servicio de email.
 */

/**
 * Envía un correo de aprobación de registro
 */
export async function enviarCorreoAprobacionRegistro(destinatario, nombreCompleto) {
  try {
    const response = await fetch('/api/emails/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tipo: 'aprobacion_registro',
        destinatario,
        nombreCompleto,
      }),
    });

    if (!response.ok) {
      throw new Error('Error al enviar el correo');
    }

    return await response.json();
  } catch (error) {
    console.error('Error enviando correo de aprobación de registro:', error);
    throw error;
  }
}

/**
 * Envía un correo de aprobación de solicitud de certificado
 */
export async function enviarCorreoAprobacionSolicitud(destinatario, nombreCompleto, tipoSolicitud) {
  try {
    const response = await fetch('/api/emails/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tipo: 'aprobacion_solicitud',
        destinatario,
        nombreCompleto,
        tipoSolicitud,
      }),
    });

    if (!response.ok) {
      throw new Error('Error al enviar el correo');
    }

    return await response.json();
  } catch (error) {
    console.error('Error enviando correo de aprobación de solicitud:', error);
    throw error;
  }
}

/**
 * Envía un correo de rechazo de solicitud
 */
export async function enviarCorreoRechazoSolicitud(destinatario, nombreCompleto, tipoSolicitud, motivo) {
  try {
    const response = await fetch('/api/emails/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tipo: 'rechazo_solicitud',
        destinatario,
        nombreCompleto,
        tipoSolicitud,
        motivo,
      }),
    });

    if (!response.ok) {
      throw new Error('Error al enviar el correo');
    }

    return await response.json();
  } catch (error) {
    console.error('Error enviando correo de rechazo de solicitud:', error);
    throw error;
  }
}

/**
 * Envía un correo cuando se crea una nueva solicitud de reserva
 */
export async function enviarCorreoSolicitudReserva(destinatario, nombreCompleto, espacio, fechaReserva, bloqueHorario) {
  try {
    const response = await fetch('/api/emails/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tipo: 'solicitud_reserva',
        destinatario,
        nombreCompleto,
        espacio,
        fechaReserva,
        bloqueHorario,
      }),
    });

    if (!response.ok) {
      throw new Error('Error al enviar el correo');
    }

    return await response.json();
  } catch (error) {
    console.error('Error enviando correo de solicitud de reserva:', error);
    throw error;
  }
}

/**
 * Envía un correo cuando se aprueba una reserva
 */
export async function enviarCorreoAprobacionReserva(destinatario, nombreCompleto, espacio, fechaReserva, bloqueHorario) {
  try {
    const response = await fetch('/api/emails/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tipo: 'aprobacion_reserva',
        destinatario,
        nombreCompleto,
        espacio,
        fechaReserva,
        bloqueHorario,
      }),
    });

    if (!response.ok) {
      throw new Error('Error al enviar el correo');
    }

    return await response.json();
  } catch (error) {
    console.error('Error enviando correo de aprobación de reserva:', error);
    throw error;
  }
}

/**
 * Envía un correo cuando se rechaza una reserva
 */
export async function enviarCorreoRechazoReserva(destinatario, nombreCompleto, espacio, fechaReserva, bloqueHorario, motivo) {
  try {
    const response = await fetch('/api/emails/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tipo: 'rechazo_reserva',
        destinatario,
        nombreCompleto,
        espacio,
        fechaReserva,
        bloqueHorario,
        motivo,
      }),
    });

    if (!response.ok) {
      throw new Error('Error al enviar el correo');
    }

    return await response.json();
  } catch (error) {
    console.error('Error enviando correo de rechazo de reserva:', error);
    throw error;
  }
}

/**
 * Envía un correo cuando se aprueba un proyecto vecinal
 */
export async function enviarCorreoAprobacionProyecto(destinatario, nombreCompleto, tituloProyecto) {
  try {
    const response = await fetch('/api/emails/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tipo: 'aprobacion_proyecto',
        destinatario,
        nombreCompleto,
        tituloProyecto,
      }),
    });

    if (!response.ok) {
      throw new Error('Error al enviar el correo');
    }

    return await response.json();
  } catch (error) {
    console.error('Error enviando correo de aprobación de proyecto:', error);
    throw error;
  }
}

/**
 * Envía un correo cuando se rechaza un proyecto vecinal
 */
export async function enviarCorreoRechazoProyecto(destinatario, nombreCompleto, tituloProyecto, motivo) {
  try {
    const response = await fetch('/api/emails/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tipo: 'rechazo_proyecto',
        destinatario,
        nombreCompleto,
        tituloProyecto,
        motivo,
      }),
    });

    if (!response.ok) {
      throw new Error('Error al enviar el correo');
    }

    return await response.json();
  } catch (error) {
    console.error('Error enviando correo de rechazo de proyecto:', error);
    throw error;
  }
}
