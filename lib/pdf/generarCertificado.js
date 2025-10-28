import { jsPDF } from 'jspdf';
import { getConfiguracion } from '../supabase/getConfiguracion';

/**
 * Genera un certificado de residencia en PDF con datos dinámicos
 * @param {Object} solicitud - Datos de la solicitud
 * @param {Object} vecino - Datos del vecino
 * @param {Object} config - Configuración de la organización
 * @returns {jsPDF} - Documento PDF generado
 */
export function generarCertificadoResidencia(solicitud, vecino, config) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'letter'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const centerX = pageWidth / 2;

  // BORDE DECORATIVO
  doc.setLineWidth(2);
  doc.setDrawColor(41, 128, 185);
  doc.rect(10, 10, pageWidth - 20, pageHeight - 20);
  doc.setLineWidth(0.5);
  doc.setDrawColor(52, 152, 219);
  doc.rect(12, 12, pageWidth - 24, pageHeight - 24);

  let yPosition = 30;

  // ENCABEZADO CON DATOS DINÁMICOS
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(41, 128, 185);
  doc.text(config.nombre_organizacion.toUpperCase(), centerX, yPosition, { align: 'center' });

  yPosition += 8;
  doc.setFontSize(18);
  doc.text(`UNIDAD VECINAL N°${config.numero_unidad_vecinal}`, centerX, yPosition, { align: 'center' });

  yPosition += 6;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`Comuna de ${config.comuna}, ${config.region}`, centerX, yPosition, { align: 'center' });

  yPosition += 15;
  doc.setDrawColor(41, 128, 185);
  doc.setLineWidth(0.5);
  doc.line(20, yPosition, pageWidth - 20, yPosition);
  yPosition += 15;

  // TÍTULO DEL CERTIFICADO
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('CERTIFICADO DE RESIDENCIA', centerX, yPosition, { align: 'center' });
  yPosition += 15;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100, 100, 100);
  doc.text(`N° ${solicitud.id.substring(0, 8).toUpperCase()}`, centerX, yPosition, { align: 'center' });
  yPosition += 15;

  // CUERPO
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  doc.text(`La Directiva de la ${config.nombre_organizacion} de la Unidad Vecinal N°${config.numero_unidad_vecinal},`, centerX, yPosition, { align: 'center' });
  yPosition += 7;
  doc.text('por medio del presente documento,', centerX, yPosition, { align: 'center' });
  yPosition += 12;

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('CERTIFICA QUE:', centerX, yPosition, { align: 'center' });
  yPosition += 12;

  // DATOS DEL VECINO
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  const nombreCompleto = `${vecino.nombres} ${vecino.apellidos}`.toUpperCase();
  doc.text(`Don/Doña: ${nombreCompleto}`, centerX, yPosition, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  yPosition += 10;
  doc.text(`RUT: ${vecino.rut}`, centerX, yPosition, { align: 'center' });
  yPosition += 10;
  doc.text(`Es residente de la dirección: ${vecino.direccion}`, centerX, yPosition, { align: 'center' });
  yPosition += 7;
  doc.text('Perteneciente a nuestra Unidad Vecinal.', centerX, yPosition, { align: 'center' });
  yPosition += 8;

  // MOTIVO
  if (solicitud.motivo) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(60, 60, 60);
    const textoMotivo = `Motivo de la solicitud: ${solicitud.motivo}`;
    const lineasMotivo = doc.splitTextToSize(textoMotivo, pageWidth - 60);
    lineasMotivo.forEach(linea => {
      doc.text(linea, centerX, yPosition, { align: 'center' });
      yPosition += 6;
    });
    yPosition += 6;
    doc.setTextColor(0, 0, 0);
  }

  // FECHA DE EMISIÓN
  yPosition += 10;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  const fechaEmision = solicitud.fecha_respuesta
    ? new Date(solicitud.fecha_respuesta).toLocaleDateString('es-CL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : new Date().toLocaleDateString('es-CL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

  doc.text(`Se extiende el presente certificado en ${config.comuna},`, centerX, yPosition, { align: 'center' });
  yPosition += 6;
  doc.text(`a ${fechaEmision}`, centerX, yPosition, { align: 'center' });

  // FIRMA
  yPosition = pageHeight - 60;
  doc.setLineWidth(0.5);
  doc.setDrawColor(0, 0, 0);
  doc.line(centerX - 30, yPosition, centerX + 30, yPosition);
  yPosition += 6;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  if (config.nombre_presidente) {
    doc.text(config.nombre_presidente.toUpperCase(), centerX, yPosition, { align: 'center' });
    yPosition += 5;
  }
  doc.text(config.cargo_presidente.toUpperCase(), centerX, yPosition, { align: 'center' });
  yPosition += 5;
  doc.setFont('helvetica', 'normal');
  doc.text(`${config.nombre_organizacion} N°${config.numero_unidad_vecinal}`, centerX, yPosition, { align: 'center' });

  // PIE DE PÁGINA
  yPosition = pageHeight - 25;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(120, 120, 120);
  doc.text(config.direccion, centerX, yPosition, { align: 'center' });
  yPosition += 4;
  const contacto = `Teléfono: ${config.telefono} | Email: ${config.email}`;
  doc.text(contacto, centerX, yPosition, { align: 'center' });

  return doc;
}

