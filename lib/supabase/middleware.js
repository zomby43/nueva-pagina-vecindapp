import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

/**
 * Cliente de Supabase para uso en Middleware
 * Maneja la renovación de sesiones y cookies de autenticación
 */
export async function updateSession(request) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANTE: Evita escribir ninguna lógica entre createServerClient y
  // supabase.auth.getUser(). Un simple error podría hacer que el usuario
  // sea deslogueado aleatoriamente.

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Obtener perfil del usuario con rol desde la tabla usuarios
  let userProfile = null;
  if (user) {
    const { data } = await supabase
      .from('usuarios')
      .select('rol, estado')
      .eq('id', user.id)
      .single();

    userProfile = data;
  }

  return { supabaseResponse, user, userProfile };
}
