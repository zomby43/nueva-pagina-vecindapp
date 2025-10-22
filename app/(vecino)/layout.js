import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';

export default function VecinoLayout({ children }) {
  return (
    <div className="layout" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#d8e7eb' }}>
      <Header />
      <div className="layout-container" style={{
        maxWidth: '1400px',
        margin: '2rem auto',
        padding: '0 2rem',
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 280px) minmax(0, 1fr)',
        gap: '2rem',
        flex: 1,
        width: '100%'
      }}>
        <Sidebar />
        <main className="main-content" style={{ minHeight: '600px' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
