import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/finanzas/transacciones
 * Obtiene lista de transacciones con filtros opcionales
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

    // Obtener parámetros de búsqueda
    const { searchParams } = new URL(request.url);
    const tipo = searchParams.get('tipo'); // ingreso o egreso
    const categoriaId = searchParams.get('categoria_id');
    const fechaDesde = searchParams.get('fecha_desde');
    const fechaHasta = searchParams.get('fecha_hasta');
    const balanceId = searchParams.get('balance_id');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Construir query
    let query = supabase
      .from('transacciones_financieras')
      .select(
        `
        *,
        categoria:categorias_transaccion(id, nombre, tipo, color, icono),
        balance:balances_anuales(id, año),
        proyecto:proyectos(id, titulo)
      `,
        { count: 'exact' }
      );

    // Aplicar filtros
    if (tipo) {
      query = query.eq('tipo', tipo);
    }
    if (categoriaId) {
      query = query.eq('categoria_id', categoriaId);
    }
    if (fechaDesde) {
      query = query.gte('fecha', fechaDesde);
    }
    if (fechaHasta) {
      query = query.lte('fecha', fechaHasta);
    }
    if (balanceId) {
      query = query.eq('balance_id', balanceId);
    }

    // Ordenar y paginar
    query = query.order('fecha', { ascending: false }).range(offset, offset + limit - 1);

    const { data: transacciones, error, count } = await query;

    if (error) {
      console.error('Error obteniendo transacciones:', error);
      return NextResponse.json(
        { error: 'Error obteniendo transacciones', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      transacciones,
      total: count,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Error en GET /api/finanzas/transacciones:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/finanzas/transacciones
 * Crea una nueva transacción financiera
 */
export async function POST(request) {
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

    // Verificar rol (solo secretaria y admin pueden crear transacciones)
    const { data: usuario, error: userError } = await supabase
      .from('usuarios')
      .select('rol, estado')
      .eq('id', user.id)
      .single();

    if (userError || !usuario || !['secretaria', 'admin'].includes(usuario.rol)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    if (usuario.estado !== 'activo') {
      return NextResponse.json({ error: 'Usuario no activo' }, { status: 403 });
    }

    // Obtener datos del body
    const body = await request.json();
    const {
      balance_id,
      categoria_id,
      tipo,
      monto,
      descripcion,
      fecha,
      numero_comprobante,
      metodo_pago,
      beneficiario,
      proyecto_id,
    } = body;

    // Validaciones
    if (!tipo || !['ingreso', 'egreso'].includes(tipo)) {
      return NextResponse.json({ error: 'Tipo inválido (ingreso o egreso)' }, { status: 400 });
    }

    if (!monto || monto <= 0) {
      return NextResponse.json({ error: 'Monto debe ser mayor a 0' }, { status: 400 });
    }

    if (!descripcion || descripcion.trim().length === 0) {
      return NextResponse.json({ error: 'Descripción es requerida' }, { status: 400 });
    }

    // Si no se proporciona balance_id, usar el del año actual
    let balanceIdFinal = balance_id;
    if (!balanceIdFinal) {
      const añoActual = new Date().getFullYear();
      const { data: balance, error: balanceError } = await supabase
        .from('balances_anuales')
        .select('id')
        .eq('año', añoActual)
        .single();

      if (balanceError || !balance) {
        return NextResponse.json(
          { error: 'No se encontró el balance del año actual' },
          { status: 400 }
        );
      }
      balanceIdFinal = balance.id;
    }

    // Crear transacción
    const { data: transaccion, error: insertError } = await supabase
      .from('transacciones_financieras')
      .insert({
        balance_id: balanceIdFinal,
        categoria_id: categoria_id || null,
        tipo,
        monto,
        descripcion: descripcion.trim(),
        fecha: fecha || new Date().toISOString().split('T')[0],
        numero_comprobante: numero_comprobante || null,
        metodo_pago: metodo_pago || null,
        beneficiario: beneficiario || null,
        proyecto_id: proyecto_id || null,
        created_by: user.id,
      })
      .select(
        `
        *,
        categoria:categorias_transaccion(nombre, tipo, color),
        balance:balances_anuales(año)
      `
      )
      .single();

    if (insertError) {
      console.error('Error creando transacción:', insertError);
      return NextResponse.json(
        { error: 'Error creando transacción', details: insertError.message },
        { status: 500 }
      );
    }

    // NOTA: Los totales del balance se actualizan automáticamente via trigger de BD

    return NextResponse.json({
      message: 'Transacción creada exitosamente',
      transaccion,
    });
  } catch (error) {
    console.error('Error en POST /api/finanzas/transacciones:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error.message },
      { status: 500 }
    );
  }
}

// NOTA: La actualización de totales del balance se maneja automáticamente
// mediante el trigger 'trigger_actualizar_balance' en la base de datos
