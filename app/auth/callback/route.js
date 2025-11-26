import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const requestUrl = new URL(request.url);
  const token_hash = requestUrl.searchParams.get('token_hash');
  const type = requestUrl.searchParams.get('type');
  const next = requestUrl.searchParams.get('next') || '/login';

  console.log('🔐 [Auth Callback] Iniciando verificación de email');
  console.log('📋 Type:', type);
  console.log('🔑 Token hash presente:', !!token_hash);

  if (token_hash && type) {
    const supabase = await createClient();

    try {
      // Verificar el token de email
      const { data, error } = await supabase.auth.verifyOtp({
        type,
        token_hash,
      });

      if (error) {
        console.error('❌ [Auth Callback] Error verificando email:', error);
        return NextResponse.redirect(
          new URL('/login?error=verification_failed&message=' + encodeURIComponent(error.message), requestUrl.origin)
        );
      }

      console.log('✅ [Auth Callback] Email verificado exitosamente');
      console.log('👤 Usuario:', data?.user?.email);

      // Redirigir al login con mensaje de éxito
      return NextResponse.redirect(
        new URL('/login?verified=true', requestUrl.origin)
      );
    } catch (error) {
      console.error('❌ [Auth Callback] Error inesperado:', error);
      return NextResponse.redirect(
        new URL('/login?error=unexpected', requestUrl.origin)
      );
    }
  }

  // Si no hay token, redirigir al login
  console.warn('⚠️ [Auth Callback] No se encontró token_hash');
  return NextResponse.redirect(new URL('/login', requestUrl.origin));
}
