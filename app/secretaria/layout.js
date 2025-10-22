import SecretariaSidebar from '@/components/layout/SecretariaSidebar';
import Header from '@/components/layout/Header';

export default function SecretariaLayout({ children }) {
  return (
    <div className="layout">
      <Header />
      <div className="layout-container">
        <SecretariaSidebar />
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}
