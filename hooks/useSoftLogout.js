'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

/**
 * Hook personalizado para logout suave que mantiene los estilos
 */
export const useSoftLogout = () => {
  const router = useRouter();
  const supabase = createClient();

  const softLogout = async () => {
    try {
      console.log('🔄 Iniciando logout...');

      // 1. Cerrar sesión en Supabase
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      console.log('✅ Sesión cerrada en Supabase');

      // 2. Limpiar almacenamiento local
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();

        // Limpiar cookies de Supabase específicamente
        const supabaseCookies = [
          'sb-access-token',
          'sb-refresh-token',
          'supabase-auth-token',
          'supabase.auth.token',
          'sb-kevjdxmubcdgpzwqreps-auth-token'
        ];

        supabaseCookies.forEach(cookieName => {
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
        });

        console.log('🍪 Almacenamiento limpiado');
      }

      // 3. IMPORTANTE: Usar window.location.href para forzar recarga completa
      // Esto limpia el cache del router de Next.js y previene mostrar dashboard anterior
      console.log('🔄 Forzando recarga completa...');
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }

    } catch (error) {
      console.error('❌ Error en logout:', error);
      // Fallback: forzar recarga de todas formas
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/';
      }
    }
  };

  return softLogout;
};

export default useSoftLogout;