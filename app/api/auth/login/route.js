import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request) {
  console.log('🔵 Login API route called');

  try {
    const body = await request.json();
    console.log('📝 Body received');

    const { email, password } = body;

    // Validar datos de entrada
    if (!email || !password) {
      console.log('❌ Validation failed: missing credentials');
      return NextResponse.json(
        { error: 'Email y contraseña son requeridos' },
        { status: 400 }
      );
    }

    console.log('🔧 Creating Supabase client...');
    const supabase = createClient();
    console.log('✅ Supabase client created');

    // Intentar login con Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      console.error('Error de autenticación:', authError);

      // Mensajes de error específicos para debug
      if (authError.message.includes('Invalid login credentials')) {
        return NextResponse.json(
          { error: 'Credenciales inválidas. Verifica tu email y contraseña.' },
          { status: 401 }
        );
      }

      if (authError.message.includes('Email not confirmed')) {
        return NextResponse.json(
          { error: 'Email no confirmado. Revisa tu correo para confirmar tu cuenta.' },
          { status: 401 }
        );
      }

      return NextResponse.json(
        { error: 'Error al iniciar sesión. Intenta nuevamente.' },
        { status: 401 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'No se pudo obtener información del usuario' },
        { status: 500 }
      );
    }

    // Obtener perfil del usuario desde la base de datos
    const { data: userProfile, error: profileError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError) {
      console.error('Error al obtener perfil:', profileError);

      // Si el usuario existe en Auth pero no tiene perfil, es un error de datos
      return NextResponse.json(
        { error: 'Perfil de usuario no encontrado. Contacta al administrador.' },
        { status: 404 }
      );
    }

    if (!userProfile) {
      return NextResponse.json(
        { error: 'Perfil de usuario no encontrado' },
        { status: 404 }
      );
    }

    // Verificar si el usuario está aprobado
    if (userProfile.estado === 'pendiente_aprobacion') {
      return NextResponse.json(
        {
          error: 'Tu cuenta está pendiente de aprobación por la secretaría.',
          estado: 'pendiente_aprobacion'
        },
        { status: 403 }
      );
    }

    if (userProfile.estado === 'rechazado') {
      return NextResponse.json(
        { error: 'Tu cuenta ha sido rechazada. Contacta a la secretaría.' },
        { status: 403 }
      );
    }

    if (userProfile.estado !== 'activo') {
      return NextResponse.json(
        { error: 'Tu cuenta no está activa. Contacta al administrador.' },
        { status: 403 }
      );
    }

    // Determinar ruta de redirección basada en el rol
    let redirectUrl = '/dashboard';

    switch (userProfile.rol) {
      case 'admin':
        redirectUrl = '/admin/dashboard';
        break;
      case 'secretaria':
        redirectUrl = '/secretaria/dashboard';
        break;
      case 'vecino':
        redirectUrl = '/dashboard';
        break;
      default:
        redirectUrl = '/dashboard';
    }

    // Login exitoso - devolver datos del usuario y URL de redirección
    const response = NextResponse.json(
      {
        success: true,
        user: {
          id: userProfile.id,
          email: authData.user.email,
          rol: userProfile.rol,
          estado: userProfile.estado,
          nombre: userProfile.nombre,
          apellido: userProfile.apellido,
          rut: userProfile.rut,
        },
        redirectUrl,
      },
      { status: 200 }
    );

    // Configurar headers anti-cache
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;

  } catch (error) {
    console.error('❌ Error inesperado en login:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      {
        error: 'Error interno del servidor. Intenta nuevamente.',
        details: error.message
      },
      { status: 500 }
    );
  }
}
