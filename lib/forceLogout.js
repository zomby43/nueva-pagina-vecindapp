'use client';

import { clearClientStorage } from '@/lib/auth/clearClientStorage';

/**
 * Función de logout de emergencia que limpia todo
 * Se puede usar cuando el AuthContext no funciona correctamente
 */
export const forceLogout = () => {
  console.log('🚨 LOGOUT DE EMERGENCIA ACTIVADO');
  
  try {
    if (typeof window !== 'undefined') {
      clearClientStorage();
      
      // Limpiar todas las cookies
      document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
      });
      console.log('✅ cookies limpiadas');
      
      // Limpiar cookies específicas de Supabase
      const supabaseCookies = [
        'sb-access-token',
        'sb-refresh-token', 
        'supabase-auth-token',
        'supabase.auth.token',
        'sb-kevjdxmubcdgpzwqreps-auth-token'
      ];
      
      supabaseCookies.forEach(cookieName => {
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname};`;
      });
      console.log('✅ cookies de Supabase limpiadas');
      
      console.log('🔄 Redirigiendo a página principal...');
      
      // Intentar redirección suave primero
      if (window.history && window.history.pushState) {
        window.history.pushState(null, '', '/');
        window.location.reload();
      } else {
        // Fallback: redirección directa
        window.location.href = '/';
      }
    }
  } catch (error) {
    console.error('❌ Error en logout de emergencia:', error);
    // Si todo falla, al menos recargar la página
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  }
};

// Hacer disponible globalmente para debug
if (typeof window !== 'undefined') {
  window.forceLogout = forceLogout;
  console.log('🛠️ función forceLogout() disponible globalmente para debug');
}

export default forceLogout;
