/**
 * Utilidades para manejo correcto de fechas sin problemas de timezone
 *
 * Problema: Cuando se guarda "2025-11-25" en la DB y se lee con new Date("2025-11-25"),
 * JavaScript lo interpreta como medianoche UTC, que en Chile (UTC-3/4) se muestra como el día anterior.
 *
 * Solución: Forzar que las fechas siempre se interpreten en hora local.
 */

/**
 * Parsea una fecha en formato YYYY-MM-DD a un objeto Date en hora local
 * @param {string} dateString - Fecha en formato YYYY-MM-DD
 * @returns {Date} Objeto Date en hora local
 */
export function parseDateLocal(dateString) {
  if (!dateString) return null;

  // Agregar T00:00:00 para forzar interpretación local
  const [year, month, day] = dateString.split('-');
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
}

/**
 * Formatea una fecha a YYYY-MM-DD en hora local
 * @param {Date|string} date - Fecha a formatear
 * @returns {string} Fecha en formato YYYY-MM-DD
 */
export function formatDateLocal(date) {
  if (!date) return '';

  const d = typeof date === 'string' ? parseDateLocal(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

/**
 * Formatea una fecha para mostrar en español (sin problemas de timezone)
 * @param {string} dateString - Fecha en formato YYYY-MM-DD
 * @param {object} options - Opciones de formato (opcional)
 * @returns {string} Fecha formateada en español
 */
export function formatearFechaLocal(dateString, options = {}) {
  if (!dateString) return '';

  const date = parseDateLocal(dateString);

  const defaultOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'America/Santiago' // Forzar zona horaria de Chile
  };

  return date.toLocaleDateString('es-CL', { ...defaultOptions, ...options });
}

/**
 * Formatea una fecha y hora para mostrar en español
 * @param {string} datetimeString - Fecha/hora ISO
 * @param {object} options - Opciones de formato (opcional)
 * @returns {string} Fecha/hora formateada en español
 */
export function formatearFechaHoraLocal(datetimeString, options = {}) {
  if (!datetimeString) return '';

  const date = new Date(datetimeString);

  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Santiago'
  };

  return date.toLocaleString('es-CL', { ...defaultOptions, ...options });
}

/**
 * Compara si dos fechas son el mismo día (ignorando timezone)
 * @param {string|Date} date1 - Primera fecha
 * @param {string|Date} date2 - Segunda fecha
 * @returns {boolean} true si son el mismo día
 */
export function isSameDay(date1, date2) {
  const d1 = typeof date1 === 'string' ? parseDateLocal(date1) : date1;
  const d2 = typeof date2 === 'string' ? parseDateLocal(date2) : date2;

  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
}

/**
 * Obtiene la fecha actual en formato YYYY-MM-DD (hora local)
 * @returns {string} Fecha actual en formato YYYY-MM-DD
 */
export function getTodayLocal() {
  const today = new Date();
  return formatDateLocal(today);
}

/**
 * Verifica si una fecha es pasada (comparando solo el día, no la hora)
 * @param {string} dateString - Fecha en formato YYYY-MM-DD
 * @returns {boolean} true si la fecha es anterior a hoy
 */
export function isPastDate(dateString) {
  const date = parseDateLocal(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);

  return date < today;
}
