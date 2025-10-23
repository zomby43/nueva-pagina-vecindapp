import { createBrowserClient } from '@supabase/ssr';

/**
 * Cliente de Supabase para uso en el navegador (Client Components)
 * Este cliente se usa en componentes que se ejecutan en el navegador
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
