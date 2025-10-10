'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Sidebar } from '@/components/dashboard/sidebar';
import { Header } from '@/components/dashboard/header';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/signin');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <Sidebar />
      <Header />
      {/* Main content area - margin-left: 260px (sidebar), padding-top: 72px (header) */}
      <main style={{ marginLeft: '260px', paddingTop: '72px' }}>
        {/* Body - padding: 24px all sides, gap: 24px */}
        <div style={{ padding: '24px' }}>
          {children}
        </div>
      </main>
    </div>
  );
}
