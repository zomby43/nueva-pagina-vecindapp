'use client';

import { useEffect } from 'react';

/**
 * Componente de diagnóstico para verificar el estado de los estilos CSS
 */
export default function StyleDiagnostic() {
  useEffect(() => {
    const checkStyles = () => {
      // Verificar si Bootstrap está cargado
      const hasBootstrap = document.querySelector('link[href*="bootstrap"]') ||
                          getComputedStyle(document.body).getPropertyValue('--bs-primary');
      
      // Verificar si globals.css está cargado
      const hasGlobals = document.querySelector('link[href*="globals.css"]') ||
                        getComputedStyle(document.documentElement).getPropertyValue('--bg');
      
      // Verificar si hay estilos en general
      const hasAnyStyles = document.head.querySelectorAll('style, link[rel="stylesheet"]').length > 0;
      
      console.log('🎨 Diagnóstico de estilos:', {
        bootstrap: hasBootstrap ? '✅' : '❌',
        globals: hasGlobals ? '✅' : '❌',
        anyStyles: hasAnyStyles ? '✅' : '❌',
        stylesheets: document.head.querySelectorAll('link[rel="stylesheet"]').length,
        inlineStyles: document.head.querySelectorAll('style').length
      });
      
      // Si no hay estilos, intentar una recarga suave
      if (!hasAnyStyles || (!hasBootstrap && !hasGlobals)) {
        console.warn('⚠️ Estilos perdidos detectados, intentando recarga...');
        // Esperar un poco antes de recargar para evitar loops
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    };
    
    // Verificar estilos cuando el componente se monta
    checkStyles();
    
    // Verificar estilos después de navegación
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          // Si se agregaron o quitaron elementos del head, verificar estilos
          if (mutation.target === document.head) {
            setTimeout(checkStyles, 100);
          }
        }
      });
    });
    
    observer.observe(document.head, { childList: true, subtree: true });
    
    return () => observer.disconnect();
  }, []);
  
  // Este componente no renderiza nada visible
  return null;
}

export { StyleDiagnostic };