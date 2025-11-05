import AdminLayoutClient from '@/components/layout/AdminLayoutClient';
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
    <AdminLayoutClient
      initialUser={headerUser}
      initialProfile={headerProfile}
    >
      {children}
    </AdminLayoutClient>
  );
}
