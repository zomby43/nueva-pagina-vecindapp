import { jsPDF } from 'jspdf';

export async function generarComprobanteReserva(reserva, espacio, solicitante, configuracion) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (2 * margin);

  // Colores
  const colorPrimario = [67, 159, 164]; // #439fa4
  const colorSecundario = [21, 71, 101]; // #154765
  const colorGris = [191, 211, 217]; // #bfd3d9

  // ========================================
  // ENCABEZADO
  // ========================================
  // Borde decorativo superior
  doc.setFillColor(...colorPrimario);
  doc.rect(0, 0, pageWidth, 15, 'F');

  // Título del documento
  doc.setFontSize(22);
  doc.setTextColor(...colorSecundario);
  doc.setFont('helvetica', 'bold');
  doc.text('COMPROBANTE DE RESERVA', pageWidth / 2, 30, { align: 'center' });

  // Línea decorativa
  doc.setDrawColor(...colorPrimario);
  doc.setLineWidth(0.5);
  doc.line(margin, 38, pageWidth - margin, 38);

  // ========================================
  // INFORMACIÓN DE LA JUNTA DE VECINOS
  // ========================================
  let yPos = 50;

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...colorSecundario);
  doc.text(configuracion?.nombre_organizacion || 'JUNTA DE VECINOS', pageWidth / 2, yPos, { align: 'center' });

  yPos += 7;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);

  if (configuracion?.rut_organizacion) {
    doc.text(`RUT: ${configuracion.rut_organizacion}`, pageWidth / 2, yPos, { align: 'center' });
    yPos += 5;
  }

  if (configuracion?.direccion && configuracion?.comuna) {
    doc.text(
      `${configuracion.direccion}, ${configuracion.comuna}${configuracion.region ? ', ' + configuracion.region : ''}`,
      pageWidth / 2,
      yPos,
      { align: 'center' }
    );
    yPos += 5;
  }

  yPos += 10;

  // ========================================
  // INFORMACIÓN DE LA RESERVA
  // ========================================
  // Caja de información principal
  doc.setFillColor(244, 248, 249); // #f4f8f9
  doc.roundedRect(margin, yPos, contentWidth, 60, 3, 3, 'F');

  yPos += 10;

  // Título de sección
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...colorPrimario);
  doc.text('DATOS DE LA RESERVA', margin + 5, yPos);

  yPos += 8;

  // Detalles de la reserva
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);

  const detallesReserva = [
    { label: 'Espacio Reservado:', valor: espacio.nombre },
    { label: 'Ubicación:', valor: espacio.ubicacion || 'No especificada' },
    { label: 'Fecha:', valor: formatearFecha(reserva.fecha_reserva) },
    { label: 'Horario:', valor: getBloqueTexto(reserva.bloque_horario) },
  ];

  if (reserva.num_asistentes) {
    detallesReserva.push({ label: 'Asistentes:', valor: `${reserva.num_asistentes} personas` });
  }

  detallesReserva.forEach(detalle => {
    doc.setFont('helvetica', 'bold');
    doc.text(detalle.label, margin + 8, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(detalle.valor, margin + 50, yPos);
    yPos += 6;
  });

  yPos += 15;

  // ========================================
  // INFORMACIÓN DEL SOLICITANTE
  // ========================================
  doc.setFillColor(244, 248, 249);
  doc.roundedRect(margin, yPos, contentWidth, 35, 3, 3, 'F');

  yPos += 10;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...colorPrimario);
  doc.text('SOLICITANTE', margin + 5, yPos);

  yPos += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);

  const detallesSolicitante = [
    { label: 'Nombre:', valor: `${solicitante.nombres} ${solicitante.apellidos}` },
    { label: 'Email:', valor: solicitante.email },
  ];

  if (solicitante.telefono) {
    detallesSolicitante.push({ label: 'Teléfono:', valor: solicitante.telefono });
  }

  detallesSolicitante.forEach(detalle => {
    doc.setFont('helvetica', 'bold');
    doc.text(detalle.label, margin + 8, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(detalle.valor, margin + 50, yPos);
    yPos += 6;
  });

  yPos += 15;

  // ========================================
  // MOTIVO DE LA RESERVA
  // ========================================
  doc.setFillColor(244, 248, 249);
  const motivoHeight = Math.max(30, Math.ceil(reserva.motivo.length / 80) * 6 + 15);
  doc.roundedRect(margin, yPos, contentWidth, motivoHeight, 3, 3, 'F');

  yPos += 10;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...colorPrimario);
  doc.text('MOTIVO DE LA RESERVA', margin + 5, yPos);

  yPos += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);

  const motivoLineas = doc.splitTextToSize(reserva.motivo, contentWidth - 16);
  doc.text(motivoLineas, margin + 8, yPos);

  yPos += motivoHeight + 5;

  // ========================================
  // INFORMACIÓN DE APROBACIÓN
  // ========================================
  if (reserva.aprobador && reserva.fecha_aprobacion) {
    doc.setFillColor(212, 237, 218); // Verde claro
    doc.roundedRect(margin, yPos, contentWidth, 20, 3, 3, 'F');

    yPos += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(21, 87, 36); // Verde oscuro
    doc.text('✓ RESERVA APROBADA', margin + 8, yPos);

    yPos += 6;

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    doc.text(
      `Aprobado el ${formatearFechaHora(reserva.fecha_aprobacion)}`,
      margin + 8,
      yPos
    );

    yPos += 15;
  }

  // ========================================
  // CONDICIONES Y OBSERVACIONES
  // ========================================
  if (espacio.observaciones) {
    doc.setFillColor(255, 243, 205); // Amarillo claro
    const obsHeight = Math.max(25, Math.ceil(espacio.observaciones.length / 80) * 6 + 15);
    doc.roundedRect(margin, yPos, contentWidth, obsHeight, 3, 3, 'F');

    yPos += 10;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(133, 100, 4); // Amarillo oscuro
    doc.text('OBSERVACIONES Y CONDICIONES DE USO', margin + 5, yPos);

    yPos += 7;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);

    const obsLineas = doc.splitTextToSize(espacio.observaciones, contentWidth - 16);
    doc.text(obsLineas, margin + 8, yPos);

    yPos += obsHeight + 5;
  }

  // ========================================
  // PIE DE PÁGINA
  // ========================================
  // Línea divisoria
  const footerY = pageHeight - 40;
  doc.setDrawColor(...colorGris);
  doc.setLineWidth(0.5);
  doc.line(margin, footerY, pageWidth - margin, footerY);

  // Texto de pie de página
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(120, 120, 120);
  doc.text(
    'Este comprobante tiene validez oficial para el uso del espacio reservado.',
    pageWidth / 2,
    footerY + 8,
    { align: 'center' }
  );

  doc.text(
    'Debe ser presentado el día de la reserva. Ley 19.418 - Juntas de Vecinos y Organizaciones Comunitarias.',
    pageWidth / 2,
    footerY + 13,
    { align: 'center' }
  );

  // Fecha de emisión
  doc.setFontSize(7);
  doc.text(
    `Comprobante generado el ${new Date().toLocaleString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}`,
    pageWidth / 2,
    footerY + 20,
    { align: 'center' }
  );

  // ID de la reserva
  doc.text(
    `ID de Reserva: ${reserva.id.substring(0, 8).toUpperCase()}`,
    pageWidth / 2,
    footerY + 25,
    { align: 'center' }
  );

  // Borde decorativo inferior
  doc.setFillColor(...colorPrimario);
  doc.rect(0, pageHeight - 10, pageWidth, 10, 'F');

  // ========================================
  // GUARDAR PDF
  // ========================================
  const nombreArchivo = `Comprobante_Reserva_${espacio.nombre.replace(/\s+/g, '_')}_${reserva.fecha_reserva}.pdf`;
  doc.save(nombreArchivo);
}

// Funciones auxiliares
function formatearFecha(fecha) {
  return new Date(fecha).toLocaleDateString('es-CL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function formatearFechaHora(fecha) {
  return new Date(fecha).toLocaleString('es-CL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function getBloqueTexto(bloque) {
  const textos = {
    manana: 'Mañana (9:00 - 13:00 hrs)',
    tarde: 'Tarde (14:00 - 18:00 hrs)',
    noche: 'Noche (19:00 - 23:00 hrs)',
    dia_completo: 'Día Completo (9:00 - 23:00 hrs)'
  };
  return textos[bloque] || bloque;
}
