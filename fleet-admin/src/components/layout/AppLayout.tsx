'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  console.log('AppLayout: isSidebarCollapsed =', isSidebarCollapsed);
  
  const isLoginPage = pathname === '/login';

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !isLoginPage) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, isLoginPage, router]);

  useEffect(() => {
    if (isSidebarCollapsed) {
      document.body.classList.add('sidebar-collapsed');
      document.body.style.setProperty('--sidebar-width', '80px');
    } else {
      document.body.classList.remove('sidebar-collapsed');
      document.body.style.setProperty('--sidebar-width', '260px');
    }
  }, [isSidebarCollapsed]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar collapsed={isSidebarCollapsed} onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
      <div 
        className="flex-1 flex flex-col transition-all duration-200"
        style={{ marginLeft: isSidebarCollapsed ? '80px' : '260px' }}
      >
        <Header />
        <main className="p-lg flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
