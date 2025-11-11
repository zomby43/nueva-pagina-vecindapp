'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { clearClientStorage } from '@/lib/auth/clearClientStorage';

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

      // 2. Limpiar almacenamiento local específico
      if (typeof window !== 'undefined') {
        clearClientStorage();

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

        console.log('🍪 Tokens de Supabase limpiados');
      }

      // 3. Navegación limpia usando el router de Next
      console.log('🔄 Redirigiendo al landing...');
      router.replace('/');
      router.refresh();

    } catch (error) {
      console.error('❌ Error en logout:', error);
      // Fallback: forzar recarga de todas formas
      if (typeof window !== 'undefined') {
        clearClientStorage();
        window.location.href = '/';
      }
    }
  };

  return softLogout;
};

export default useSoftLogout;
