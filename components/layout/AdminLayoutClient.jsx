'use client';

import { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import Header from './Header';
import { useIsSmallMobile, useIsExtraSmall } from '@/hooks/useMediaQuery';

export default function AdminLayoutClient({ children, initialUser, initialProfile }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isSmallMobile = useIsSmallMobile();
  const isExtraSmall = useIsExtraSmall();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  // Determine responsive padding
  const containerPadding = isExtraSmall ? '0 0.5rem' : isSmallMobile ? '0 0.75rem' : '0 2rem';
  const containerMargin = isSmallMobile ? '1rem auto' : '2rem auto';
  const containerGap = isSmallMobile ? '1rem' : '2rem';

  return (
    <div className="layout admin-layout">
      <Header
        className="admin-header"
        initialUser={initialUser}
        initialProfile={initialProfile}
        onToggleSidebar={toggleSidebar}
      />
      <div
        className="layout-container admin-layout-container"
        style={{
          maxWidth: '1400px',
          margin: containerMargin,
          padding: containerPadding,
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 280px) minmax(0, 1fr)',
          gap: containerGap,
          flex: 1,
          width: '100%'
        }}
      >
        <AdminSidebar isOpen={sidebarOpen} onClose={closeSidebar} />
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}
