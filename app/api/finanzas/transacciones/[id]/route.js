import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/finanzas/transacciones/[id]
 * Obtiene una transacción específica
 */
export async function GET(request, { params }) {
  try {
    const supabase = createClient();
    const { id } = params;

    // Verificar autenticación
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    // Obtener transacción
    const { data: transaccion, error } = await supabase
      .from('transacciones_financieras')
      .select(
        `
        *,
        categoria:categorias_transaccion(id, nombre, tipo, color, icono),
        balance:balances_anuales(id, año, estado),
        proyecto:proyectos(id, titulo),
        documentos:documentos_financieros(*)
      `
      )
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Transacción no encontrada' }, { status: 404 });
      }
      console.error('Error obteniendo transacción:', error);
      return NextResponse.json(
        { error: 'Error obteniendo transacción', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ transaccion });
  } catch (error) {
    console.error('Error en GET /api/finanzas/transacciones/[id]:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/finanzas/transacciones/[id]
 * Actualiza una transacción existente
 */
export async function PUT(request, { params }) {
  try {
    const supabase = createClient();
    const { id } = params;

    // Verificar autenticación
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    // Verificar rol
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

    // Obtener transacción existente para verificar balance_id
    const { data: transaccionExistente, error: existError } = await supabase
      .from('transacciones_financieras')
      .select('balance_id')
      .eq('id', id)
      .single();

    if (existError || !transaccionExistente) {
      return NextResponse.json({ error: 'Transacción no encontrada' }, { status: 404 });
    }

    // Obtener datos del body
    const body = await request.json();
    const {
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

    // Preparar objeto de actualización
    const updateData = {};

    if (categoria_id !== undefined) updateData.categoria_id = categoria_id;
    if (tipo && ['ingreso', 'egreso'].includes(tipo)) updateData.tipo = tipo;
    if (monto !== undefined && monto > 0) updateData.monto = monto;
    if (descripcion !== undefined && descripcion.trim().length > 0)
      updateData.descripcion = descripcion.trim();
    if (fecha) updateData.fecha = fecha;
    if (numero_comprobante !== undefined) updateData.numero_comprobante = numero_comprobante;
    if (metodo_pago !== undefined) updateData.metodo_pago = metodo_pago;
    if (beneficiario !== undefined) updateData.beneficiario = beneficiario;
    if (proyecto_id !== undefined) updateData.proyecto_id = proyecto_id;

    // Actualizar transacción
    const { data: transaccion, error: updateError } = await supabase
      .from('transacciones_financieras')
      .update(updateData)
      .eq('id', id)
      .select(
        `
        *,
        categoria:categorias_transaccion(nombre, tipo, color),
        balance:balances_anuales(año)
      `
      )
      .single();

    if (updateError) {
      console.error('Error actualizando transacción:', updateError);
      return NextResponse.json(
        { error: 'Error actualizando transacción', details: updateError.message },
        { status: 500 }
      );
    }

    // NOTA: Los totales del balance se actualizan automáticamente via trigger de BD

    return NextResponse.json({
      message: 'Transacción actualizada exitosamente',
      transaccion,
    });
  } catch (error) {
    console.error('Error en PUT /api/finanzas/transacciones/[id]:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/finanzas/transacciones/[id]
 * Elimina una transacción
 */
export async function DELETE(request, { params }) {
  try {
    const supabase = createClient();
    const { id } = params;

    // Verificar autenticación
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    // Verificar rol
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

    // Obtener transacción para tener el balance_id antes de eliminar
    const { data: transaccion, error: getError } = await supabase
      .from('transacciones_financieras')
      .select('balance_id')
      .eq('id', id)
      .single();

    if (getError || !transaccion) {
      return NextResponse.json({ error: 'Transacción no encontrada' }, { status: 404 });
    }

    const balanceId = transaccion.balance_id;

    // Eliminar transacción (los documentos se eliminan en cascada)
    const { error: deleteError } = await supabase
      .from('transacciones_financieras')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error eliminando transacción:', deleteError);
      return NextResponse.json(
        { error: 'Error eliminando transacción', details: deleteError.message },
        { status: 500 }
      );
    }

    // NOTA: Los totales del balance se actualizan automáticamente via trigger de BD

    return NextResponse.json({
      message: 'Transacción eliminada exitosamente',
    });
  } catch (error) {
    console.error('Error en DELETE /api/finanzas/transacciones/[id]:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error.message },
      { status: 500 }
    );
  }
}

// NOTA: La actualización de totales del balance se maneja automáticamente
// mediante el trigger 'trigger_actualizar_balance' en la base de datos
