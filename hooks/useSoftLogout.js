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
      console.log('🔄 Iniciando logout suave...');
      
      // 1. Cerrar sesión en Supabase
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

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
        });
      }

      // 3. Redirección suave usando Next.js router
      console.log('🏠 Redirigiendo a página principal...');
      router.push('/');
      
      // 4. Forzar actualización del estado si es necesario
      setTimeout(() => {
        router.refresh();
      }, 100);
      
    } catch (error) {
      console.error('❌ Error en logout suave:', error);
      // Fallback: redirección directa
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
        router.push('/');
      }
    }
  };

  return softLogout;
};

export default useSoftLogout;