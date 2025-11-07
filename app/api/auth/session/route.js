import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request) {
  try {
    const supabase = createClient();

    // Obtener sesión actual
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      console.error('Error al obtener sesión:', sessionError);
      return NextResponse.json(
        { authenticated: false, user: null },
        { status: 200 }
      );
    }

    if (!session || !session.user) {
      return NextResponse.json(
        { authenticated: false, user: null },
        { status: 200 }
      );
    }

    // Obtener perfil del usuario
    const { data: userProfile, error: profileError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (profileError || !userProfile) {
      console.error('Error al obtener perfil:', profileError);
      return NextResponse.json(
        { authenticated: false, user: null },
        { status: 200 }
      );
    }

    // Devolver sesión válida con perfil completo
    const response = NextResponse.json(
      {
        authenticated: true,
        user: {
          id: userProfile.id,
          email: session.user.email,
          rol: userProfile.rol,
          estado: userProfile.estado,
          nombre: userProfile.nombre,
          apellido: userProfile.apellido,
          rut: userProfile.rut,
          direccion: userProfile.direccion,
          telefono: userProfile.telefono,
          created_at: userProfile.created_at,
        },
      },
      { status: 200 }
    );

    // Headers anti-cache
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;

  } catch (error) {
    console.error('Error inesperado al verificar sesión:', error);
    return NextResponse.json(
      { authenticated: false, user: null },
      { status: 200 }
    );
  }
}
