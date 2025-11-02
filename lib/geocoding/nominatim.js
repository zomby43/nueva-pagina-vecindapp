/**
 * Utilidad de Geocodificación usando Nominatim (OpenStreetMap)
 *
 * Nominatim es el servicio de geocodificación gratuito de OpenStreetMap.
 * Políticas de uso: https://operations.osmfoundation.org/policies/nominatim/
 * - Máximo 1 request por segundo
 * - Incluir User-Agent identificable
 * - No realizar miles de requests automáticos
 */

// Rate limiting: almacenar timestamp del último request
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000; // 1 segundo en milisegundos

/**
 * Geocodifica una dirección chilena a coordenadas lat/lng
 * @param {string} direccion - Dirección completa del vecino
 * @param {string} comuna - Comuna/ciudad (opcional, mejora precisión)
 * @returns {Promise<{lat: number, lng: number, display_name: string} | null>}
 */
export async function geocodificarDireccion(direccion, comuna = 'Chile') {
  if (!direccion || direccion.trim() === '') {
    console.warn('⚠️ Dirección vacía, no se puede geocodificar');
    return null;
  }

  try {
    // Rate limiting: esperar si es necesario
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
      const waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
      console.log(`⏳ Esperando ${waitTime}ms para respetar rate limit de Nominatim...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    // Construir query de búsqueda
    const query = `${direccion}, ${comuna}`;
    const encodedQuery = encodeURIComponent(query);

    // Construir URL de Nominatim
    const url = `https://nominatim.openstreetmap.org/search?` +
      `q=${encodedQuery}` +
      `&format=json` +
      `&addressdetails=1` +
      `&limit=1` +
      `&countrycodes=cl`; // Limitar a Chile para mejor precisión

    console.log('🌍 Geocodificando:', query);

    // Hacer request a Nominatim
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'VecindApp/1.0 (https://vecindapp.cl)' // Identificar la app
      }
    });

    // Actualizar timestamp del último request
    lastRequestTime = Date.now();

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data = await response.json();

    // Verificar si se encontraron resultados
    if (!data || data.length === 0) {
      console.warn('⚠️ No se encontraron resultados para:', query);
      return null;
    }

    const resultado = data[0];

    console.log('✅ Geocodificación exitosa:', resultado.display_name);

    return {
      lat: parseFloat(resultado.lat),
      lng: parseFloat(resultado.lon),
      display_name: resultado.display_name,
      accuracy: resultado.type // tipo de resultado (house, street, city, etc.)
    };

  } catch (error) {
    console.error('❌ Error en geocodificación:', error);
    return null;
  }
}

/**
 * Geocodifica múltiples direcciones con rate limiting automático
 * @param {Array<{id: string, direccion: string, comuna?: string}>} direcciones
 * @returns {Promise<Array<{id: string, lat: number, lng: number}>>}
 */
export async function geocodificarMultiple(direcciones) {
  const resultados = [];

  for (const item of direcciones) {
    const coords = await geocodificarDireccion(item.direccion, item.comuna);

    if (coords) {
      resultados.push({
        id: item.id,
        lat: coords.lat,
        lng: coords.lng,
        display_name: coords.display_name,
        accuracy: coords.accuracy
      });
    } else {
      console.warn(`⚠️ No se pudo geocodificar: ${item.direccion} (ID: ${item.id})`);
    }
  }

  return resultados;
}

/**
 * Verifica si las coordenadas necesitan ser actualizadas
 * @param {Date} geocodedAt - Timestamp de última geocodificación
 * @param {number} maxDaysOld - Días máximos de antigüedad (default: 90)
 * @returns {boolean}
 */
export function necesitaActualizacion(geocodedAt, maxDaysOld = 90) {
  if (!geocodedAt) {
    return true; // Nunca se ha geocodificado
  }

  const now = new Date();
  const geocodedDate = new Date(geocodedAt);
  const daysDiff = (now - geocodedDate) / (1000 * 60 * 60 * 24);

  return daysDiff > maxDaysOld;
}

/**
 * Calcula la distancia entre dos puntos en kilómetros (fórmula de Haversine)
 * @param {number} lat1 - Latitud punto 1
 * @param {number} lng1 - Longitud punto 1
 * @param {number} lat2 - Latitud punto 2
 * @param {number} lng2 - Longitud punto 2
 * @returns {number} Distancia en kilómetros
 */
export function calcularDistancia(lat1, lng1, lat2, lng2) {
  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distancia = R * c;

  return distancia;
}

/**
 * Valida que las coordenadas estén dentro de Chile
 * @param {number} lat - Latitud
 * @param {number} lng - Longitud
 * @returns {boolean}
 */
export function coordenadasValidasChile(lat, lng) {
  // Límites aproximados de Chile continental
  // Latitud: -56° (Cabo de Hornos) a -17° (Arica)
  // Longitud: -76° (oeste) a -66° (este)
  return lat >= -56 && lat <= -17 && lng >= -76 && lng <= -66;
}
