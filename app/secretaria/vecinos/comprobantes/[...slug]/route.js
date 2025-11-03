// app/secretaria/vecinos/comprobantes/[...slug]/route.js
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const BUCKET = 'documentos'; // nombre de tu bucket en supabase

export async function GET(req, { params }) {
  try {
    const supabase = createClient();

    const file = Array.isArray(params.slug)
      ? params.slug.join('/')
      : params.slug;

    const path = `comprobantes/${file}`;

    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(path, 60 * 5); // 5 minutos

    if (data?.signedUrl) {
      return NextResponse.redirect(data.signedUrl);
    }

    const publicUrl = supabase.storage.from(BUCKET).getPublicUrl(path);

    if (publicUrl?.data?.publicUrl) {
      return NextResponse.redirect(publicUrl.data.publicUrl);
    }

    return NextResponse.json({ error: 'Archivo no encontrado' }, { status: 404 });

  } catch (err) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
