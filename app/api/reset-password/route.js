import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Log para verificar que el archivo se carga
console.log('[RESET-PASSWORD-API] Module loaded');

// Cliente de Supabase con Service Role (solo en servidor)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// GET endpoint para verificar que la ruta funciona
export async function GET(request) {
  console.log('[RESET-PASSWORD-API] ===== GET endpoint called =====');
  console.log('[RESET-PASSWORD-API] Route is WORKING!');
  console.log('[RESET-PASSWORD-API] Timestamp:', new Date().toISOString());

  return NextResponse.json({
    status: 'ok',
    message: 'Reset password API route is working',
    timestamp: new Date().toISOString(),
    env_check: {
      has_supabase_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      has_service_role_key: !!process.env.SUPABASE_SERVICE_ROLE_KEY
    }
  });
}

export async function POST(request) {
  console.log('[RESET-PASSWORD-API] POST endpoint called');

  try {
    const { userId, password } = await request.json();
    console.log('[RESET-PASSWORD-API] Request data:', { userId: userId ? 'present' : 'missing', passwordLength: password?.length || 0 });

    if (!userId || !password) {
      console.log('[RESET-PASSWORD-API] Missing parameters');
      return NextResponse.json(
        { error: 'Faltan parámetros requeridos' },
        { status: 400 }
      );
    }

    // Validar longitud de contraseña
    if (password.length < 6) {
      console.log('[RESET-PASSWORD-API] Password too short');
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      );
    }

    console.log('[RESET-PASSWORD-API] Calling Supabase Admin API updateUserById...');

    // Actualizar contraseña usando Admin API
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { password: password }
    );

    console.log('[RESET-PASSWORD-API] Supabase response:', { hasData: !!data, hasError: !!error });

    if (error) {
      console.error('[RESET-PASSWORD-API] Supabase error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    console.log('[RESET-PASSWORD-API] Password updated successfully');

    return NextResponse.json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    });

  } catch (error) {
    console.error('[RESET-PASSWORD-API] Exception:', error);
    return NextResponse.json(
      { error: error?.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
