import { createClient } from '@supabase/supabase-js';

/**
 * Cliente de Supabase con Service Role para operaciones administrativas.
 * Este cliente ignora las políticas RLS, por lo que debe usarse únicamente
 * en entornos seguros (Route Handlers, Server Actions, cron jobs).
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL no está configurado');
  }

  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY no está configurado');
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}
