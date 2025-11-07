import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  console.log('📥 [Turnstile API] Request recibido');

  try {
    const body = await request.json();
    console.log('📦 [Turnstile API] Body:', { hasToken: !!body.token });
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token no proporcionado' },
        { status: 400 }
      );
    }

    const secretKey = process.env.TURNSTILE_SECRET_KEY;
    console.log('🔑 [Turnstile API] Secret key configurada:', !!secretKey);

    if (!secretKey) {
      console.error('❌ [Turnstile API] TURNSTILE_SECRET_KEY no configurada');
      return NextResponse.json(
        { success: false, error: 'Configuración del servidor incompleta' },
        { status: 500 }
      );
    }

    // Verificar el token con Cloudflare Turnstile
    console.log('☁️ [Turnstile API] Enviando verificación a Cloudflare...');

    const verifyResponse = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          secret: secretKey,
          response: token,
        }),
      }
    );

    console.log('📡 [Turnstile API] Response status:', verifyResponse.status);

    if (!verifyResponse.ok) {
      console.error('❌ [Turnstile API] Cloudflare respondió con error:', verifyResponse.status);
      return NextResponse.json(
        { success: false, error: 'Error al comunicarse con Cloudflare' },
        { status: 500 }
      );
    }

    const verifyData = await verifyResponse.json();
    console.log('📦 [Turnstile API] Response data:', verifyData);

    console.log('🔒 Turnstile verification result:', {
      success: verifyData.success,
      challenge_ts: verifyData.challenge_ts,
      hostname: verifyData.hostname,
    });

    if (verifyData.success) {
      return NextResponse.json({
        success: true,
        message: 'Verificación exitosa',
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'Verificación de CAPTCHA fallida',
          'error-codes': verifyData['error-codes'],
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('❌ Error verificando Turnstile:', error);
    return NextResponse.json(
      { success: false, error: 'Error del servidor al verificar CAPTCHA' },
      { status: 500 }
    );
  }
}
