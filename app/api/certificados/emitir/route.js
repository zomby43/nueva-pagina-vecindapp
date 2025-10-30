// app/api/certificados/emitir/route.js
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function POST(req) {
  try {
    const body = await req.json();
    const { nombre, rut, direccion, comuna, ciudad } = body;

    // Validación mínima
    if (!nombre || !rut || !direccion || !comuna || !ciudad) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
    }

    // Cliente SSR con sesión (RLS) — usa ANON + cookies
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          get: (key) => cookieStore.get(key)?.value,
          set: (key, value, options) => cookieStore.set({ name: key, value, ...options }),
          remove: (key, options) => cookieStore.set({ name: key, value: "", ...options }),
        },
      }
    );

    // (Opcional) guardar quién emitió
    const { data: { user } } = await supabase.auth.getUser();
    const emitido_por = user?.id ?? null;

    // Inserta registro; Postgres asigna folio (identity)
    const { data, error } = await supabase
      .from("certificados")
      .insert([{ nombre, rut, direccion, comuna, ciudad, emitido_por }])
      .select("folio")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ folio: data.folio });
  } catch (e) {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
