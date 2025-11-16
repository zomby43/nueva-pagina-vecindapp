import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/finanzas/balance
 * Obtiene el balance actual de la junta de vecinos
 */
export async function GET(request) {
  try {
    const supabase = createClient();

    // Verificar autenticación
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    // Obtener balance actual desde configuración
    const { data: config, error: configError } = await supabase
      .from('configuracion_financiera')
      .select('balance_actual, ultima_actualizacion')
      .single();

    if (configError) {
      console.error('Error obteniendo configuración financiera:', configError);
      return NextResponse.json(
        { error: 'Error obteniendo balance', details: configError.message },
        { status: 500 }
      );
    }

    // Obtener información del balance del año actual (opcional, para más contexto)
    const añoActual = new Date().getFullYear();
    const { data: balanceAño, error: balanceError } = await supabase
      .from('balances_anuales')
      .select('año, saldo_inicial, total_ingresos, total_egresos, saldo_final, estado')
      .eq('año', añoActual)
      .single();

    return NextResponse.json({
      balance_actual: config?.balance_actual || 0,
      ultima_actualizacion: config?.ultima_actualizacion,
      balance_año: balanceAño || null,
    });
  } catch (error) {
    console.error('Error en GET /api/finanzas/balance:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error.message },
      { status: 500 }
    );
  }
}
