import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const formData = await request.formData();

    // Extraer datos del formulario
    const email = formData.get('email');
    const password = formData.get('password');
    const nombre = formData.get('nombre');
    const apellido = formData.get('apellido');
    const rut = formData.get('rut');
    const direccion = formData.get('direccion');
    const telefono = formData.get('telefono');
    const comprobante = formData.get('comprobante');

    // Validar datos requeridos
    if (!email || !password || !nombre || !apellido || !rut || !direccion) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }

    if (!comprobante || !(comprobante instanceof File)) {
      return NextResponse.json(
        { error: 'Debes subir un comprobante de domicilio (imagen o PDF)' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // 1. Crear usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nombre,
          apellido,
        },
      },
    });

    if (authError) {
      console.error('Error al crear usuario en Auth:', authError);

      if (authError.message.includes('User already registered')) {
        return NextResponse.json(
          { error: 'Este email ya está registrado. Intenta iniciar sesión.' },
          { status: 409 }
        );
      }

      if (authError.message.includes('Password should be at least')) {
        return NextResponse.json(
          { error: 'La contraseña debe tener al menos 6 caracteres.' },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: 'Error al crear cuenta. Intenta nuevamente.' },
        { status: 500 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'No se pudo crear el usuario' },
        { status: 500 }
      );
    }

    const userId = authData.user.id;

    // 2. Subir comprobante a Supabase Storage
    const fileExtension = comprobante.name.split('.').pop();
    const fileName = `${userId}_${Date.now()}.${fileExtension}`;
    const filePath = `comprobantes/${fileName}`;

    const fileBuffer = await comprobante.arrayBuffer();
    const fileBytes = new Uint8Array(fileBuffer);

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documentos')
      .upload(filePath, fileBytes, {
        contentType: comprobante.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Error al subir comprobante:', uploadError);

      // Si falla el upload, eliminar usuario de Auth
      await supabase.auth.admin.deleteUser(userId);

      return NextResponse.json(
        { error: 'Error al subir el comprobante. Intenta nuevamente.' },
        { status: 500 }
      );
    }

    // 3. Crear perfil en tabla usuarios
    const { error: profileError } = await supabase
      .from('usuarios')
      .insert({
        id: userId,
        email,
        nombre,
        apellido,
        rut,
        direccion,
        telefono: telefono || null,
        comprobante_domicilio: filePath,
        rol: 'vecino',
        estado: 'pendiente_aprobacion',
      });

    if (profileError) {
      console.error('Error al crear perfil:', profileError);

      // Si falla la creación del perfil, limpiar archivo y usuario
      await supabase.storage.from('documentos').remove([filePath]);
      await supabase.auth.admin.deleteUser(userId);

      return NextResponse.json(
        { error: 'Error al crear perfil de usuario. Intenta nuevamente.' },
        { status: 500 }
      );
    }

    // Registro exitoso
    const response = NextResponse.json(
      {
        success: true,
        message: 'Registro exitoso. Tu cuenta está pendiente de aprobación por la secretaría.',
      },
      { status: 201 }
    );

    // Headers anti-cache
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;

  } catch (error) {
    console.error('Error inesperado en registro:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor. Intenta nuevamente.' },
      { status: 500 }
    );
  }
}
