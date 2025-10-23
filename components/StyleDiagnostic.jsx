'use client';

import { useEffect } from 'react';

/**
 * Componente de diagnóstico para verificar el estado de los estilos CSS
 * Solo reporta en consola, NO recarga la página para evitar loops
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

      // Solo advertir, NO recargar automáticamente
      if (!hasAnyStyles || (!hasBootstrap && !hasGlobals)) {
        console.warn('⚠️ Estilos perdidos detectados. Los estilos inline deberían mantener el diseño funcional.');
      }
    };

    // Verificar estilos cuando el componente se monta
    // Esperar a que el DOM esté completamente cargado
    const timeoutId = setTimeout(checkStyles, 500);

    return () => clearTimeout(timeoutId);
  }, []);

  // Este componente no renderiza nada visible
  return null;
}

export { StyleDiagnostic };