import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

/**
 * API Route para logout server-side
 * Limpia completamente la sesión del usuario con alcance global
 */
export async function POST(request) {
  try {
    const supabase = createClient();

    // 1. Cerrar sesión en Supabase con alcance GLOBAL
    // Esto invalida la sesión en todos los dispositivos/pestañas
    const { error } = await supabase.auth.signOut({ scope: 'global' });

    if (error) {
      console.error('Error en logout server-side:', error);
      // Continuamos con la limpieza aunque haya error
    }

    // 2. Limpiar TODAS las cookies de Supabase manualmente
    const cookieStore = cookies();
    const allCookies = cookieStore.getAll();

    // Eliminar todas las cookies que empiecen con 'sb-' (prefijo de Supabase)
    const supabaseCookies = allCookies.filter(cookie => cookie.name.startsWith('sb-'));

    supabaseCookies.forEach(cookie => {
      try {
        cookieStore.delete({
          name: cookie.name,
          path: '/',
          domain: cookie.domain || undefined,
        });
      } catch (err) {
        console.error(`Error eliminando cookie ${cookie.name}:`, err);
      }
    });

    console.log(`Logout completado: ${supabaseCookies.length} cookies limpiadas`);

    // 3. Respuesta con headers anti-cache
    const response = NextResponse.json({ success: true }, { status: 200 });

    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Clear-Site-Data', '"cache", "cookies", "storage"');

    return response;

  } catch (error) {
    console.error('Error inesperado en logout:', error);
    return NextResponse.json(
      { success: false, error: 'Error al cerrar sesión' },
      { status: 500 }
    );
  }
}
