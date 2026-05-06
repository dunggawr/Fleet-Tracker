'use client';

import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-wrapper">
        <Header />
        <main className="content">
          {children}
        </main>
      </div>

      <style jsx global>{`
        .app-container {
          display: flex;
          min-height: 100vh;
          background: var(--color-background);
        }

        .main-wrapper {
          flex: 1;
          display: flex;
          flex-direction: column;
          margin-left: var(--sidebar-width);
          transition: margin-left var(--transition-normal);
        }

        /* Adjust margin when sidebar is collapsed */
        :global(.sidebar.collapsed) + .main-wrapper {
          margin-left: 80px;
        }

        .content {
          padding: var(--space-xl);
          flex: 1;
          overflow-y: auto;
        }
      `}</style>
    </div>
  );
}
