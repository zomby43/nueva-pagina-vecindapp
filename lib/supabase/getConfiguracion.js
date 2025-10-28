import { createClient } from './client';

/**
 * Obtiene la configuración de la organización desde Supabase
 * @returns {Promise<Object>} Configuración de la organización
 */
export async function getConfiguracion() {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('configuracion_organizacion')
      .select('*')
      .limit(1)
      .single();

    if (error) {
      console.error('Error fetching configuracion:', error);
      // Retornar configuración por defecto si hay error
      return getConfiguracionDefault();
    }

    return data || getConfiguracionDefault();
  } catch (error) {
    console.error('Error en getConfiguracion:', error);
    return getConfiguracionDefault();
  }
}

/**
 * Retorna configuración por defecto
 * @returns {Object} Configuración por defecto
 */
function getConfiguracionDefault() {
  return {
    numero_unidad_vecinal: 'XX',
    nombre_organizacion: 'Junta de Vecinos',
    comuna: 'Santiago',
    region: 'Región Metropolitana',
    direccion: 'Calle Principal #123, Santiago',
    telefono: '+56 9 1234 5678',
    email: 'contacto@juntavecinos.cl',
    sitio_web: '',
    nombre_presidente: '',
    cargo_presidente: 'Presidente/a',
    rut_organizacion: '',
    fecha_constitucion: null,
    numero_personalidad_juridica: ''
  };
}