/**
 * Genera un certificado de antigüedad en PDF con datos dinámicos
 */
export function generarCertificadoAntiguedad(solicitud, vecino, config) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'letter'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const centerX = pageWidth / 2;

  // BORDE DECORATIVO
  doc.setLineWidth(2);
  doc.setDrawColor(41, 128, 185);
  doc.rect(10, 10, pageWidth - 20, pageHeight - 20);
  doc.setLineWidth(0.5);
  doc.setDrawColor(52, 152, 219);
  doc.rect(12, 12, pageWidth - 24, pageHeight - 24);

  let yPosition = 30;

  // ENCABEZADO CON DATOS DINÁMICOS
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(41, 128, 185);
  doc.text(config.nombre_organizacion.toUpperCase(), centerX, yPosition, { align: 'center' });

  yPosition += 8;
  doc.setFontSize(18);
  doc.text(`UNIDAD VECINAL N°${config.numero_unidad_vecinal}`, centerX, yPosition, { align: 'center' });

  yPosition += 6;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`Comuna de ${config.comuna}, ${config.region}`, centerX, yPosition, { align: 'center' });

  yPosition += 15;
  doc.setDrawColor(41, 128, 185);
  doc.setLineWidth(0.5);
  doc.line(20, yPosition, pageWidth - 20, yPosition);
  yPosition += 15;

  // TÍTULO
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('CERTIFICADO DE ANTIGÜEDAD', centerX, yPosition, { align: 'center' });
  yPosition += 15;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100, 100, 100);
  doc.text(`N° ${solicitud.id.substring(0, 8).toUpperCase()}`, centerX, yPosition, { align: 'center' });
  yPosition += 15;

  // CUERPO
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  doc.text(`La Directiva de la ${config.nombre_organizacion} de la Unidad Vecinal N°${config.numero_unidad_vecinal},`, centerX, yPosition, { align: 'center' });
  yPosition += 7;
  doc.text('por medio del presente documento,', centerX, yPosition, { align: 'center' });
  yPosition += 12;

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('CERTIFICA QUE:', centerX, yPosition, { align: 'center' });
  yPosition += 12;

  // DATOS
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  const nombreCompleto = `${vecino.nombres} ${vecino.apellidos}`.toUpperCase();
  doc.text(`Don/Doña: ${nombreCompleto}`, centerX, yPosition, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  yPosition += 10;
  doc.text(`RUT: ${vecino.rut}`, centerX, yPosition, { align: 'center' });
  yPosition += 10;
  doc.text(`Reside en: ${vecino.direccion}`, centerX, yPosition, { align: 'center' });
  yPosition += 12;

  // Calcular antigüedad
  const fechaRegistro = new Date(vecino.created_at);
  const ahora = new Date();
  const diffTiempo = Math.abs(ahora - fechaRegistro);
  const diffAnios = Math.floor(diffTiempo / (1000 * 60 * 60 * 24 * 365));
  const diffMeses = Math.floor((diffTiempo % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30));

  let textoAntiguedad = 'Desde hace ';
  if (diffAnios > 0) {
    textoAntiguedad += `${diffAnios} año${diffAnios > 1 ? 's' : ''}`;
    if (diffMeses > 0) {
      textoAntiguedad += ` y ${diffMeses} mes${diffMeses > 1 ? 'es' : ''}`;
    }
  } else {
    textoAntiguedad += `${diffMeses} mes${diffMeses > 1 ? 'es' : ''}`;
  }

  doc.setFont('helvetica', 'bold');
  doc.text(textoAntiguedad, centerX, yPosition, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  yPosition += 10;

  const fechaRegistroTexto = fechaRegistro.toLocaleDateString('es-CL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  doc.text(`(Registrado desde el ${fechaRegistroTexto})`, centerX, yPosition, { align: 'center' });
  yPosition += 15;

  // MOTIVO
  if (solicitud.motivo) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(60, 60, 60);
    const textoMotivo = `Motivo de la solicitud: ${solicitud.motivo}`;
    const lineasMotivo = doc.splitTextToSize(textoMotivo, pageWidth - 60);
    lineasMotivo.forEach(linea => {
      doc.text(linea, centerX, yPosition, { align: 'center' });
      yPosition += 6;
    });
    yPosition += 6;
    doc.setTextColor(0, 0, 0);
  }

  // FECHA DE EMISIÓN
  yPosition += 10;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  const fechaEmision = solicitud.fecha_respuesta
    ? new Date(solicitud.fecha_respuesta).toLocaleDateString('es-CL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : new Date().toLocaleDateString('es-CL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

  doc.text(`Se extiende el presente certificado en ${config.comuna},`, centerX, yPosition, { align: 'center' });
  yPosition += 6;
  doc.text(`a ${fechaEmision}`, centerX, yPosition, { align: 'center' });

  // FIRMA
  yPosition = pageHeight - 60;
  doc.setLineWidth(0.5);
  doc.setDrawColor(0, 0, 0);
  doc.line(centerX - 30, yPosition, centerX + 30, yPosition);
  yPosition += 6;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  if (config.nombre_presidente) {
    doc.text(config.nombre_presidente.toUpperCase(), centerX, yPosition, { align: 'center' });
    yPosition += 5;
  }
  doc.text(config.cargo_presidente.toUpperCase(), centerX, yPosition, { align: 'center' });
  yPosition += 5;
  doc.setFont('helvetica', 'normal');
  doc.text(`${config.nombre_organizacion} N°${config.numero_unidad_vecinal}`, centerX, yPosition, { align: 'center' });

  // PIE DE PÁGINA
  yPosition = pageHeight - 25;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(120, 120, 120);
  doc.text(config.direccion, centerX, yPosition, { align: 'center' });
  yPosition += 4;
  const contacto = `Teléfono: ${config.telefono} | Email: ${config.email}`;
  doc.text(contacto, centerX, yPosition, { align: 'center' });

  return doc;
}

/**
 * Función principal async que obtiene la configuración y genera el certificado
 */
export async function generarCertificado(solicitud, vecino) {
  const config = await getConfiguracion();

  if (solicitud.tipo === 'certificado_antiguedad') {
    return generarCertificadoAntiguedad(solicitud, vecino, config);
  } else {
    return generarCertificadoResidencia(solicitud, vecino, config);
  }
}

/**
 * Descarga el certificado generado
 */
export async function descargarCertificado(solicitud, vecino) {
  const doc = await generarCertificado(solicitud, vecino);

  const nombreArchivo = `certificado_${solicitud.tipo}_${vecino.rut.replace(/\./g, '')}_${new Date().getTime()}.pdf`;

  doc.save(nombreArchivo);
}
