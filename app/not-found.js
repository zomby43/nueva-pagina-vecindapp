import Link from 'next/link';

export default function NotFound() {
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
            fontSize: '6rem', 
            margin: '0',
            color: '#439fa4',
            fontWeight: 'bold'
          }}>404</h1>
        </div>
        
        <h2 style={{ 
          fontSize: '1.5rem',
          color: '#154765',
          marginBottom: '1rem'
        }}>Página no encontrada</h2>
        
        <p style={{ 
          color: '#439fa4', 
          marginBottom: '2rem' 
        }}>
          Lo sentimos, la página que buscas no existe o ha sido movida.
        </p>
        
        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <Link 
            href="/" 
            style={{
              backgroundColor: '#439fa4',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              textDecoration: 'none',
              fontSize: '1rem',
              display: 'inline-block'
            }}
          >
            Volver al inicio
          </Link>
          
          <Link 
            href="/dashboard" 
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
            Ir al Dashboard
          </Link>
        </div>
        
        <div style={{ marginTop: '2rem' }}>
          <h5 style={{ 
            fontSize: '1rem',
            color: '#154765',
            marginBottom: '0.5rem'
          }}>¿Necesitas ayuda?</h5>
          <p style={{ 
            color: '#439fa4',
            fontSize: '0.9rem',
            margin: '0'
          }}>
            Puedes navegar usando el menú principal o contactar con la administración.
          </p>
        </div>
      </div>
    </div>
  );
}