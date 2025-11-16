import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/finanzas/categorias
 * Obtiene todas las categorías de transacciones
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

    // Obtener parámetros
    const { searchParams } = new URL(request.url);
    const tipo = searchParams.get('tipo'); // ingreso o egreso
    const soloActivas = searchParams.get('activo') === 'true';

    // Construir query
    let query = supabase
      .from('categorias_transaccion')
      .select('*')
      .order('tipo', { ascending: true })
      .order('nombre', { ascending: true });

    if (tipo) {
      query = query.eq('tipo', tipo);
    }

    if (soloActivas) {
      query = query.eq('activo', true);
    }

    const { data: categorias, error } = await query;

    if (error) {
      console.error('Error obteniendo categorías:', error);
      return NextResponse.json(
        { error: 'Error obteniendo categorías', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ categorias });
  } catch (error) {
    console.error('Error en GET /api/finanzas/categorias:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error.message },
      { status: 500 }
    );
  }
}
