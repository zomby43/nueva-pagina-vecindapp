import AdminSidebar from '@/components/layout/AdminSidebar';
import Header from '@/components/layout/Header';

export default function AdminLayout({ children }) {
  return (
    <div className="layout">
      <Header />
      <div className="layout-container">
        <AdminSidebar />
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}
