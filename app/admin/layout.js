import AdminSidebar from '@/components/layout/AdminSidebar';
import Header from '@/components/layout/Header';
import { createClient } from '@/lib/supabase/server';

export default async function AdminLayout({ children }) {
  const supabase = createClient();

  let headerUser = null;
  let headerProfile = null;

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      headerUser = { id: user.id, email: user.email };

      const { data: profile } = await supabase
        .from('usuarios')
        .select('id, nombres, apellidos, rol, estado')
        .eq('id', user.id)
        .single();

      if (profile) {
        headerProfile = profile;
      }
    }
  } catch (error) {
    console.error('Error cargando datos iniciales del admin:', error);
  }

  return (
    <div className="layout admin-layout" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#d8e7eb' }}>
      <Header className="admin-header" initialUser={headerUser} initialProfile={headerProfile} />
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
        <AdminSidebar />
        <main className="main-content" style={{ minHeight: '600px' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
