'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('🚨 Error en la aplicación:', error);
    
    // Verificar si los estilos están cargados
    const hasStyles = document.querySelector('link[href*="globals.css"]') || 
                     document.querySelector('style[data-next-styled]') ||
                     document.head.querySelector('style');
    
    if (!hasStyles) {
      console.warn('⚠️ Los estilos CSS no están cargados correctamente');
      // Intentar recargar los estilos
      window.location.reload();
    }
  }, [error]);

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ 
      backgroundColor: '#d8e7eb',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div className="text-center" style={{ 
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '16px',
        boxShadow: '0 2px 8px rgba(21, 71, 101, 0.1)',
        maxWidth: '500px',
        margin: '1rem'
      }}>
        <div className="mb-4">
          <h1 style={{ 
            fontSize: '4rem', 
            margin: '0',
            color: '#fb7185'
          }}>⚠️</h1>
        </div>
        
        <h2 style={{ 
          fontSize: '1.5rem',
          color: '#154765',
          marginBottom: '1rem'
        }}>¡Oops! Algo salió mal</h2>
        
        <p style={{ 
          color: '#439fa4', 
          marginBottom: '2rem' 
        }}>
          Ocurrió un error inesperado. Por favor, intenta nuevamente.
        </p>
        
        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => reset()}
            style={{
              backgroundColor: '#439fa4',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            Intentar nuevamente
          </button>
          
          <Link 
            href="/" 
            style={{
              backgroundColor: 'transparent',
              color: '#154765',
              border: '2px solid #154765',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              textDecoration: 'none',
              fontSize: '1rem',
              display: 'inline-block'
            }}
          >
            Volver al inicio
          </Link>
        </div>
        
        {process.env.NODE_ENV === 'development' && (
          <details style={{ marginTop: '2rem', textAlign: 'left' }}>
            <summary style={{ 
              cursor: 'pointer',
              color: '#439fa4',
              fontSize: '0.9rem'
            }}>
              Ver detalles del error
            </summary>
            <pre style={{ 
              marginTop: '1rem',
              padding: '1rem',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              fontSize: '0.8rem',
              overflow: 'auto',
              maxHeight: '200px'
            }}>
              {error?.message}
              {error?.stack}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}